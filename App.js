import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { FinanceProvider } from './src/context/FinanceContext';
import { COLORS } from './src/theme/colors';

// Estrutura de Navegação: Utilizamos BottomTabNavigator para uma experiência Nativa Mobile fluida.
import HomeScreen from './src/screens/HomeScreen';
import StatsScreen from './src/screens/StatsScreen';
import ChatAiScreen from './src/screens/ChatAiScreen';

const Tab = createBottomTabNavigator();

function MainTabs() {
  // O uso do useSafeAreaInsets é essencial para dispositivos com "notch" (iPhone X ou mais recentes).
  // Ele garante que a interface não seja sobreposta pelos indicadores do sistema (barra de home).
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        // Ocultar a tabBar ao abrir o teclado melhora drasticamente o foco do usuário em telas de formulário.
        tabBarHideOnKeyboard: true,
            tabBarIcon: ({ color, size }) => {
              let iconName;
              if (route.name === 'Início') {
                iconName = 'home-filled';
              } else if (route.name === 'Estatísticas') {
                iconName = 'pie-chart';
              } else if (route.name === 'IA Consultor') {
                iconName = 'auto-awesome';
              }
              return <MaterialIcons name={iconName} size={28} color={color} />;
            },
            tabBarActiveTintColor: COLORS.aquamarine,
            tabBarInactiveTintColor: COLORS.textMuted,
            tabBarStyle: {
              backgroundColor: '#161829', // Fundo escuro premium (Naval Deep)
              borderTopWidth: 1,
              borderTopColor: '#2A2D45',
              // Ajuste dinâmico de altura para suportar a Safe Area do iOS sem quebras visuais.
              height: 65 + insets.bottom,
              paddingBottom: 10 + insets.bottom,
              paddingTop: 10,
            },
            tabBarLabelStyle: {
              fontSize: 12,
              fontWeight: '600',
            },
          })}
    >
      <Tab.Screen name="Início" component={HomeScreen} />
      <Tab.Screen name="Estatísticas" component={StatsScreen} />
      <Tab.Screen name="IA Consultor" component={ChatAiScreen} />
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <FinanceProvider>
        <StatusBar style="light" />
        <NavigationContainer>
          <MainTabs />
        </NavigationContainer>
      </FinanceProvider>
    </SafeAreaProvider>
  );
}
