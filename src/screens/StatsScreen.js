import React, { useState, useContext } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Modal,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { FinanceContext } from '../context/FinanceContext';
import { COLORS, formatCurrency } from '../theme/colors';
import FinancialChart from '../components/FinancialChart';

export default function StatsScreen() {
  const { transactions, categories } = useContext(FinanceContext);

  const [viewCategoryModalVisible, setViewCategoryModalVisible] = useState(false);
  const [categoryToView, setCategoryToView] = useState(null);

  const handleViewCategory = (catName) => {
    setCategoryToView(catName);
    setViewCategoryModalVisible(true);
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Distribuição de Despesas */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Distribuição (Despesas)</Text>
        </View>

        <FinancialChart transactions={transactions} categories={categories} />

        {/* Resumo por Categorias */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Despesas por Categoria</Text>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoryCarousel}
        >
          {categories.despesa.map((cat) => {
            const total = transactions
              .filter((t) => t.type === 'despesa' && t.category === cat.name)
              .reduce((sum, t) => sum + t.value, 0);

            return (
              <TouchableOpacity
                key={cat.id}
                style={styles.categoryChip}
                activeOpacity={0.8}
                onPress={() => handleViewCategory(cat.name)}
              >
                <MaterialIcons
                  name={cat.icon}
                  size={28}
                  color={COLORS.white}
                  style={{ marginBottom: 6 }}
                />
                <Text style={styles.categoryChipName}>{cat.name}</Text>
                <Text style={styles.categoryChipValue}>
                  {total > 0 ? formatCurrency(total) : '—'}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
        <View style={{ height: 40 }} />
      </ScrollView>

      {/* MODAL — Visualizar Gastos da Categoria */}
      <Modal
        visible={viewCategoryModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setViewCategoryModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { maxHeight: '80%' }]}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}> Gastos: {categoryToView} </Text>
            <ScrollView showsVerticalScrollIndicator={false}>
              {transactions
                .filter(
                  (t) =>
                    (t.type === 'despesa') &&
                    (t.category === categoryToView || t.description === categoryToView)
                )
                .map((item) => (
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
            </ScrollView>
            <TouchableOpacity
              style={[
                styles.modalConfirm,
                {
                  backgroundColor: COLORS.surface,
                  marginTop: 16,
                  borderWidth: 1,
                  borderColor: COLORS.border,
                },
              ]}
              onPress={() => setViewCategoryModalVisible(false)}
            >
              <Text style={styles.modalConfirmText}>Fechar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
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
  categoryCarousel: {
    marginBottom: 28,
  },
  categoryChip: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 18,
    marginRight: 12,
    alignItems: 'center',
    minWidth: 100,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  categoryChipName: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '600',
    marginBottom: 4,
  },
  categoryChipValue: {
    fontSize: 13,
    color: COLORS.white,
    fontWeight: '700',
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
  modalConfirm: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
  },
  modalConfirmText: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.white,
  },
});
