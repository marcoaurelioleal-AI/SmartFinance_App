import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { PieChart } from 'react-native-chart-kit';
import { COLORS } from '../theme/colors';

const { width } = Dimensions.get('window');

export default function FinancialChart({ transactions, categories }) {
  const chartColors = ['#5DFFC2', '#34D399', '#3B82F6', '#8B5CF6', '#EC4899', '#F59E0B', '#EF4444'];
  const pieChartData = categories.despesa.map((cat, index) => {
    const total = transactions
      .filter((t) => t.type === 'despesa' && t.category === cat.name)
      .reduce((sum, t) => sum + t.value, 0);
    return {
      name: cat.name,
      population: total,
      color: chartColors[index % chartColors.length],
      legendFontColor: COLORS.textSecondary,
      legendFontSize: 13,
    };
  }).filter(item => item.population > 0);

  if (pieChartData.length === 0) {
    return (
      <View style={styles.chartCardEmpty}>
        <Text style={styles.chartEmptyText}>Adicione despesas para ver o gráfico de pizza.</Text>
      </View>
    );
  }

  return (
    <View style={styles.chartCard}>
      <PieChart
        data={pieChartData}
        width={width - 40}
        height={160}
        chartConfig={{
          color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
        }}
        accessor={"population"}
        backgroundColor={"transparent"}
        paddingLeft={"10"}
        absolute
      />
    </View>
  );
}

const styles = StyleSheet.create({
  chartCard: {
    backgroundColor: '#1E2035',
    borderRadius: 24,
    paddingVertical: 18,
    paddingHorizontal: 0,
    marginBottom: 28,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 4,
  },
  chartCardEmpty: {
    backgroundColor: '#1E2035',
    borderRadius: 24,
    padding: 24,
    marginBottom: 28,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  chartEmptyText: {
    color: COLORS.textMuted,
    fontSize: 14,
  },
});
