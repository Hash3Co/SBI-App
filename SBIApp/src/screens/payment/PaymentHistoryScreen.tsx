// PaymentHistoryScreen.tsx
import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Animated } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS, SHADOWS } from '../../constants/theme';

export const PaymentHistoryScreen = ({ navigation }: any) => {
  const transactions = [
    { id: '1', date: '2024-01-15', amount: 500, description: 'Pro SME Subscription', status: 'completed', type: 'subscription', color: '#10b981' },
    { id: '2', date: '2024-01-10', amount: 250, description: 'Basic SME Subscription', status: 'completed', type: 'subscription', color: '#6366f1' },
    { id: '3', date: '2023-12-20', amount: 0, description: 'Free Trial - Basic SME', status: 'completed', type: 'trial', color: '#f59e0b' },
  ];

  const totalSpent = transactions.reduce((sum, t) => sum + t.amount, 0);

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'completed': return '#10b981';
      case 'pending': return '#f59e0b';
      case 'failed': return '#ef4444';
      default: return '#94a3b8';
    }
  };

  const getStatusIcon = (status: string) => {
    switch(status) {
      case 'completed': return 'check-circle';
      case 'pending': return 'pending';
      case 'failed': return 'cancel';
      default: return 'help';
    }
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
          <Text style={styles.headerTitle}>Payment History</Text>
          <TouchableOpacity style={styles.filterButton}>
            <Icon name="filter-list" size={24} color={COLORS.white} />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <View style={styles.summaryCard}>
        <View style={styles.summaryHeader}>
          <Text style={styles.summaryLabel}>Total Spent</Text>
          <View style={styles.summaryPeriod}>
            <Text style={styles.summaryPeriodText}>Last 3 months</Text>
          </View>
        </View>
        <Text style={styles.summaryValue}>M {totalSpent.toLocaleString()}</Text>
        <View style={styles.summaryStats}>
          <View style={styles.summaryStat}>
            <Text style={styles.summaryStatValue}>{transactions.length}</Text>
            <Text style={styles.summaryStatLabel}>Transactions</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryStat}>
            <Text style={[styles.summaryStatValue, { color: '#10b981' }]}>Active</Text>
            <Text style={styles.summaryStatLabel}>Subscription</Text>
          </View>
        </View>
      </View>

      <View style={styles.content}>
        <Text style={styles.sectionTitle}>Transaction History</Text>
        
        {transactions.map((transaction, index) => (
          <Animated.View 
            key={transaction.id} 
            style={[
              styles.transactionCard,
              { transform: [{ scale: 1 }] }
            ]}
          >
            <View style={[styles.transactionIcon, { backgroundColor: getStatusColor(transaction.status) + '15' }]}>
              <Icon 
                name={transaction.type === 'subscription' ? 'credit-card' : 'history'} 
                size={24} 
                color={getStatusColor(transaction.status)} 
              />
            </View>
            <View style={styles.transactionInfo}>
              <Text style={styles.transactionDescription}>{transaction.description}</Text>
              <Text style={styles.transactionDate}>{transaction.date}</Text>
            </View>
            <View style={styles.transactionRight}>
              <Text style={[styles.transactionAmount, { color: transaction.amount > 0 ? '#10b981' : '#94a3b8' }]}>
                {transaction.amount > 0 ? `M ${transaction.amount}` : 'Free'}
              </Text>
              <View style={[styles.statusBadge, { backgroundColor: getStatusColor(transaction.status) + '20' }]}>
                <Icon name={getStatusIcon(transaction.status)} size={12} color={getStatusColor(transaction.status)} />
                <Text style={[styles.statusText, { color: getStatusColor(transaction.status) }]}>
                  {transaction.status}
                </Text>
              </View>
            </View>
          </Animated.View>
        ))}

        <TouchableOpacity style={styles.downloadButton}>
          <LinearGradient colors={['#f1f5f9', '#e2e8f0']} style={styles.downloadGradient}>
            <Icon name="download" size={20} color="#6366f1" />
            <Text style={styles.downloadText}>Download Statement</Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity style={styles.supportButton}>
          <Icon name="help" size={20} color="#94a3b8" />
          <Text style={styles.supportText}>Need help with your payments?</Text>
        </TouchableOpacity>
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
  summaryCard: { 
    marginTop: -20,
    marginHorizontal: SPACING.lg, 
    padding: SPACING.lg, 
    borderRadius: BORDER_RADIUS.lg, 
    backgroundColor: COLORS.white,
    ...SHADOWS.md,
  },
  summaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  summaryLabel: { 
    fontSize: TYPOGRAPHY.sizes.sm, 
    color: '#94a3b8' 
  },
  summaryPeriod: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.round,
  },
  summaryPeriodText: {
    fontSize: 10,
    color: '#64748b',
  },
  summaryValue: { 
    fontSize: 40, 
    fontWeight: 'bold', 
    color: '#1e293b',
    marginVertical: SPACING.sm,
  },
  summaryStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  summaryStat: { alignItems: 'center' },
  summaryStatValue: { 
    fontSize: TYPOGRAPHY.sizes.lg, 
    fontWeight: 'bold', 
    color: '#1e293b' 
  },
  summaryStatLabel: { 
    fontSize: TYPOGRAPHY.sizes.xs, 
    color: '#94a3b8',
    marginTop: 2,
  },
  summaryDivider: { width: 1, height: 30, backgroundColor: '#f1f5f9' },
  content: { padding: SPACING.lg, paddingBottom: SPACING.xxxl },
  sectionTitle: { 
    fontSize: TYPOGRAPHY.sizes.lg, 
    fontWeight: 'bold', 
    color: '#1e293b',
    marginBottom: SPACING.md,
    marginTop: SPACING.md,
  },
  transactionCard: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: COLORS.white, 
    borderRadius: BORDER_RADIUS.lg, 
    padding: SPACING.md, 
    marginBottom: SPACING.md, 
    ...SHADOWS.sm, 
    gap: SPACING.md 
  },
  transactionIcon: { 
    width: 48, 
    height: 48, 
    borderRadius: 24, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  transactionInfo: { flex: 1 },
  transactionDescription: { 
    fontSize: TYPOGRAPHY.sizes.md, 
    fontWeight: '500', 
    color: '#1e293b' 
  },
  transactionDate: { 
    fontSize: TYPOGRAPHY.sizes.xs, 
    color: '#94a3b8', 
    marginTop: 2 
  },
  transactionRight: { alignItems: 'flex-end' },
  transactionAmount: { 
    fontSize: TYPOGRAPHY.sizes.md, 
    fontWeight: 'bold' 
  },
  statusBadge: { 
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: SPACING.sm, 
    paddingVertical: 2, 
    borderRadius: BORDER_RADIUS.round, 
    marginTop: 4 
  },
  statusText: { 
    fontSize: 10, 
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  downloadButton: { marginTop: SPACING.lg, marginBottom: SPACING.md },
  downloadGradient: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center', 
    gap: SPACING.sm, 
    paddingVertical: SPACING.md, 
    borderRadius: BORDER_RADIUS.lg 
  },
  downloadText: { 
    color: '#6366f1', 
    fontSize: TYPOGRAPHY.sizes.md, 
    fontWeight: '500' 
  },
  supportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    paddingVertical: SPACING.md,
  },
  supportText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: '#94a3b8',
  },
});