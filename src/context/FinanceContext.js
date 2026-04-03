import React, { createContext, useState, useEffect } from 'react';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';

// O FinanceContext é o "coração" da aplicação, gerindo o estado global.
// Centralizamos aqui para evitar o "prop drilling" e facilitar o acesso aos dados em qualquer tela.
export const FinanceContext = createContext();

const DEFAULT_CATEGORIES = {
  receita: [
    { id: 'r1', name: 'Salário', icon: 'attach-money' },
    { id: 'r2', name: 'Freelance', icon: 'computer' },
    { id: 'r3', name: 'Investimentos', icon: 'trending-up' },
    { id: 'r4', name: 'Vendas', icon: 'shopping-cart' },
    { id: 'r5', name: 'Outros', icon: 'inventory-2' },
  ],
  despesa: [
    { id: 'd1', name: 'Alimentação', icon: 'restaurant' },
    { id: 'd2', name: 'Transporte', icon: 'directions-car' },
    { id: 'd3', name: 'Moradia', icon: 'home' },
    { id: 'd4', name: 'Saúde', icon: 'medical-services' },
    { id: 'd5', name: 'Lazer', icon: 'sports-esports' },
    { id: 'd6', name: 'Educação', icon: 'menu-book' },
    { id: 'd7', name: 'Outros', icon: 'inventory-2' },
  ],
};

export const FinanceProvider = ({ children }) => {
  const [balance, setBalance] = useState(0);
  const [totalIncome, setTotalIncome] = useState(0);
  const [totalExpense, setTotalExpense] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        // Recuperação de dados do SecureStore (Criptografado).
        // MGRAÇÃO: Se não houver nada no SecureStore, tentamos ler do AsyncStorage legado.
        let storedBalance = await SecureStore.getItemAsync('@sf_balance');
        let storedIncome = await SecureStore.getItemAsync('@sf_totalIncome');
        let storedExpense = await SecureStore.getItemAsync('@sf_totalExpense');
        let storedTransactions = await SecureStore.getItemAsync('@sf_transactions');
        let storedCategories = await SecureStore.getItemAsync('@sf_categories');

        // Lógica de Migração de Segurança
        if (!storedBalance) {
          const legacyBalance = await AsyncStorage.getItem('@balance');
          if (legacyBalance) {
            storedBalance = legacyBalance;
            await AsyncStorage.removeItem('@balance');
          }
        }
        if (!storedTransactions) {
          const legacyTx = await AsyncStorage.getItem('@transactions');
          if (legacyTx) {
            storedTransactions = legacyTx;
            await AsyncStorage.removeItem('@transactions');
          }
        }
        // ... repete para os outros se necessário, mas balance e transactions são os críticos.

        if (storedBalance !== null) setBalance(parseFloat(storedBalance));
        if (storedIncome !== null) setTotalIncome(parseFloat(storedIncome));
        if (storedExpense !== null) setTotalExpense(parseFloat(storedExpense));
        if (storedTransactions !== null) {
          setTransactions(JSON.parse(storedTransactions));
        } else {
          setTransactions([]);
        }
        if (storedCategories !== null) {
          setCategories(JSON.parse(storedCategories));
        }
      } catch (e) {
        console.log('Failed to load storage', e);
      } finally {
        setIsReady(true);
      }
    };
    loadData();
  }, []);

  useEffect(() => {
    if (isReady) {
      // Persistência segura em Hardware-backed storage
      SecureStore.setItemAsync('@sf_balance', balance.toString());
      SecureStore.setItemAsync('@sf_totalIncome', totalIncome.toString());
      SecureStore.setItemAsync('@sf_totalExpense', totalExpense.toString());
      SecureStore.setItemAsync('@sf_transactions', JSON.stringify(transactions));
      SecureStore.setItemAsync('@sf_categories', JSON.stringify(categories));
    }
  }, [balance, totalIncome, totalExpense, transactions, categories, isReady]);

  const addTransaction = (type, category, icon, value, description) => {
    const today = new Date();
    const dateStr = `${today.getDate()} ${['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'][today.getMonth()]}`;
    const newTx = {
      id: Date.now().toString(),
      type,
      category,
      icon,
      value,
      description: (description || '').substring(0, 100), // Sanitização básica: limite de caracteres
      date: dateStr,
    };

    setTransactions((prev) => [newTx, ...prev]);
    if (type === 'receita') {
      setBalance((prev) => prev + value);
      setTotalIncome((prev) => prev + value);
    } else {
      setBalance((prev) => prev - value);
      setTotalExpense((prev) => prev + value);
    }
  };

  const addCategory = (type, name, icon) => {
    const newCat = {
      id: `custom_${Date.now()}`,
      name: name.trim().substring(0, 30), // Sanitização básica
      icon: (icon.trim() || '🏷️').substring(0, 10),
    };
    setCategories((prev) => ({
      ...prev,
      [type]: [...prev[type], newCat],
    }));
  };

  const removeCategory = (type, id) => {
    setCategories((prev) => ({
      ...prev,
      [type]: prev[type].filter((c) => c.id !== id),
    }));
  };

  const resetApp = async () => {
    await SecureStore.deleteItemAsync('@sf_balance');
    await SecureStore.deleteItemAsync('@sf_totalIncome');
    await SecureStore.deleteItemAsync('@sf_totalExpense');
    await SecureStore.deleteItemAsync('@sf_transactions');
    await SecureStore.deleteItemAsync('@sf_categories');
    
    setBalance(0);
    setTotalIncome(0);
    setTotalExpense(0);
    setTransactions([]);
    setCategories(DEFAULT_CATEGORIES);
  };

  return (
    <FinanceContext.Provider
      value={{
        balance,
        totalIncome,
        totalExpense,
        transactions,
        categories,
        isReady,
        addTransaction,
        addCategory,
        removeCategory,
        resetApp,
      }}
    >
      {children}
    </FinanceContext.Provider>
  );
};
