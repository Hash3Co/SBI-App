import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, Animated, Dimensions } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useAuth } from '../../context/AuthenticationContext';
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS, SHADOWS } from '../../constants/theme';

const { width } = Dimensions.get('window');

export const InvestorDashboard = ({ navigation }: any) => {
  const { user } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const scrollX = useRef(new Animated.Value(0)).current;
  
  const [matches] = useState([
    { id: '1', name: 'Tech Solutions Ltd', industry: 'Technology', matchScore: 92, impact: 'High', color: '#6366f1' },
    { id: '2', name: 'Green Energy Africa', industry: 'Energy', matchScore: 88, impact: 'Very High', color: '#06b6d4' },
    { id: '3', name: 'AgriFresh', industry: 'Agriculture', matchScore: 85, impact: 'Medium', color: '#10b981' },
  ]);

  const impactMetrics = [
    { title: 'Jobs Created', value: '1,247', change: '+12.5%', icon: 'work', color: '#6366f1' },
    { title: 'SMEs Supported', value: '89', change: '+8.3%', icon: 'store', color: '#ec4899' },
    { title: 'CO₂ Reduced', value: '3,452', change: '+23.1%', icon: 'eco', color: '#06b6d4' },
    { title: 'Women-Led', value: '34', change: '+15.2%', icon: 'female', color: '#f59e0b' },
  ];

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1500);
  };

  const renderCarousel = () => {
    const totalCards = 3;
    return (
      <View style={styles.carouselContainer}>
        <Animated.ScrollView
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { x: scrollX } } }],
            { useNativeDriver: true }
          )}
          scrollEventThrottle={16}
        >
          <View style={styles.carouselCard}>
            <LinearGradient colors={['#6366f1', '#4f46e5']} style={styles.carouselGradient}>
              <View style={styles.carouselContent}>
                <Text style={styles.carouselTitle}>Portfolio Value</Text>
                <Text style={styles.carouselValue}>M 12.4M</Text>
                <Text style={styles.carouselChange}>↑ 24.5% ROI</Text>
                <TouchableOpacity style={styles.carouselButton}>
                  <Text style={styles.carouselButtonText}>View Details</Text>
                  <Icon name="arrow-forward" size={16} color={COLORS.white} />
                </TouchableOpacity>
              </View>
            </LinearGradient>
          </View>
          <View style={styles.carouselCard}>
            <LinearGradient colors={['#ec4899', '#db2777']} style={styles.carouselGradient}>
              <View style={styles.carouselContent}>
                <Text style={styles.carouselTitle}>Active Deals</Text>
                <Text style={styles.carouselValue}>18</Text>
                <Text style={styles.carouselChange}>↑ 3 new this month</Text>
                <TouchableOpacity style={styles.carouselButton}>
                  <Text style={styles.carouselButtonText}>View Deals</Text>
                  <Icon name="arrow-forward" size={16} color={COLORS.white} />
                </TouchableOpacity>
              </View>
            </LinearGradient>
          </View>
          <View style={styles.carouselCard}>
            <LinearGradient colors={['#06b6d4', '#0891b2']} style={styles.carouselGradient}>
              <View style={styles.carouselContent}>
                <Text style={styles.carouselTitle}>Impact Score</Text>
                <Text style={styles.carouselValue}>86</Text>
                <Text style={styles.carouselChange}>↑ ESG Rating</Text>
                <TouchableOpacity style={styles.carouselButton}>
                  <Text style={styles.carouselButtonText}>View Impact</Text>
                  <Icon name="arrow-forward" size={16} color={COLORS.white} />
                </TouchableOpacity>
              </View>
            </LinearGradient>
          </View>
        </Animated.ScrollView>
        <View style={styles.dotsContainer}>
          {[...Array(totalCards)].map((_, i) => {
            const inputRange = [(i - 1) * width, i * width, (i + 1) * width];
            // ✅ Use scale and opacity instead of width
            const scale = scrollX.interpolate({
              inputRange,
              outputRange: [0.8, 1.2, 0.8],
              extrapolate: 'clamp',
            });
            const opacity = scrollX.interpolate({
              inputRange,
              outputRange: [0.3, 1, 0.3],
              extrapolate: 'clamp',
            });
            return (
              <Animated.View
                key={i}
                style={[
                  styles.dot,
                  { 
                    opacity, 
                    transform: [{ scale }],
                  }
                ]}
              />
            );
          })}
        </View>
      </View>
    );
  };

  return (
    <ScrollView 
      style={styles.container} 
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      showsVerticalScrollIndicator={false}
    >
      <LinearGradient 
        colors={['#6366f1', '#4f46e5', '#4338ca']} 
        style={styles.header}
        start={{x: 0, y: 0}}
        end={{x: 1, y: 0}}
      >
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.welcomeText}>Welcome back,</Text>
            <Text style={styles.userName}>{user?.fullName || 'Investor'}</Text>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.iconButton} onPress={() => navigation.navigate('Notifications')}>
              <Icon name="notifications-none" size={24} color={COLORS.white} />
              <View style={styles.notificationBadge}>
                <Text style={styles.notificationCount}>3</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconButton} onPress={() => navigation.navigate('InvestorProfile')}>
              <Icon name="account-circle" size={28} color={COLORS.white} />
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>

      {renderCarousel()}

      <View style={styles.metricsGrid}>
        {impactMetrics.map((metric) => (
          <View key={metric.title} style={styles.metricCard}>
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

      <View style={styles.esgCard}>
        <View style={styles.esgHeader}>
          <View style={styles.esgIcon}>
            <Icon name="verified" size={20} color={COLORS.white} />
          </View>
          <Text style={styles.esgTitle}>ESG Impact Score</Text>
          <Text style={styles.esgSubtitle}>Sustainability Rating</Text>
        </View>
        
        <View style={styles.esgScoreContainer}>
          <View style={styles.esgScoreCircle}>
            <LinearGradient colors={['#10b981', '#059669']} style={styles.esgCircleGradient}>
              <Text style={styles.esgScore}>86</Text>
              <Text style={styles.esgMax}>/100</Text>
            </LinearGradient>
          </View>
        </View>

        <View style={styles.esgBreakdown}>
          <View style={styles.esgItem}>
            <View style={[styles.esgDot, { backgroundColor: '#27ae60' }]} />
            <Text style={styles.esgItemText}>Environmental</Text>
            <Text style={styles.esgItemValue}>82</Text>
          </View>
          <View style={styles.esgItem}>
            <View style={[styles.esgDot, { backgroundColor: '#3498db' }]} />
            <Text style={styles.esgItemText}>Social</Text>
            <Text style={styles.esgItemValue}>91</Text>
          </View>
          <View style={styles.esgItem}>
            <View style={[styles.esgDot, { backgroundColor: '#f39c12' }]} />
            <Text style={styles.esgItemText}>Governance</Text>
            <Text style={styles.esgItemValue}>85</Text>
          </View>
        </View>
      </View>

      <View style={styles.matchesCard}>
        <View style={styles.cardHeader}>
          <Text style={styles.sectionTitle}>High-Impact Matches</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Matching')}>
            <Text style={styles.viewAll}>View All</Text>
          </TouchableOpacity>
        </View>
        {matches.map((match) => (
          <TouchableOpacity 
            key={match.id} 
            style={styles.matchItem}
            onPress={() => navigation.navigate('Matching')}
          >
            <View style={[styles.matchIcon, { backgroundColor: match.color + '20' }]}>
              <Icon name="business" size={20} color={match.color} />
            </View>
            <View style={styles.matchInfo}>
              <Text style={styles.matchName}>{match.name}</Text>
              <Text style={styles.matchIndustry}>{match.industry}</Text>
            </View>
            <View style={styles.matchStats}>
              <View style={[styles.matchScoreContainer, { backgroundColor: match.color + '15' }]}>
                <Text style={[styles.matchScore, { color: match.color }]}>{match.matchScore}%</Text>
              </View>
              <View style={styles.matchImpact}>
                <Icon name="eco" size={12} color={match.matchScore >= 85 ? '#10b981' : '#f59e0b'} />
                <Text style={[styles.matchImpactText, { color: match.matchScore >= 85 ? '#10b981' : '#f59e0b' }]}>
                  {match.impact}
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.portfolioCard}>
        <Text style={styles.sectionTitle}>Portfolio Summary</Text>
        <View style={styles.portfolioStats}>
          <View style={styles.portfolioStat}>
            <Text style={styles.portfolioStatValue}>M 12.4M</Text>
            <Text style={styles.portfolioStatLabel}>Total Invested</Text>
          </View>
          <View style={styles.portfolioDivider} />
          <View style={styles.portfolioStat}>
            <Text style={styles.portfolioStatValue}>18</Text>
            <Text style={styles.portfolioStatLabel}>Active Deals</Text>
          </View>
          <View style={styles.portfolioDivider} />
          <View style={styles.portfolioStat}>
            <Text style={styles.portfolioStatValue}>24.5%</Text>
            <Text style={styles.portfolioStatLabel}>Avg ROI</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.portfolioButton}>
          <LinearGradient colors={['#6366f1', '#4f46e5']} style={styles.portfolioGradient}>
            <Text style={styles.portfolioButtonText}>View Full Portfolio</Text>
            <Icon name="arrow-forward" size={16} color={COLORS.white} />
          </LinearGradient>
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
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md },
  iconButton: { padding: SPACING.xs, position: 'relative' },
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
    fontWeight: 'bold' 
  },
  carouselContainer: { marginTop: -30, marginHorizontal: SPACING.lg },
  carouselCard: { 
    width: width - SPACING.xl * 2, 
    paddingHorizontal: 4 
  },
  carouselGradient: { 
    borderRadius: BORDER_RADIUS.xl, 
    padding: SPACING.xl,
    ...SHADOWS.lg,
  },
  carouselContent: { gap: SPACING.xs },
  carouselTitle: { 
    fontSize: TYPOGRAPHY.sizes.md, 
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '500',
  },
  carouselValue: { 
    fontSize: 36, 
    fontWeight: 'bold', 
    color: COLORS.white,
    marginVertical: 4,
  },
  carouselChange: { 
    fontSize: TYPOGRAPHY.sizes.md, 
    color: 'rgba(255,255,255,0.9)',
  },
  carouselButton: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: SPACING.xs,
    marginTop: SPACING.md,
  },
  carouselButtonText: { 
    fontSize: TYPOGRAPHY.sizes.sm, 
    color: COLORS.white, 
    fontWeight: '600' 
  },
  dotsContainer: { 
    flexDirection: 'row', 
    justifyContent: 'center', 
    alignItems: 'center',
    marginTop: SPACING.md,
    gap: 8,
  },
  dot: { 
    height: 8,
    width: 8,
    borderRadius: 4,
    backgroundColor: '#6366f1',
  },
  metricsGrid: { 
    flexDirection: 'row', 
    flexWrap: 'wrap', 
    padding: SPACING.lg,
    gap: SPACING.md,
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
    marginBottom: SPACING.sm 
  },
  metricValue: { 
    fontSize: TYPOGRAPHY.sizes.xl, 
    fontWeight: 'bold', 
    color: '#1e293b' 
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
    fontWeight: '600' 
  },
  esgCard: { 
    backgroundColor: COLORS.white, 
    marginHorizontal: SPACING.lg, 
    padding: SPACING.lg, 
    borderRadius: BORDER_RADIUS.lg, 
    ...SHADOWS.md,
    marginBottom: SPACING.lg,
  },
  esgHeader: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  esgIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#10b981',
    justifyContent: 'center',
    alignItems: 'center',
  },
  esgTitle: { 
    fontSize: TYPOGRAPHY.sizes.lg, 
    fontWeight: 'bold', 
    color: '#1e293b',
    flex: 1,
  },
  esgSubtitle: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: '#94a3b8',
  },
  esgScoreContainer: { 
    alignItems: 'center', 
    marginVertical: SPACING.md 
  },
  esgScoreCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    overflow: 'hidden',
    ...SHADOWS.md,
  },
  esgCircleGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  esgScore: { 
    fontSize: 40, 
    fontWeight: 'bold', 
    color: COLORS.white 
  },
  esgMax: { 
    fontSize: TYPOGRAPHY.sizes.md, 
    color: 'rgba(255,255,255,0.8)' 
  },
  esgBreakdown: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    marginTop: SPACING.md,
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  esgItem: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: SPACING.xs 
  },
  esgDot: { 
    width: 8, 
    height: 8, 
    borderRadius: 4 
  },
  esgItemText: { 
    fontSize: 10, 
    color: '#64748b' 
  },
  esgItemValue: { 
    fontSize: TYPOGRAPHY.sizes.sm, 
    fontWeight: 'bold', 
    color: '#1e293b' 
  },
  matchesCard: { 
    backgroundColor: COLORS.white, 
    marginHorizontal: SPACING.lg, 
    padding: SPACING.lg, 
    borderRadius: BORDER_RADIUS.lg, 
    ...SHADOWS.md,
    marginBottom: SPACING.lg,
  },
  cardHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: SPACING.md 
  },
  sectionTitle: { 
    fontSize: TYPOGRAPHY.sizes.lg, 
    fontWeight: 'bold', 
    color: '#1e293b' 
  },
  viewAll: { 
    fontSize: TYPOGRAPHY.sizes.sm, 
    color: '#6366f1', 
    fontWeight: '500' 
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
    color: '#1e293b' 
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
    fontWeight: 'bold' 
  },
  matchImpact: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 4 
  },
  matchImpactText: { 
    fontSize: 10, 
    fontWeight: '500' 
  },
  portfolioCard: { 
    backgroundColor: COLORS.white, 
    marginHorizontal: SPACING.lg, 
    marginBottom: SPACING.xxxl, 
    padding: SPACING.lg, 
    borderRadius: BORDER_RADIUS.lg, 
    ...SHADOWS.md,
  },
  portfolioStats: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  portfolioStat: { 
    flex: 1, 
    alignItems: 'center' 
  },
  portfolioStatValue: { 
    fontSize: TYPOGRAPHY.sizes.lg, 
    fontWeight: 'bold', 
    color: '#6366f1' 
  },
  portfolioStatLabel: { 
    fontSize: TYPOGRAPHY.sizes.xs, 
    color: '#94a3b8', 
    marginTop: 4 
  },
  portfolioDivider: { 
    width: 1, 
    height: 40, 
    backgroundColor: '#f1f5f9' 
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
    fontWeight: '600' 
  },
});