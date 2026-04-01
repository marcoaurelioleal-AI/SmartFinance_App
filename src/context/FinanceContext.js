import React, { createContext, useState, useEffect } from 'react';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
        // Recuperação de dados do AsyncStorage.
        // Essencial para permitir o uso Offline, uma característica chave para apps financeiros.
        const storedBalance = await AsyncStorage.getItem('@balance');
        const storedIncome = await AsyncStorage.getItem('@totalIncome');
        const storedExpense = await AsyncStorage.getItem('@totalExpense');
        const storedTransactions = await AsyncStorage.getItem('@transactions');
        const storedCategories = await AsyncStorage.getItem('@categories');

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
      AsyncStorage.setItem('@balance', balance.toString());
      AsyncStorage.setItem('@totalIncome', totalIncome.toString());
      AsyncStorage.setItem('@totalExpense', totalExpense.toString());
      AsyncStorage.setItem('@transactions', JSON.stringify(transactions));
      AsyncStorage.setItem('@categories', JSON.stringify(categories));
    }
  }, [balance, totalIncome, totalExpense, transactions, categories, isReady]);

  const addTransaction = (type, category, icon, value, description) => {
    const today = new Date();
    // Formatamos a data manualmente para garantir consistência visual em todo o app.
    const dateStr = `${today.getDate()} ${['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'][today.getMonth()]}`;
    const newTx = {
      id: Date.now().toString(), // ID único baseado em timestamp para evitar conflitos.
      type,
      category,
      icon,
      value,
      description: description || '',
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
      name: name.trim(),
      icon: icon.trim() || '🏷️',
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
    await AsyncStorage.clear();
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
