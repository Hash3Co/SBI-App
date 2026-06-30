// ReadinessScoreScreen.tsx
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Animated } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS, SHADOWS } from '../../constants/theme';

export const ReadinessScoreScreen = ({ navigation }: any) => {
  const [fadeAnim] = useState(new Animated.Value(0));
  const score = 65;
  
  const categories = [
    { name: 'Business Plan', score: 80, icon: 'description', color: '#10b981' },
    { name: 'Financial Health', score: 55, icon: 'attach-money', color: '#f59e0b' },
    { name: 'Team Strength', score: 70, icon: 'people', color: '#06b6d4' },
    { name: 'Market Potential', score: 60, icon: 'trending-up', color: '#f59e0b' },
    { name: 'Legal Compliance', score: 45, icon: 'gavel', color: '#ef4444' },
    { name: 'Pitch Deck', score: 85, icon: 'slideshow', color: '#10b981' },
  ];

  React.useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, []);

  const getScoreColor = (s: number) => s >= 80 ? '#10b981' : s >= 60 ? '#f59e0b' : '#ef4444';
  const getScoreEmoji = (s: number) => s >= 80 ? '🌟' : s >= 60 ? '📈' : '💪';

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
          <Text style={styles.headerTitle}>Readiness Score</Text>
          <TouchableOpacity style={styles.shareButton}>
            <Icon name="share" size={24} color={COLORS.white} />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        <View style={styles.scoreCard}>
          <View style={styles.scoreHeader}>
            <Text style={styles.scoreLabel}>Overall Funding Readiness</Text>
            <Text style={styles.scoreEmoji}>{getScoreEmoji(score)}</Text>
          </View>
          
          <View style={styles.scoreCircle}>
            <LinearGradient
              colors={[getScoreColor(score), getScoreColor(score) + '80']}
              style={styles.scoreGradient}
            >
              <Text style={[styles.scoreValue, { color: getScoreColor(score) }]}>
                {score}%
              </Text>
            </LinearGradient>
          </View>

          <View style={styles.scoreBarContainer}>
            <View style={styles.scoreBar}>
              <View style={[styles.scoreProgress, { width: `${score}%`, backgroundColor: getScoreColor(score) }]} />
            </View>
            <View style={styles.scoreLabels}>
              <Text style={styles.scoreLabelText}>0%</Text>
              <Text style={styles.scoreLabelText}>100%</Text>
            </View>
          </View>

          <View style={[styles.scoreMessageContainer, { backgroundColor: getScoreColor(score) + '10' }]}>
            <Icon name="info" size={16} color={getScoreColor(score)} />
            <Text style={[styles.scoreMessage, { color: getScoreColor(score) }]}>
              {score >= 80 ? 'Excellent! You are investment ready.' :
               score >= 60 ? 'Good progress. Complete recommended courses to improve.' :
               'Needs improvement. Focus on the areas below.'}
            </Text>
          </View>
        </View>

        <View style={styles.categoriesCard}>
          <Text style={styles.cardTitle}>Breakdown by Category</Text>
          {categories.map((cat, index) => (
            <Animated.View 
              key={cat.name} 
              style={[
                styles.categoryItem,
                { transform: [{ translateY: fadeAnim.interpolate({ inputRange: [0, 1], outputRange: [20 * (index + 1), 0] }) }] }
              ]}
            >
              <View style={styles.categoryHeader}>
                <View style={[styles.categoryIcon, { backgroundColor: cat.color + '15' }]}>
                  <Icon name={cat.icon} size={18} color={cat.color} />
                </View>
                <Text style={styles.categoryName}>{cat.name}</Text>
                <Text style={[styles.categoryScore, { color: cat.color }]}>{cat.score}%</Text>
              </View>
              <View style={styles.categoryBar}>
                <View style={[styles.categoryProgress, { width: `${cat.score}%`, backgroundColor: cat.color }]} />
              </View>
            </Animated.View>
          ))}
        </View>

        <View style={styles.recommendationsCard}>
          <View style={styles.recommendationsHeader}>
            <Text style={styles.cardTitle}>Recommended Actions</Text>
            <Text style={styles.recommendationsSubtitle}>Complete these to boost your score</Text>
          </View>
          
          <View style={styles.recommendation}>
            <LinearGradient colors={['#6366f1', '#4f46e5']} style={styles.recommendationIcon}>
              <Icon name="school" size={16} color={COLORS.white} />
            </LinearGradient>
            <View style={styles.recommendationContent}>
              <Text style={styles.recommendationText}>Complete "Financial Literacy" course</Text>
              <Text style={styles.recommendationBonus}>+15% score</Text>
            </View>
          </View>
          
          <View style={styles.recommendation}>
            <LinearGradient colors={['#06b6d4', '#0891b2']} style={styles.recommendationIcon}>
              <Icon name="description" size={16} color={COLORS.white} />
            </LinearGradient>
            <View style={styles.recommendationContent}>
              <Text style={styles.recommendationText}>Update your business plan</Text>
              <Text style={styles.recommendationBonus}>+10% score</Text>
            </View>
          </View>
          
          <View style={styles.recommendation}>
            <LinearGradient colors={['#f59e0b', '#d97706']} style={styles.recommendationIcon}>
              <Icon name="gavel" size={16} color={COLORS.white} />
            </LinearGradient>
            <View style={styles.recommendationContent}>
              <Text style={styles.recommendationText}>Upload legal documents</Text>
              <Text style={styles.recommendationBonus}>+20% score</Text>
            </View>
          </View>
        </View>

        <TouchableOpacity style={styles.actionButton} onPress={() => navigation.navigate('CourseLibrary')}>
          <LinearGradient 
            colors={['#10b981', '#059669']} 
            style={styles.actionGradient}
            start={{x: 0, y: 0}}
            end={{x: 1, y: 0}}
          >
            <Icon name="trending-up" size={20} color={COLORS.white} />
            <Text style={styles.actionButtonText}>Improve My Score</Text>
            <Icon name="arrow-forward" size={20} color={COLORS.white} />
          </LinearGradient>
        </TouchableOpacity>
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
  backButton: { padding: SPACING.sm },
  headerTitle: { 
    fontSize: TYPOGRAPHY.sizes.xl, 
    fontWeight: 'bold', 
    color: COLORS.white 
  },
  shareButton: { padding: SPACING.sm },
  content: { padding: SPACING.lg, paddingBottom: SPACING.xxxl },
  scoreCard: { 
    backgroundColor: COLORS.white, 
    padding: SPACING.xl, 
    borderRadius: BORDER_RADIUS.xl, 
    ...SHADOWS.lg,
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  scoreHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  scoreLabel: { 
    fontSize: TYPOGRAPHY.sizes.md, 
    color: '#64748b' 
  },
  scoreEmoji: { 
    fontSize: 24 
  },
  scoreCircle: {
    marginVertical: SPACING.md,
    ...SHADOWS.md,
  },
  scoreGradient: {
    width: 140,
    height: 140,
    borderRadius: 70,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scoreValue: { 
    fontSize: 48, 
    fontWeight: 'bold' 
  },
  scoreBarContainer: {
    width: '100%',
    marginVertical: SPACING.md,
  },
  scoreBar: { 
    width: '100%', 
    height: 8, 
    backgroundColor: '#f1f5f9', 
    borderRadius: BORDER_RADIUS.round, 
    overflow: 'hidden' 
  },
  scoreProgress: { 
    height: '100%', 
    borderRadius: BORDER_RADIUS.round 
  },
  scoreLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  scoreLabelText: {
    fontSize: 10,
    color: '#94a3b8',
  },
  scoreMessageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    marginTop: SPACING.md,
    width: '100%',
  },
  scoreMessage: { 
    flex: 1,
    fontSize: TYPOGRAPHY.sizes.sm, 
    fontWeight: '500',
  },
  categoriesCard: { 
    backgroundColor: COLORS.white, 
    padding: SPACING.lg, 
    borderRadius: BORDER_RADIUS.lg, 
    ...SHADOWS.md,
    marginBottom: SPACING.lg,
  },
  cardTitle: { 
    fontSize: TYPOGRAPHY.sizes.lg, 
    fontWeight: 'bold', 
    color: '#1e293b',
    marginBottom: SPACING.md,
  },
  categoryItem: { 
    marginBottom: SPACING.md 
  },
  categoryHeader: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginBottom: 4,
    gap: SPACING.sm 
  },
  categoryIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryName: { 
    flex: 1, 
    fontSize: TYPOGRAPHY.sizes.sm, 
    fontWeight: '500', 
    color: '#1e293b' 
  },
  categoryScore: { 
    fontSize: TYPOGRAPHY.sizes.sm, 
    fontWeight: 'bold' 
  },
  categoryBar: { 
    height: 6, 
    backgroundColor: '#f1f5f9', 
    borderRadius: BORDER_RADIUS.round, 
    overflow: 'hidden' 
  },
  categoryProgress: { 
    height: '100%', 
    borderRadius: BORDER_RADIUS.round 
  },
  recommendationsCard: { 
    backgroundColor: COLORS.white, 
    padding: SPACING.lg, 
    borderRadius: BORDER_RADIUS.lg, 
    ...SHADOWS.md,
    marginBottom: SPACING.lg,
  },
  recommendationsHeader: {
    marginBottom: SPACING.md,
  },
  recommendationsSubtitle: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: '#94a3b8',
    marginTop: 2,
  },
  recommendation: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: SPACING.md, 
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  recommendationIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  recommendationContent: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  recommendationText: { 
    flex: 1,
    fontSize: TYPOGRAPHY.sizes.sm, 
    color: '#1e293b',
    fontWeight: '500',
  },
  recommendationBonus: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: '#10b981',
    fontWeight: '600',
  },
  actionButton: { 
    marginBottom: SPACING.xxxl,
    ...SHADOWS.md,
  },
  actionGradient: { 
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    paddingVertical: SPACING.md, 
    borderRadius: BORDER_RADIUS.lg 
  },
  actionButtonText: { 
    color: COLORS.white, 
    fontSize: TYPOGRAPHY.sizes.md, 
    fontWeight: 'bold' 
  },
});