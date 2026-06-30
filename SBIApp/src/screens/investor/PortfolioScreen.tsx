// PortfolioScreen.tsx
import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Animated } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS, SHADOWS } from '../../constants/theme';

export const PortfolioScreen = ({ navigation }: any) => {
  const investments = [
    { id: '1', name: 'Tech Solutions Ltd', amount: 500000, date: '2024-01-15', equity: 15, status: 'active', return: 12.5, color: '#6366f1' },
    { id: '2', name: 'Green Energy Africa', amount: 1250000, date: '2024-02-20', equity: 10, status: 'active', return: 8.2, color: '#06b6d4' },
    { id: '3', name: 'AgriFresh', amount: 350000, date: '2024-03-10', equity: 8, status: 'pending', return: 0, color: '#f59e0b' },
  ];

  const totalInvested = investments.reduce((sum, inv) => sum + inv.amount, 0);
  const activeInvestments = investments.filter(i => i.status === 'active').length;

  const statusColors = {
    active: { bg: '#10b98115', text: '#10b981' },
    pending: { bg: '#f59e0b15', text: '#f59e0b' },
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <LinearGradient 
        colors={['#6366f1', '#4f46e5', '#4338ca']} 
        style={styles.header}
        start={{x: 0, y: 0}}
        end={{x: 1, y: 0}}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Icon name="arrow-back" size={24} color={COLORS.white} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Portfolio</Text>
          <TouchableOpacity style={styles.filterButton}>
            <Icon name="filter-list" size={24} color={COLORS.white} />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <View style={styles.statsCard}>
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>M {totalInvested.toLocaleString()}</Text>
            <Text style={styles.statLabel}>Total Invested</Text>
            <View style={styles.statChange}>
              <Icon name="trending-up" size={12} color="#10b981" />
              <Text style={styles.statChangeText}>+12.5%</Text>
            </View>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{activeInvestments}</Text>
            <Text style={styles.statLabel}>Active Deals</Text>
            <View style={styles.statChange}>
              <Icon name="check-circle" size={12} color="#10b981" />
              <Text style={styles.statChangeText}>Active</Text>
            </View>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{investments.length}</Text>
            <Text style={styles.statLabel}>Total Deals</Text>
            <View style={styles.statChange}>
              <Icon name="business" size={12} color="#6366f1" />
              <Text style={[styles.statChangeText, { color: '#6366f1' }]}>Closed</Text>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.chartCard}>
        <Text style={styles.cardTitle}>Portfolio Distribution</Text>
        <View style={styles.distributionContainer}>
          {investments.map((inv, index) => {
            const percentage = (inv.amount / totalInvested) * 100;
            return (
              <View key={inv.id} style={styles.distributionItem}>
                <View style={styles.distributionHeader}>
                  <View style={[styles.distributionDot, { backgroundColor: inv.color }]} />
                  <Text style={styles.distributionName}>{inv.name}</Text>
                  <Text style={styles.distributionPercent}>{Math.round(percentage)}%</Text>
                </View>
                <View style={styles.distributionBar}>
                  <View style={[styles.distributionProgress, { width: `${percentage}%`, backgroundColor: inv.color }]} />
                </View>
              </View>
            );
          })}
        </View>
      </View>

      <View style={styles.listCard}>
        <View style={styles.listHeader}>
          <Text style={styles.cardTitle}>Investment History</Text>
          <TouchableOpacity>
            <Text style={styles.viewAll}>View All</Text>
          </TouchableOpacity>
        </View>
        
        {investments.map((inv, index) => (
          <TouchableOpacity key={inv.id} style={styles.investmentItem}>
            <View style={styles.investmentLeft}>
              <View style={[styles.investmentIcon, { backgroundColor: inv.color + '20' }]}>
                <Icon name="business" size={20} color={inv.color} />
              </View>
              <View>
                <Text style={styles.investmentName}>{inv.name}</Text>
                <Text style={styles.investmentDate}>{inv.date}</Text>
              </View>
            </View>
            <View style={styles.investmentRight}>
              <Text style={styles.investmentAmount}>M {inv.amount.toLocaleString()}</Text>
              <View style={styles.investmentMeta}>
                <Text style={styles.investmentEquity}>{inv.equity}% equity</Text>
                {inv.return > 0 && (
                  <View style={[styles.returnBadge, { backgroundColor: '#10b98115' }]}>
                    <Icon name="trending-up" size={12} color="#10b981" />
                    <Text style={styles.returnText}>+{inv.return}%</Text>
                  </View>
                )}
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: { 
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.xxxl,
    paddingBottom: SPACING.xxl,
    borderBottomLeftRadius: BORDER_RADIUS.xxl,
    borderBottomRightRadius: BORDER_RADIUS.xxl,
  },
  headerContent: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center',
  },
  backButton: { padding: SPACING.sm },
  headerTitle: { 
    fontSize: TYPOGRAPHY.sizes.xl, 
    fontWeight: 'bold', 
    color: COLORS.white 
  },
  filterButton: { padding: SPACING.sm },
  statsCard: { 
    marginTop: -20,
    marginHorizontal: SPACING.lg, 
    padding: SPACING.lg, 
    borderRadius: BORDER_RADIUS.lg, 
    backgroundColor: COLORS.white,
    ...SHADOWS.md,
  },
  statsContainer: { 
    flexDirection: 'row', 
    justifyContent: 'space-around' 
  },
  statItem: { alignItems: 'center' },
  statValue: { 
    fontSize: TYPOGRAPHY.sizes.xxl, 
    fontWeight: 'bold', 
    color: '#1e293b' 
  },
  statLabel: { 
    fontSize: TYPOGRAPHY.sizes.sm, 
    color: '#64748b', 
    marginTop: 2 
  },
  statChange: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 4,
    marginTop: 4,
  },
  statChangeText: { 
    fontSize: 10, 
    color: '#10b981',
    fontWeight: '500',
  },
  statDivider: { 
    width: 1, 
    height: 50, 
    backgroundColor: '#f1f5f9' 
  },
  chartCard: { 
    backgroundColor: COLORS.white, 
    marginHorizontal: SPACING.lg, 
    marginTop: SPACING.lg,
    padding: SPACING.lg, 
    borderRadius: BORDER_RADIUS.lg, 
    ...SHADOWS.md,
  },
  cardTitle: { 
    fontSize: TYPOGRAPHY.sizes.lg, 
    fontWeight: 'bold', 
    color: '#1e293b',
    marginBottom: SPACING.md,
  },
  distributionContainer: { gap: SPACING.md },
  distributionItem: { gap: SPACING.xs },
  distributionHeader: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: SPACING.sm 
  },
  distributionDot: { 
    width: 8, 
    height: 8, 
    borderRadius: 4 
  },
  distributionName: { 
    flex: 1, 
    fontSize: TYPOGRAPHY.sizes.sm, 
    color: '#1e293b' 
  },
  distributionPercent: { 
    fontSize: TYPOGRAPHY.sizes.sm, 
    fontWeight: 'bold', 
    color: '#1e293b' 
  },
  distributionBar: { 
    height: 6, 
    backgroundColor: '#f1f5f9', 
    borderRadius: BORDER_RADIUS.round,
    overflow: 'hidden',
  },
  distributionProgress: { 
    height: '100%', 
    borderRadius: BORDER_RADIUS.round 
  },
  listCard: { 
    backgroundColor: COLORS.white, 
    marginHorizontal: SPACING.lg, 
    marginTop: SPACING.lg,
    marginBottom: SPACING.xxxl, 
    padding: SPACING.lg, 
    borderRadius: BORDER_RADIUS.lg, 
    ...SHADOWS.md,
  },
  listHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  viewAll: { 
    fontSize: TYPOGRAPHY.sizes.sm, 
    color: '#6366f1', 
    fontWeight: '500' 
  },
  investmentItem: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  investmentLeft: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: SPACING.md,
    flex: 1,
  },
  investmentIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  investmentName: { 
    fontSize: TYPOGRAPHY.sizes.md, 
    fontWeight: '500', 
    color: '#1e293b' 
  },
  investmentDate: { 
    fontSize: TYPOGRAPHY.sizes.xs, 
    color: '#94a3b8',
    marginTop: 2,
  },
  investmentRight: { alignItems: 'flex-end' },
  investmentAmount: { 
    fontSize: TYPOGRAPHY.sizes.md, 
    fontWeight: 'bold', 
    color: '#10b981' 
  },
  investmentMeta: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: SPACING.sm,
    marginTop: 2,
  },
  investmentEquity: { 
    fontSize: TYPOGRAPHY.sizes.xs, 
    color: '#64748b' 
  },
  returnBadge: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.round,
    gap: 4,
  },
  returnText: { 
    fontSize: 10, 
    color: '#10b981',
    fontWeight: '600',
  },
});