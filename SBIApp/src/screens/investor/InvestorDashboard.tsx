// src/screens/investor/InvestorDashboard.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Animated,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useAuth } from '../../context/AuthenticationContext';
import { useMatching } from '../../context/MatchingContext';
import { useNotifications } from '../../context/NotificationContext';
import { investorService } from '../../services';
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS, SHADOWS } from '../../constants/theme';

export const InvestorDashboard = ({ navigation }: any) => {
  const { user } = useAuth();
  const { suggestions, fetchSuggestions } = useMatching();
  const { unreadCount } = useNotifications();
  const [refreshing, setRefreshing] = useState(false);
  const [portfolioStats, setPortfolioStats] = useState({
    totalInvested: 0,
    activeDeals: 0,
    avgROI: 0,
    impactScore: 0,
  });
  const [impactMetrics, setImpactMetrics] = useState([
    { title: 'Jobs Created', value: '0', change: '+0%', icon: 'work', color: '#1B2A4A' },
    { title: 'SMEs Supported', value: '0', change: '+0%', icon: 'store', color: '#2A3F6A' },
    { title: 'CO₂ Reduced', value: '0', change: '+0%', icon: 'eco', color: '#3A558A' },
    { title: 'Women-Led', value: '0', change: '+0%', icon: 'female', color: '#D4A843' },
  ]);
  const [fadeAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    fetchDashboardData();
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [portfolio, metrics] = await Promise.all([
        investorService.getPortfolio(),
        investorService.getImpactMetrics(),
        fetchSuggestions(),
      ]);

      setPortfolioStats({
        totalInvested: portfolio?.totalInvested || 0,
        activeDeals: portfolio?.activeDeals || 0,
        avgROI: portfolio?.avgROI || 0,
        impactScore: portfolio?.impactScore || 0,
      });

      // Handle metrics - check if it's an array and has data
      if (metrics && Array.isArray(metrics) && metrics.length > 0) {
        setImpactMetrics(metrics.map((m: any) => ({
          title: m.title || 'Unknown',
          value: m.value || '0',
          change: `+${m.change || 0}%`,
          icon: m.icon || 'circle',
          color: m.color || '#1B2A4A',
        })));
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      // Use default values on error
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchDashboardData();
    setRefreshing(false);
  };

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      showsVerticalScrollIndicator={false}
    >
      <LinearGradient
        colors={['#1B2A4A', '#2A3F6A', '#3A558A']}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      >
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.welcomeText}>Welcome back,</Text>
            <Text style={styles.userName}>{user?.fullName || 'Investor'}</Text>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.iconButton} onPress={() => navigation.navigate('Notifications')}>
              <Icon name="notifications-none" size={24} color={COLORS.white} />
              {unreadCount > 0 && (
                <View style={styles.notificationBadge}>
                  <Text style={styles.notificationCount}>{unreadCount}</Text>
                </View>
              )}
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconButton} onPress={() => navigation.navigate('InvestorProfile')}>
              <Icon name="account-circle" size={28} color={COLORS.white} />
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>

      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        <View style={styles.metricsGrid}>
          {impactMetrics.map((metric, index) => (
            <View key={index} style={styles.metricCard}>
              <LinearGradient
                colors={[metric.color + '15', metric.color + '05']}
                style={styles.metricGradient}
              >
                <View style={[styles.metricIcon, { backgroundColor: metric.color + '20' }]}>
                  <Icon name={metric.icon} size={20} color={metric.color} />
                </View>
                <Text style={styles.metricValue}>{metric.value}</Text>
                <Text style={styles.metricTitle}>{metric.title}</Text>
                <View style={[styles.metricChange, { backgroundColor: metric.color + '15' }]}>
                  <Icon name="trending-up" size={12} color={metric.color} />
                  <Text style={[styles.metricChangeText, { color: metric.color }]}>{metric.change}</Text>
                </View>
              </LinearGradient>
            </View>
          ))}
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.cardHeaderLeft}>
              <Icon name="people" size={24} color="#1B2A4A" />
              <Text style={styles.cardTitle}>High-Impact Matches</Text>
            </View>
            <TouchableOpacity onPress={() => navigation.navigate('Matching')}>
              <Text style={styles.viewAll}>View All</Text>
            </TouchableOpacity>
          </View>
          {!suggestions || suggestions.length === 0 ? (
            <View style={styles.emptyState}>
              <Icon name="people" size={48} color="#DEE2E6" />
              <Text style={styles.emptyStateText}>No suggestions yet</Text>
              <Text style={styles.emptyStateSubtext}>We'll find matches for you soon</Text>
            </View>
          ) : (
            suggestions.slice(0, 3).map((item: any) => (
              <TouchableOpacity
                key={item.id}
                style={styles.matchItem}
                onPress={() => navigation.navigate('Matching')}
              >
                <View style={[styles.matchIcon, { backgroundColor: '#1B2A4A' + '20' }]}>
                  <Icon name="business" size={20} color="#1B2A4A" />
                </View>
                <View style={styles.matchInfo}>
                  <Text style={styles.matchName}>{item.name}</Text>
                  <Text style={styles.matchIndustry}>{item.industry}</Text>
                </View>
                <View style={styles.matchStats}>
                  <View style={[styles.matchScoreContainer, { backgroundColor: '#1B2A4A' + '15' }]}>
                    <Text style={[styles.matchScore, { color: '#1B2A4A' }]}>{item.matchScore}%</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))
          )}
          <TouchableOpacity style={styles.viewAllButton} onPress={() => navigation.navigate('Matching')}>
            <Text style={styles.viewAllText}>View All Matches</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Portfolio Summary</Text>
          <View style={styles.portfolioStats}>
            <View style={styles.portfolioStat}>
              <Text style={styles.portfolioStatValue}>M {portfolioStats.totalInvested.toLocaleString()}</Text>
              <Text style={styles.portfolioStatLabel}>Total Invested</Text>
            </View>
            <View style={styles.portfolioDivider} />
            <View style={styles.portfolioStat}>
              <Text style={styles.portfolioStatValue}>{portfolioStats.activeDeals}</Text>
              <Text style={styles.portfolioStatLabel}>Active Deals</Text>
            </View>
            <View style={styles.portfolioDivider} />
            <View style={styles.portfolioStat}>
              <Text style={styles.portfolioStatValue}>{portfolioStats.avgROI}%</Text>
              <Text style={styles.portfolioStatLabel}>Avg ROI</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.portfolioButton} onPress={() => navigation.navigate('Portfolio')}>
            <LinearGradient colors={['#1B2A4A', '#2A3F6A']} style={styles.portfolioGradient}>
              <Text style={styles.portfolioButtonText}>View Full Portfolio</Text>
              <Icon name="arrow-forward" size={16} color={COLORS.white} />
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </ScrollView>
  );
};

