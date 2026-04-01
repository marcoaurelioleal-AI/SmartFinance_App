import React, { useState, useContext } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Modal,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
  Platform,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { FinanceContext } from '../context/FinanceContext';
import { COLORS, formatCurrency } from '../theme/colors';

export default function HomeScreen() {
  const {
    balance,
    totalIncome,
    totalExpense,
    transactions,
    categories,
    addTransaction,
    addCategory,
    removeCategory,
    resetApp,
  } = useContext(FinanceContext);

  // Quick-add inline inputs
  const [nomeInput, setNomeInput] = useState('');
  const [catInput, setCatInput] = useState('');
  const [valorInput, setValorInput] = useState('');

  // Transaction Modal
  const [modalVisible, setModalVisible] = useState(false);
  const [transactionType, setTransactionType] = useState('receita');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [inputValue, setInputValue] = useState('');
  const [inputDescription, setInputDescription] = useState('');

  // Category Modal
  const [categoryModalVisible, setCategoryModalVisible] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryIcon, setNewCategoryIcon] = useState('');
  const [editCategoryType, setEditCategoryType] = useState('receita');

  const handleOpenTransactionModal = (type) => {
    setTransactionType(type);
    setSelectedCategory(null);
    setInputValue('');
    setInputDescription('');
    setModalVisible(true);
  };

  const handleQuickAddExpense = () => {
    if (!nomeInput.trim() || !valorInput.trim()) {
      Alert.alert('Atenção', 'Preencha a descrição e o valor da despesa.');
      return;
    }
    const numValue = parseFloat(valorInput.replace(',', '.'));
    if (isNaN(numValue) || numValue <= 0) {
      Alert.alert('Atenção', 'Insira um valor numérico válido.');
      return;
    }
    const categoryName = catInput.trim() || 'Outros';
    const matchingCat = categories.despesa.find(
      (c) => c.name.toLowerCase() === categoryName.toLowerCase()
    );
    const iconName = matchingCat ? matchingCat.icon : 'payment';

    addTransaction('despesa', categoryName, iconName, numValue, nomeInput.trim());

    setNomeInput('');
    setCatInput('');
    setValorInput('');
    Keyboard.dismiss();
  };

  const handleAddTransaction = () => {
    if (!selectedCategory || !inputValue) {
      Alert.alert('Atenção', 'Preencha o valor e selecione uma categoria.');
      return;
    }
    const numValue = parseFloat(inputValue.replace(',', '.'));
    if (isNaN(numValue) || numValue <= 0) {
      Alert.alert('Atenção', 'Insira um valor válido.');
      return;
    }

    addTransaction(
      transactionType,
      selectedCategory.name,
      selectedCategory.icon,
      numValue,
      inputDescription.trim()
    );
    setModalVisible(false);
    Keyboard.dismiss();
  };

  const handleAddCategory = () => {
    if (!newCategoryName.trim()) {
      Alert.alert('Atenção', 'Digite um nome para a categoria.');
      return;
    }
    addCategory(editCategoryType, newCategoryName, newCategoryIcon);
    setNewCategoryName('');
    setNewCategoryIcon('');
    Alert.alert('Sucesso!', `Categoria adicionada.`);
    Keyboard.dismiss();
  };

  const handleResetApp = () => {
    Alert.alert(
      'Zerar Dados',
      'Deseja apagar todo o histórico de transações e restaurar as categorias de fábrica?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Apagar Tudo', style: 'destructive', onPress: resetApp },
      ]
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={{ flex: 1 }}>
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Header */}
            <View style={styles.header}>
              <View>
                <Text style={styles.greeting}>Olá, bem-vindo 👋</Text>
                <Text style={styles.appTitle}>SmartFinance</Text>
              </View>
              <TouchableOpacity
                style={styles.categoryButton}
                onPress={() => setCategoryModalVisible(true)}
              >
                <Text style={styles.categoryButtonIcon}>⚙️</Text>
                <Text style={styles.categoryButtonText}>Categorias</Text>
              </TouchableOpacity>
            </View>

            {/* Card Saldo Atual */}
            <View style={styles.balanceCard}>
              <View style={styles.balanceGlow} />
              <Text style={styles.balanceLabel}>Saldo Atual</Text>
              <Text style={styles.balanceValue}>{formatCurrency(balance)}</Text>
              <View style={styles.balanceRow}>
                <View style={styles.balanceMini}>
                  <View style={[styles.miniDot, { backgroundColor: COLORS.green }]} />
                  <View>
                    <Text style={styles.miniLabel}>Receitas</Text>
                    <Text style={[styles.miniValue, styles.incomeText]}>
                      {formatCurrency(totalIncome)}
                    </Text>
                  </View>
                </View>
                <View style={styles.balanceDivider} />
                <View style={styles.balanceMini}>
                  <View style={[styles.miniDot, { backgroundColor: COLORS.red }]} />
                  <View>
                    <Text style={styles.miniLabel}>Despesas</Text>
                    <Text style={[styles.miniValue, styles.expenseText]}>
                      {formatCurrency(totalExpense)}
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Botões Receita / Despesa */}
            <View style={styles.actionRow}>
              <TouchableOpacity
                style={[styles.actionButton, styles.incomeButton]}
                onPress={() => handleOpenTransactionModal('receita')}
                activeOpacity={0.8}
              >
                <Text style={styles.actionButtonIcon}>＋</Text>
                <Text style={[styles.actionButtonText, { color: COLORS.green }]}>
                  Adicionar{'\n'}Receita
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionButton, styles.expenseButton]}
                onPress={() => handleOpenTransactionModal('despesa')}
                activeOpacity={0.8}
              >
                <Text style={[styles.actionButtonIcon, { color: COLORS.red }]}>＋</Text>
                <Text style={[styles.actionButtonText, { color: COLORS.red }]}>
                  Adicionar{'\n'}Despesa
                </Text>
              </TouchableOpacity>
            </View>

            {/* Quick Add Despesa (Inline) */}
            <View style={styles.quickAddCard}>
              <View style={styles.quickAddGlow} />
              <View style={styles.quickAddHeader}>
                <Text style={styles.quickAddTitle}>💸 Adicionar Despesa Rápida</Text>
              </View>
              <View style={styles.quickAddInputRow}>
                <View style={styles.quickAddInputWrapper}>
                  <Text style={styles.quickAddInputLabel}>Descrição</Text>
                  <TextInput
                    style={styles.quickAddInput}
                    placeholder="Ex: Almoço, Uber..."
                    placeholderTextColor={COLORS.textMuted}
                    value={nomeInput}
                    onChangeText={setNomeInput}
                    returnKeyType="done"
                  />
                </View>
                <View style={[styles.quickAddInputWrapper, { flex: 0.6 }]}>
                  <Text style={styles.quickAddInputLabel}>Valor (R$)</Text>
                  <TextInput
                    style={styles.quickAddInput}
                    placeholder="0,00"
                    placeholderTextColor={COLORS.textMuted}
                    keyboardType="decimal-pad"
                    value={valorInput}
                    onChangeText={setValorInput}
                    returnKeyType="done"
                  />
                </View>
              </View>
              <View style={[styles.quickAddInputWrapper, { marginBottom: 16 }]}>
                <Text style={styles.quickAddInputLabel}>Categoria (Opcional)</Text>
                <TextInput
                  style={styles.quickAddInput}
                  placeholder="Ex: Alimentação"
                  placeholderTextColor={COLORS.textMuted}
                  value={catInput}
                  onChangeText={setCatInput}
                  returnKeyType="done"
                />
              </View>
              <TouchableOpacity
                style={styles.quickAddButton}
                onPress={handleQuickAddExpense}
                activeOpacity={0.8}
              >
                <Text style={styles.quickAddButtonText}>＋  Adicionar Despesa</Text>
              </TouchableOpacity>
            </View>

            {/* Últimas Transações */}
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Últimas Transações</Text>
              <Text style={styles.sectionSubtitle}>{(transactions || []).length} registros</Text>
            </View>
            {(transactions || []).slice(0, 10).map((item) => (
              <View key={item.id} style={styles.transactionItem}>
                <View style={styles.transactionIcon}>
                  <MaterialIcons
                    name={item.icon || 'payment'}
                    size={24}
                    color={COLORS.aquamarine}
                  />
                </View>
                <View style={styles.transactionInfo}>
                  <Text style={styles.transactionCategory}>
                    {item.description || item.category}
                  </Text>
                  <Text style={styles.transactionDate}>{item.date}</Text>
                </View>
                <Text
                  style={[
                    styles.transactionValue,
                    item.type === 'receita' ? styles.incomeText : styles.expenseText,
                  ]}
                >
                  {item.type === 'receita' ? '+' : '-'} {formatCurrency(item.value)}
                </Text>
              </View>
            ))}

            <View style={{ height: 40 }} />
          </ScrollView>
        </View>
      </TouchableWithoutFeedback>

      {/* MODAL — Adicionar Transação */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setModalVisible(false)}
      >
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={styles.modalContent}>
              {/* Topo */}
              <View style={styles.modalHandle} />
              <Text style={styles.modalTitle}>
                {transactionType === 'receita' ? '💰 Nova Receita' : '💸 Nova Despesa'}
              </Text>

              {/* Valor */}
              <Text style={styles.inputLabel}>Valor (R$)</Text>
              <TextInput
                style={styles.textInput}
                placeholder="0,00"
                placeholderTextColor={COLORS.textMuted}
                keyboardType="decimal-pad"
                value={inputValue}
                onChangeText={setInputValue}
                returnKeyType="done"
              />

              {/* Descrição */}
              <Text style={styles.inputLabel}>Descrição (opcional)</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Ex: Almoço no restaurante"
                placeholderTextColor={COLORS.textMuted}
                value={inputDescription}
                onChangeText={setInputDescription}
                returnKeyType="done"
              />

              {/* Categorias */}
              <Text style={styles.inputLabel}>Categoria</Text>
              <View style={styles.categoryGrid}>
                {categories[transactionType].map((cat) => (
                  <TouchableOpacity
                    key={cat.id}
                    style={[
                      styles.categoryOption,
                      selectedCategory?.id === cat.id && styles.categoryOptionSelected,
                    ]}
                    onPress={() => setSelectedCategory(cat)}
                  >
                    <MaterialIcons
                      name={cat.icon}
                      size={18}
                      color={
                        selectedCategory?.id === cat.id
                          ? COLORS.aquamarine
                          : COLORS.textSecondary
                      }
                      style={{ marginRight: 6 }}
                    />
                    <Text
                      style={[
                        styles.categoryOptionText,
                        selectedCategory?.id === cat.id &&
                          styles.categoryOptionTextSelected,
                      ]}
                    >
                      {cat.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Botões */}
              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={styles.modalCancel}
                  onPress={() => setModalVisible(false)}
                >
                  <Text style={styles.modalCancelText}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.modalConfirm,
                    {
                      backgroundColor:
                        transactionType === 'receita' ? COLORS.green : COLORS.red,
                    },
                  ]}
                  onPress={handleAddTransaction}
                >
                  <Text style={styles.modalConfirmText}>Confirmar</Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
      </Modal>

      {/* MODAL — Gerenciar Categorias */}
      <Modal
        visible={categoryModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setCategoryModalVisible(false)}
      >
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <View style={[styles.modalContent, { maxHeight: '85%' }]}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>🏷️ Gerenciar Categorias</Text>

            {/* Tabs Receita / Despesa */}
            <View style={styles.catTabs}>
              <TouchableOpacity
                style={[
                  styles.catTab,
                  editCategoryType === 'receita' && styles.catTabActive,
                ]}
                onPress={() => setEditCategoryType('receita')}
              >
                <Text
                  style={[
                    styles.catTabText,
                    editCategoryType === 'receita' && styles.catTabTextActive,
                  ]}
                >
                  Receitas
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.catTab,
                  editCategoryType === 'despesa' && styles.catTabActive,
                ]}
                onPress={() => setEditCategoryType('despesa')}
              >
                <Text
                  style={[
                    styles.catTabText,
                    editCategoryType === 'despesa' && styles.catTabTextActive,
                  ]}
                >
                  Despesas
                </Text>
              </TouchableOpacity>
            </View>

            {/* Lista de categorias existentes */}
            <ScrollView
              style={styles.catList}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              {categories[editCategoryType].map((cat) => (
                <View key={cat.id} style={styles.catListItem}>
                  <MaterialIcons
                    name={cat.icon}
                    size={22}
                    color={COLORS.textPrimary}
                    style={{ marginRight: 12 }}
                  />
                  <Text style={styles.catListName}>{cat.name}</Text>
                  <TouchableOpacity
                    onPress={() =>
                      Alert.alert(
                        'Remover Categoria',
                        'Deseja realmente remover esta categoria?',
                        [
                          { text: 'Cancelar', style: 'cancel' },
                          {
                            text: 'Remover',
                            style: 'destructive',
                            onPress: () => removeCategory(editCategoryType, cat.id),
                          },
                        ]
                      )
                    }
                  >
                    <Text style={styles.catListRemove}>✕</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>

            {/* Adicionar nova categoria */}
            <View style={styles.addCatRow}>
              <TextInput
                style={[styles.textInput, { flex: 0.3 }]}
                placeholder="Ícone"
                placeholderTextColor={COLORS.textMuted}
                autoCapitalize="none"
                value={newCategoryIcon}
                onChangeText={setNewCategoryIcon}
                returnKeyType="done"
              />
              <TextInput
                style={[styles.textInput, { flex: 0.6, marginHorizontal: 8 }]}
                placeholder="Nome da categoria"
                placeholderTextColor={COLORS.textMuted}
                value={newCategoryName}
                onChangeText={setNewCategoryName}
                returnKeyType="done"
              />
              <TouchableOpacity style={styles.addCatButton} onPress={handleAddCategory}>
                <Text style={styles.addCatButtonText}>＋</Text>
              </TouchableOpacity>
            </View>

            <View style={{ flexDirection: 'row', gap: 12, marginTop: 16 }}>
              <TouchableOpacity
                style={[
                  styles.modalConfirm,
                  {
                    backgroundColor: COLORS.background,
                    flex: 1,
                    borderWidth: 1,
                    borderColor: COLORS.red,
                  },
                ]}
                onPress={handleResetApp}
              >
                <Text style={[styles.modalConfirmText, { color: COLORS.red }]}>
                  Zerar App
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.modalConfirm,
                  { backgroundColor: COLORS.aquamarine, flex: 1 },
                ]}
                onPress={() => setCategoryModalVisible(false)}
              >
                <Text style={[styles.modalConfirmText, { color: COLORS.background }]}>
                  Fechar
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 60,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 28,
  },
  greeting: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  appTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.aquamarine,
    letterSpacing: 1,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  categoryButtonIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  categoryButtonText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  balanceCard: {
    backgroundColor: COLORS.card,
    borderRadius: 24,
    padding: 28,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(93, 255, 194, 0.15)',
    overflow: 'hidden',
    shadowColor: COLORS.aquamarine,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 12,
  },
  balanceGlow: {
    position: 'absolute',
    top: -40,
    right: -40,
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(93, 255, 194, 0.08)',
  },
  balanceLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  balanceValue: {
    fontSize: 38,
    fontWeight: '800',
    color: COLORS.white,
    marginBottom: 24,
    letterSpacing: 0.5,
  },
  balanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  balanceMini: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  miniDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 10,
  },
  miniLabel: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginBottom: 2,
  },
  miniValue: {
    fontSize: 15,
    fontWeight: '700',
  },
  incomeText: {
    color: COLORS.green,
  },
  expenseText: {
    color: COLORS.red,
  },
  balanceDivider: {
    width: 1,
    height: 36,
    backgroundColor: COLORS.border,
    marginHorizontal: 16,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 14,
    marginBottom: 28,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    paddingHorizontal: 16,
    borderRadius: 18,
    borderWidth: 1.5,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 6,
  },
  incomeButton: {
    backgroundColor: COLORS.greenBg,
    borderColor: 'rgba(52, 211, 153, 0.35)',
    shadowColor: COLORS.green,
  },
  expenseButton: {
    backgroundColor: COLORS.redBg,
    borderColor: 'rgba(248, 113, 113, 0.35)',
    shadowColor: COLORS.red,
  },
  actionButtonIcon: {
    fontSize: 22,
    fontWeight: '800',
    marginRight: 10,
    // colors override in inline styles
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 20,
  },
  quickAddCard: {
    backgroundColor: COLORS.card,
    borderRadius: 22,
    padding: 22,
    marginBottom: 28,
    borderWidth: 1,
    borderColor: 'rgba(248, 113, 113, 0.2)',
    overflow: 'hidden',
    shadowColor: COLORS.red,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 8,
  },
  quickAddGlow: {
    position: 'absolute',
    top: -30,
    left: -30,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(248, 113, 113, 0.06)',
  },
  quickAddHeader: {
    marginBottom: 18,
  },
  quickAddTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.white,
    letterSpacing: 0.3,
  },
  quickAddInputRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  quickAddInputWrapper: {
    flex: 1,
  },
  quickAddInputLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textMuted,
    marginBottom: 6,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  quickAddInput: {
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 16,
    fontSize: 15,
    color: COLORS.white,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    shadowColor: 'rgba(248, 113, 113, 0.15)',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 6,
    elevation: 2,
  },
  quickAddButton: {
    backgroundColor: COLORS.red,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.red,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 6,
  },
  quickAddButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.white,
    letterSpacing: 0.5,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.white,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: COLORS.textMuted,
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E2035',
    borderRadius: 20,
    padding: 18,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 4,
  },
  transactionIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: 'rgba(93, 255, 194, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionCategory: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.white,
    marginBottom: 2,
  },
  transactionDate: {
    fontSize: 12,
    color: COLORS.textMuted,
  },
  transactionValue: {
    fontSize: 15,
    fontWeight: '700',
  },
  incomeText: {
    color: COLORS.green,
  },
  expenseText: {
    color: COLORS.red,
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: COLORS.overlay,
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    paddingBottom: 36,
  },
  modalHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.border,
    alignSelf: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.white,
    marginBottom: 24,
    textAlign: 'center',
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: 8,
    marginTop: 4,
  },
  textInput: {
    backgroundColor: COLORS.card,
    borderRadius: 14,
    padding: 14,
    fontSize: 16,
    color: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 12,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 4,
    marginBottom: 20,
  },
  categoryOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: COLORS.border,
  },
  categoryOptionSelected: {
    borderColor: COLORS.aquamarine,
    backgroundColor: COLORS.aquamarineMuted,
  },
  categoryOptionText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  categoryOptionTextSelected: {
    color: COLORS.aquamarine,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  modalCancel: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  modalCancelText: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  modalConfirm: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  modalConfirmText: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.white,
  },
  // Cat Modal
  catTabs: {
    flexDirection: 'row',
    backgroundColor: COLORS.card,
    borderRadius: 14,
    padding: 4,
    marginBottom: 16,
  },
  catTab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
  },
  catTabActive: {
    backgroundColor: COLORS.aquamarineMuted,
  },
  catTabText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textMuted,
  },
  catTabTextActive: {
    color: COLORS.aquamarine,
  },
  catList: {
    maxHeight: 200,
    marginBottom: 16,
  },
  catListItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  catListName: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.white,
  },
  catListRemove: {
    fontSize: 16,
    color: COLORS.red,
    fontWeight: '700',
    paddingHorizontal: 8,
  },
  addCatRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  addCatButton: {
    backgroundColor: COLORS.aquamarine,
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addCatButtonText: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.background,
  },
});
