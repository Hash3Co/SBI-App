// SMEDashboard.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, Animated } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useAuth } from '../../context/AuthenticationContext';
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS, SHADOWS } from '../../constants/theme';
import { Match, Course } from '../../types';

export const SMEDashboard = ({ navigation }: any) => {
  const { user } = useAuth();
  const [matches, setMatches] = useState<Match[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [readinessScore, setReadinessScore] = useState(65);
  const [refreshing, setRefreshing] = useState(false);
  const [profileCompletion, setProfileCompletion] = useState(60);
  const [fadeAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    // Load matches and courses from API or local storage
    setMatches([]);
    setCourses([]);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setRefreshing(false);
  };

  const getScoreColor = (score: number) => score >= 80 ? '#10b981' : score >= 60 ? '#f59e0b' : '#ef4444';
  const quickActions = [
    { icon: 'search', label: 'Find Investors', color: '#6366f1', onPress: () => navigation.navigate('Matching') },
    { icon: 'school', label: 'Take Courses', color: '#06b6d4', onPress: () => navigation.navigate('CourseLibrary') },
    { icon: 'analytics', label: 'Readiness Score', color: '#10b981', onPress: () => navigation.navigate('ReadinessScore') },
    { icon: 'edit', label: 'Edit Profile', color: '#f59e0b', onPress: () => navigation.navigate('SMEProfile') },
  ];

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
            <Text style={styles.userName}>{user?.fullName || 'SME User'}</Text>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.iconButton} onPress={() => navigation.navigate('Notifications')}>
              <Icon name="notifications-none" size={24} color={COLORS.white} />
              <View style={styles.notificationBadge}>
                <Text style={styles.notificationCount}>3</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconButton} onPress={() => navigation.navigate('Settings')}>
              <Icon name="settings" size={24} color={COLORS.white} />
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>

      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        <View style={styles.scoreCard}>
          <View style={styles.scoreHeader}>
            <Text style={styles.scoreTitle}>Funding Readiness Score</Text>
            <TouchableOpacity onPress={() => navigation.navigate('ReadinessScore')}>
              <Text style={styles.scoreDetail}>Details</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.scoreCircle}>
            <Text style={[styles.scoreValue, { color: getScoreColor(readinessScore) }]}>
              {readinessScore}%
            </Text>
          </View>
          <View style={styles.scoreBar}>
            <View style={[styles.scoreProgress, { width: `${readinessScore}%`, backgroundColor: getScoreColor(readinessScore) }]} />
          </View>
          <TouchableOpacity style={styles.improveButton} onPress={() => navigation.navigate('ReadinessScore')}>
            <LinearGradient colors={[getScoreColor(readinessScore), getScoreColor(readinessScore) + 'CC']} style={styles.improveGradient}>
              <Text style={styles.improveButtonText}>Improve Your Score →</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        <View style={styles.quickActions}>
          {quickActions.map((action, index) => (
            <TouchableOpacity key={index} style={styles.quickAction} onPress={action.onPress}>
              <LinearGradient colors={[action.color, action.color + 'CC']} style={styles.quickActionIcon}>
                <Icon name={action.icon} size={24} color={COLORS.white} />
              </LinearGradient>
              <Text style={styles.quickActionLabel}>{action.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.cardHeaderLeft}>
              <Icon name="assignment" size={24} color="#6366f1" />
              <Text style={styles.cardTitle}>Profile Completion</Text>
            </View>
            <Text style={styles.completionPercent}>{profileCompletion}%</Text>
          </View>
          <View style={styles.completionBar}>
            <View style={[styles.completionProgress, { width: `${profileCompletion}%` }]} />
          </View>
          <Text style={styles.completionText}>
            {profileCompletion < 50 ? 'Complete your profile to attract more investors' :
             profileCompletion < 80 ? 'Almost there! Add more details' :
             'Great! Your profile is complete'}
          </Text>
          <TouchableOpacity style={styles.completeButton} onPress={() => navigation.navigate('SMEProfile')}>
            <LinearGradient colors={['#6366f1', '#4f46e5']} style={styles.completeGradient}>
              <Text style={styles.completeButtonText}>
                {profileCompletion < 100 ? 'Complete Your Profile' : 'View Profile'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.cardHeaderLeft}>
              <Icon name="people" size={24} color="#6366f1" />
              <Text style={styles.cardTitle}>Potential Investors</Text>
            </View>
            <Text style={styles.cardCount}>{matches.length} matches</Text>
          </View>
          {matches.length === 0 ? (
            <View style={styles.emptyState}>
              <Icon name="people" size={48} color="#e2e8f0" />
              <Text style={styles.emptyStateText}>No matches yet</Text>
              <Text style={styles.emptyStateSubtext}>Complete your profile to get matched</Text>
            </View>
          ) : (
            matches.map(match => (
              <TouchableOpacity key={match.id} style={styles.matchItem} onPress={() => navigation.navigate('Matching')}>
                <View>
                  <Text style={styles.matchName}>{match.investorProfile?.fullName || 'Investor'}</Text>
                  <Text style={styles.matchScore}>Match: {match.matchScore}%</Text>
                </View>
                <Icon name="chevron-right" size={20} color="#94a3b8" />
              </TouchableOpacity>
            ))
          )}
          <TouchableOpacity style={styles.viewAllButton} onPress={() => navigation.navigate('Matching')}>
            <Text style={styles.viewAllText}>View All Matches</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.cardHeaderLeft}>
              <Icon name="school" size={24} color="#6366f1" />
              <Text style={styles.cardTitle}>Recommended for You</Text>
            </View>
            <Text style={styles.cardCount}>{courses.length} courses</Text>
          </View>
          {courses.length === 0 ? (
            <View style={styles.emptyState}>
              <Icon name="school" size={48} color="#e2e8f0" />
              <Text style={styles.emptyStateText}>No courses available</Text>
              <Text style={styles.emptyStateSubtext}>Check back later for new recommendations</Text>
            </View>
          ) : (
            courses.map(course => (
              <TouchableOpacity key={course.id} style={styles.courseItem} onPress={() => navigation.navigate('CourseDetail', { courseId: course.id })}>
                <View>
                  <Text style={styles.courseTitle}>{course.title}</Text>
                  <Text style={styles.courseDuration}>{course.duration}</Text>
                </View>
                <Icon name="play-circle-outline" size={24} color="#6366f1" />
              </TouchableOpacity>
            ))
          )}
          <TouchableOpacity style={styles.viewAllButton} onPress={() => navigation.navigate('CourseLibrary')}>
            <Text style={styles.viewAllText}>Browse All Courses</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
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
  headerActions: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: SPACING.md 
  },
  iconButton: { 
    padding: SPACING.xs, 
    position: 'relative' 
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
    fontWeight: 'bold' 
  },
  content: { padding: SPACING.lg, paddingBottom: SPACING.xxxl },
  scoreCard: { 
    backgroundColor: COLORS.white, 
    marginBottom: SPACING.lg, 
    padding: SPACING.xl, 
    borderRadius: BORDER_RADIUS.xl, 
    ...SHADOWS.lg,
    alignItems: 'center',
  },
  scoreHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: SPACING.md,
  },
  scoreTitle: { 
    fontSize: TYPOGRAPHY.sizes.md, 
    color: '#64748b' 
  },
  scoreDetail: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: '#6366f1',
    fontWeight: '500',
  },
  scoreCircle: { marginVertical: SPACING.md },
  scoreValue: { fontSize: 48, fontWeight: 'bold' },
  scoreBar: { 
    width: '100%', 
    height: 8, 
    backgroundColor: '#f1f5f9', 
    borderRadius: BORDER_RADIUS.round, 
    overflow: 'hidden',
    marginVertical: SPACING.md,
  },
  scoreProgress: { 
    height: '100%', 
    borderRadius: BORDER_RADIUS.round 
  },
  improveButton: {
    width: '100%',
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
  },
  improveGradient: {
    paddingVertical: SPACING.sm,
    alignItems: 'center',
  },
  improveButtonText: { 
    color: COLORS.white, 
    fontSize: TYPOGRAPHY.sizes.sm, 
    fontWeight: '600' 
  },
  quickActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  quickAction: {
    flex: 1,
    minWidth: '45%',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    ...SHADOWS.sm,
  },
  quickActionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  quickActionLabel: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: '#64748b',
    fontWeight: '500',
  },
  card: { 
    backgroundColor: COLORS.white, 
    marginBottom: SPACING.lg, 
    padding: SPACING.lg, 
    borderRadius: BORDER_RADIUS.lg, 
    ...SHADOWS.md 
  },
  cardHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: SPACING.md 
  },
  cardHeaderLeft: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: SPACING.sm 
  },
  cardTitle: { 
    fontSize: TYPOGRAPHY.sizes.lg, 
    fontWeight: 'bold', 
    color: '#1e293b' 
  },
  cardCount: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: '#94a3b8',
  },
  completionPercent: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: 'bold',
    color: '#6366f1',
  },
  completionBar: { 
    height: 8, 
    backgroundColor: '#f1f5f9', 
    borderRadius: BORDER_RADIUS.round, 
    overflow: 'hidden',
    marginVertical: SPACING.sm,
  },
  completionProgress: { 
    height: '100%', 
    backgroundColor: '#10b981', 
    borderRadius: BORDER_RADIUS.round 
  },
  completionText: { 
    fontSize: TYPOGRAPHY.sizes.sm, 
    color: '#64748b', 
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  completeButton: {
    borderRadius: BORDER_RADIUS.md,
    overflow: 'hidden',
  },
  completeGradient: {
    paddingVertical: SPACING.sm,
    alignItems: 'center',
  },
  completeButtonText: { 
    color: COLORS.white, 
    fontSize: TYPOGRAPHY.sizes.sm, 
    fontWeight: '500' 
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
    justifyContent: 'space-between', 
    alignItems: 'center', 
    paddingVertical: SPACING.md, 
    borderBottomWidth: 1, 
    borderBottomColor: '#f1f5f9' 
  },
  matchName: { 
    fontSize: TYPOGRAPHY.sizes.md, 
    fontWeight: '500', 
    color: '#1e293b' 
  },
  matchScore: { 
    fontSize: TYPOGRAPHY.sizes.sm, 
    color: '#10b981', 
    marginTop: 2,
  },
  viewAllButton: { 
    marginTop: SPACING.md, 
    alignItems: 'center' 
  },
  viewAllText: { 
    color: '#6366f1', 
    fontSize: TYPOGRAPHY.sizes.sm, 
    fontWeight: '500' 
  },
  courseItem: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    paddingVertical: SPACING.md, 
    borderBottomWidth: 1, 
    borderBottomColor: '#f1f5f9' 
  },
  courseTitle: { 
    fontSize: TYPOGRAPHY.sizes.md, 
    fontWeight: '500', 
    color: '#1e293b' 
  },
  courseDuration: { 
    fontSize: TYPOGRAPHY.sizes.sm, 
    color: '#94a3b8', 
    marginTop: 2,
  },
});