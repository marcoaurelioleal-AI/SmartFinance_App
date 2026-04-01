import React, { useState, useContext, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  TouchableWithoutFeedback,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FinanceContext } from '../context/FinanceContext';
import { COLORS } from '../theme/colors';
import { consultarIA } from '../services/geminiService';

export default function ChatAiScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { transactions, balance } = useContext(FinanceContext);
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      role: 'ai',
      text: 'Olá! Sou seu assistente financeiro inteligente. Peça dicas sobre seus gastos e eu analisarei seu comportamento atual.',
    },
  ]);
  const [loading, setLoading] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const scrollViewRef = useRef();

  const handleConsultAI = async (customPrompt) => {
    Keyboard.dismiss();
    const promptText = customPrompt || 'Pode analisar meus gastos e me dar algumas dicas?';

    const userMsg = {
      id: Date.now().toString() + '_u',
      role: 'user',
      text: promptText,
    };
    
    setMessages((prev) => [...prev, userMsg]);
    setInputValue('');
    setLoading(true);

    try {
      // Chamada assíncrona ao serviço da IA com injeção de contexto financeiro real.
      const response = await consultarIA(balance, transactions, promptText);
      const aiMsg = {
        id: Date.now().toString() + '_a',
        role: 'ai',
        text: response,
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (error) {
      // Tratamento de erros robusto para garantir que o usuário sempre tenha feedback visual.
      const errorMsg = {
        id: Date.now().toString() + '_e',
        role: 'ai',
        text: error.message,
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
    >
      {/* Header Fixo */}
      <View style={[styles.header, { paddingTop: Math.max(insets.top, 20) + 10 }]}>
        <Text style={styles.title}>🤖 Consultor IA</Text>
        <TouchableOpacity 
          style={styles.closeButton} 
          onPress={() => navigation.navigate('Início')}
        >
          <MaterialIcons name="close" size={24} color={COLORS.textSecondary} />
        </TouchableOpacity>
      </View>

      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={{ flex: 1 }}>
          <ScrollView
            style={styles.chatArea}
            contentContainerStyle={styles.chatContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            ref={scrollViewRef}
            // Auto-scroll: Garante que a mensagem mais recente esteja sempre visível ao abrir o teclado.
            onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
          >
            {messages.map((msg) => (
              <View
                key={msg.id}
                style={[
                  styles.messageBubble,
                  msg.role === 'user' ? styles.userBubble : styles.aiBubble,
                ]}
              >
                <Text style={styles.messageText}>{msg.text}</Text>
              </View>
            ))}

             {loading && (
              <View style={[styles.messageBubble, styles.aiBubble, { paddingVertical: 18, flexDirection: 'row', alignItems: 'center' }]}>
                <ActivityIndicator size="small" color={COLORS.aquamarine} style={{ marginRight: 10 }} />
                <Text style={{ color: COLORS.textSecondary, fontSize: 14 }}>
                  Analisando finanças...
                </Text>
              </View>
            )}
          </ScrollView>
        </View>
      </TouchableWithoutFeedback>

      {/* Input Area fixa na parte inferior */}
      <View style={[styles.inputContainer, { paddingBottom: Platform.OS === 'ios' ? Math.max(insets.bottom, 20) : 16 }]}>
        <TextInput
          style={styles.inputField}
          placeholder="Peça uma análise..."
          placeholderTextColor={COLORS.textMuted}
          value={inputValue}
          onChangeText={setInputValue}
          returnKeyType="send"
          onSubmitEditing={() => handleConsultAI(inputValue)}
        />
        <TouchableOpacity 
          style={styles.sendButton} 
          onPress={() => handleConsultAI(inputValue)}
          disabled={loading}
        >
          <MaterialIcons name="send" size={20} color={COLORS.background} />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background, // Fundo escuro imersivo para reduzir fadiga visual.
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    backgroundColor: COLORS.surface,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.aquamarine,
    textAlign: 'center',
  },
  closeButton: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    padding: 4,
  },
  chatArea: {
    flex: 1,
  },
  chatContent: {
    padding: 20,
    paddingBottom: 20,
  },
  messageBubble: {
    maxWidth: '85%',
    padding: 16,
    borderRadius: 20,
    marginBottom: 16,
  },
  userBubble: {
    alignSelf: 'flex-end',
    backgroundColor: 'rgba(93, 255, 194, 0.15)',
    borderBottomRightRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(93, 255, 194, 0.3)',
  },
  aiBubble: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.card,
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  messageText: {
    fontSize: 15,
    color: COLORS.textPrimary,
    lineHeight: 24,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  inputField: {
    flex: 1,
    backgroundColor: COLORS.card,
    borderRadius: 20,
    paddingVertical: 12,
    paddingHorizontal: 16,
    color: COLORS.white,
    fontSize: 15,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  sendButton: {
    backgroundColor: COLORS.aquamarine,
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
  },
});
