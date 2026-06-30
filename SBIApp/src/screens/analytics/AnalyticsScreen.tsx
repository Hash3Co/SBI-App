import React from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions, TouchableOpacity, Animated } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS, SHADOWS } from '../../constants/theme';

const { width } = Dimensions.get('window');

export const AnalyticsScreen = ({ navigation }: any) => {
  const stats = [
    { label: 'Profile Views', value: '1,234', change: '+12%', icon: 'visibility', color: '#6366f1' },
    { label: 'Matches', value: '23', change: '+5', icon: 'people', color: '#ec4899' },
    { label: 'Messages', value: '45', change: '+8', icon: 'message', color: '#06b6d4' },
    { label: 'Course Progress', value: '65%', change: '+15%', icon: 'school', color: '#f59e0b' },
  ];

  const [animatedValues] = React.useState(stats.map(() => new Animated.Value(0)));

  React.useEffect(() => {
    Animated.stagger(100, animatedValues.map((anim) => 
      Animated.timing(anim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      })
    )).start();
  }, []);

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <LinearGradient 
        colors={['#6366f1', '#4f46e5', '#4338ca']} 
        start={{x: 0, y: 0}}
        end={{x: 1, y: 0}}
        style={styles.header}
      >
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Icon name="arrow-back" size={24} color={COLORS.white} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Analytics</Text>
          <TouchableOpacity style={styles.filterButton}>
            <Icon name="more-vert" size={24} color={COLORS.white} />
          </TouchableOpacity>
        </View>
        <View style={styles.headerStats}>
          <View style={styles.headerStat}>
            <Text style={styles.headerStatValue}>87%</Text>
            <Text style={styles.headerStatLabel}>Engagement</Text>
          </View>
          <View style={styles.headerDivider} />
          <View style={styles.headerStat}>
            <Text style={styles.headerStatValue}>2.4k</Text>
            <Text style={styles.headerStatLabel}>Impressions</Text>
          </View>
          <View style={styles.headerDivider} />
          <View style={styles.headerStat}>
            <Text style={styles.headerStatValue}>156</Text>
            <Text style={styles.headerStatLabel}>Interactions</Text>
          </View>
        </View>
      </LinearGradient>

      <View style={styles.content}>
        <Text style={styles.sectionTitle}>Overview</Text>
        <View style={styles.statsGrid}>
          {stats.map((stat, index) => (
            <Animated.View 
              key={stat.label} 
              style={[
                styles.statCard,
                {
                  opacity: animatedValues[index],
                  transform: [{ scale: animatedValues[index] }],
                }
              ]}
            >
              <LinearGradient
                colors={[stat.color + '20', stat.color + '10']}
                style={styles.statGradient}
              >
                <View style={[styles.statIconContainer, { backgroundColor: stat.color + '20' }]}>
                  <Icon name={stat.icon} size={24} color={stat.color} />
                </View>
                <Text style={styles.statValue}>{stat.value}</Text>
                <Text style={styles.statLabel}>{stat.label}</Text>
                <View style={[styles.statChangeContainer, { backgroundColor: stat.color + '15' }]}>
                  <Icon name="trending-up" size={14} color={stat.color} />
                  <Text style={[styles.statChange, { color: stat.color }]}>{stat.change}</Text>
                </View>
              </LinearGradient>
            </Animated.View>
          ))}
        </View>

        <View style={styles.chartCard}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Profile Performance</Text>
            <TouchableOpacity>
              <Text style={styles.viewAll}>View All</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.chartPlaceholder}>
            <LinearGradient
              colors={['#6366f1', '#4f46e5']}
              style={styles.chartGradient}
            >
              <View style={styles.chartBars}>
                {[0.5, 0.8, 0.6, 0.9, 0.7, 0.4, 0.8, 0.6, 0.3].map((height, i) => (
                  <View key={i} style={styles.chartBarContainer}>
                    <View style={[styles.chartBar, { height: height * 120 }]} />
                    <Text style={styles.chartLabel}>{['M','T','W','T','F','S','S'][i]}</Text>
                  </View>
                ))}
              </View>
            </LinearGradient>
          </View>
        </View>

        <View style={styles.insightsCard}>
          <Text style={styles.cardTitle}>Key Insights</Text>
          <View style={styles.insightItem}>
            <LinearGradient colors={['#6366f1', '#4f46e5']} style={styles.insightIcon}>
              <Icon name="trending-up" size={20} color={COLORS.white} />
            </LinearGradient>
            <View style={styles.insightContent}>
              <Text style={styles.insightText}>Your profile is in the top 15% of all profiles</Text>
              <Text style={styles.insightSubtext}>Based on engagement metrics</Text>
            </View>
          </View>
          <View style={styles.insightItem}>
            <LinearGradient colors={['#ec4899', '#db2777']} style={styles.insightIcon}>
              <Icon name="people" size={20} color={COLORS.white} />
            </LinearGradient>
            <View style={styles.insightContent}>
              <Text style={styles.insightText}>You've been matched with 23 potential investors</Text>
              <Text style={styles.insightSubtext}>5 new this week</Text>
            </View>
          </View>
          <View style={styles.insightItem}>
            <LinearGradient colors={['#06b6d4', '#0891b2']} style={styles.insightIcon}>
              <Icon name="school" size={20} color={COLORS.white} />
            </LinearGradient>
            <View style={styles.insightContent}>
              <Text style={styles.insightText}>Complete financial literacy course to boost score</Text>
              <Text style={styles.insightSubtext}>65% completed</Text>
            </View>
          </View>
        </View>
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
  headerTop: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  backButton: { padding: SPACING.sm },
  headerTitle: { 
    fontSize: TYPOGRAPHY.sizes.xl, 
    fontWeight: 'bold', 
    color: COLORS.white 
  },
  filterButton: { padding: SPACING.sm },
  headerStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginTop: SPACING.sm,
  },
  headerStat: { alignItems: 'center' },
  headerStatValue: { 
    fontSize: TYPOGRAPHY.sizes.xxl, 
    fontWeight: 'bold', 
    color: COLORS.white 
  },
  headerStatLabel: { 
    fontSize: TYPOGRAPHY.sizes.xs, 
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },
  headerDivider: { width: 1, backgroundColor: 'rgba(255,255,255,0.2)' },
  content: { padding: SPACING.lg, paddingBottom: SPACING.xxxl },
  sectionTitle: { 
    fontSize: TYPOGRAPHY.sizes.lg, 
    fontWeight: 'bold', 
    color: '#1e293b',
    marginBottom: SPACING.md,
  },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.md, marginBottom: SPACING.lg },
  statCard: { 
    flex: 1, 
    minWidth: '45%',
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
    ...SHADOWS.md,
  },
  statGradient: { 
    padding: SPACING.md, 
    alignItems: 'center',
  },
  statIconContainer: { 
    width: 48, 
    height: 48, 
    borderRadius: 24, 
    justifyContent: 'center', 
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  statValue: { 
    fontSize: TYPOGRAPHY.sizes.xxl, 
    fontWeight: 'bold', 
    color: '#1e293b' 
  },
  statLabel: { 
    fontSize: TYPOGRAPHY.sizes.sm, 
    color: '#64748b',
    marginTop: 2,
  },
  statChangeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.round,
    marginTop: SPACING.xs,
    gap: 4,
  },
  statChange: { fontSize: TYPOGRAPHY.sizes.xs, fontWeight: '600' },
  chartCard: { 
    backgroundColor: COLORS.white, 
    borderRadius: BORDER_RADIUS.lg, 
    padding: SPACING.lg, 
    marginBottom: SPACING.lg, 
    ...SHADOWS.md 
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  cardTitle: { 
    fontSize: TYPOGRAPHY.sizes.lg, 
    fontWeight: 'bold', 
    color: '#1e293b' 
  },
  viewAll: { 
    fontSize: TYPOGRAPHY.sizes.sm, 
    color: '#6366f1',
    fontWeight: '500',
  },
  chartPlaceholder: { 
    height: 200, 
    borderRadius: BORDER_RADIUS.md,
    overflow: 'hidden',
  },
  chartGradient: {
    flex: 1,
    padding: SPACING.md,
    justifyContent: 'flex-end',
  },
  chartBars: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    height: '100%',
  },
  chartBarContainer: {
    alignItems: 'center',
  },
  chartBar: {
    width: 20,
    backgroundColor: 'rgba(255,255,255,0.8)',
    borderRadius: BORDER_RADIUS.round,
  },
  chartLabel: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4,
  },
  insightsCard: { 
    backgroundColor: COLORS.white, 
    borderRadius: BORDER_RADIUS.lg, 
    padding: SPACING.lg, 
    ...SHADOWS.md 
  },
  insightItem: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: SPACING.md, 
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  insightIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  insightContent: { flex: 1 },
  insightText: { 
    fontSize: TYPOGRAPHY.sizes.sm, 
    color: '#1e293b',
    fontWeight: '500',
  },
  insightSubtext: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: '#94a3b8',
    marginTop: 2,
  },
});