// Keep your existing styles...
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F7FA' },
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
  welcomeText: {
    fontSize: TYPOGRAPHY.sizes.md,
    color: 'rgba(255,255,255,0.8)',
  },
  userName: {
    fontSize: TYPOGRAPHY.sizes.xxl,
    fontWeight: 'bold',
    color: COLORS.white,
    marginTop: 2,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  iconButton: {
    padding: SPACING.xs,
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: '#ef4444',
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationCount: {
    fontSize: 10,
    color: COLORS.white,
    fontWeight: 'bold',
  },
  content: { padding: SPACING.lg, paddingBottom: SPACING.xxxl },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.md,
    marginBottom: SPACING.lg,
  },
  metricCard: {
    flex: 1,
    minWidth: '45%',
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
    ...SHADOWS.sm,
  },
  metricGradient: {
    padding: SPACING.md,
    alignItems: 'center',
    borderRadius: BORDER_RADIUS.lg,
  },
  metricIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  metricValue: {
    fontSize: TYPOGRAPHY.sizes.xl,
    fontWeight: 'bold',
    color: '#1B2A4A',
  },
  metricTitle: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: '#64748b',
    marginTop: 2,
    textAlign: 'center',
  },
  metricChange: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.round,
    marginTop: SPACING.xs,
    gap: 4,
  },
  metricChangeText: {
    fontSize: 10,
    fontWeight: '600',
  },
  card: {
    backgroundColor: COLORS.white,
    marginBottom: SPACING.lg,
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
    ...SHADOWS.md,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  cardHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  cardTitle: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: 'bold',
    color: '#1B2A4A',
  },
  viewAll: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: '#1B2A4A',
    fontWeight: '500',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: SPACING.lg,
  },
  emptyStateText: {
    fontSize: TYPOGRAPHY.sizes.md,
    color: '#94a3b8',
    marginTop: SPACING.sm,
  },
  emptyStateSubtext: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: '#cbd5e1',
    marginTop: 2,
  },
  matchItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  matchIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  matchInfo: { flex: 1 },
  matchName: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: '500',
    color: '#1B2A4A',
  },
  matchIndustry: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: '#94a3b8',
    marginTop: 2,
  },
  matchStats: { alignItems: 'flex-end', gap: 4 },
  matchScoreContainer: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.round,
  },
  matchScore: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: 'bold',
  },
  viewAllButton: {
    marginTop: SPACING.md,
    alignItems: 'center',
  },
  viewAllText: {
    color: '#1B2A4A',
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: '500',
  },
  portfolioStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  portfolioStat: {
    flex: 1,
    alignItems: 'center',
  },
  portfolioStatValue: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: 'bold',
    color: '#1B2A4A',
  },
  portfolioStatLabel: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: '#94a3b8',
    marginTop: 4,
  },
  portfolioDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#f1f5f9',
  },
  portfolioButton: {
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
    ...SHADOWS.sm,
  },
  portfolioGradient: {
    flexDirection: 'row',
    paddingVertical: SPACING.md,
    justifyContent: 'center',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  portfolioButtonText: {
    color: COLORS.white,
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: '600',
  },
});