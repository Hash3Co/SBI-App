// MatchingScreen.tsx
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Animated } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS, SHADOWS } from '../../constants/theme';

export const MatchingScreen = ({ navigation }: any) => {
  const [activeTab, setActiveTab] = useState<'matches' | 'suggestions'>('matches');
  const [fadeAnim] = useState(new Animated.Value(0));
  
  const matches = [
    { id: '1', name: 'Tech Solutions Ltd', industry: 'Technology', matchScore: 92, location: 'Maseru', funding: 500000, color: '#6366f1' },
    { id: '2', name: 'Green Energy Africa', industry: 'Energy', matchScore: 88, location: 'Johannesburg', funding: 1250000, color: '#06b6d4' },
    { id: '3', name: 'AgriFresh', industry: 'Agriculture', matchScore: 85, location: 'Bloemfontein', funding: 350000, color: '#10b981' },
  ];

  const suggestions = [
    { id: '4', name: 'FinTech Innovations', industry: 'Fintech', matchScore: 78, location: 'Cape Town', funding: 750000, color: '#ec4899' },
    { id: '5', name: 'EduTech Africa', industry: 'Education', matchScore: 72, location: 'Durban', funding: 250000, color: '#f59e0b' },
  ];

  const data = activeTab === 'matches' ? matches : suggestions;

  React.useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
  }, [activeTab]);

  const getScoreColor = (score: number) => {
    if (score >= 85) return '#10b981';
    if (score >= 70) return '#f59e0b';
    return '#ef4444';
  };

  return (
    <View style={styles.container}>
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
          <Text style={styles.headerTitle}>Matching</Text>
          <TouchableOpacity style={styles.filterButton}>
            <Icon name="tune" size={24} color={COLORS.white} />
          </TouchableOpacity>
        </View>
        <View style={styles.headerStats}>
          <View style={styles.headerStat}>
            <Text style={styles.headerStatValue}>23</Text>
            <Text style={styles.headerStatLabel}>Matches</Text>
          </View>
          <View style={styles.headerDivider} />
          <View style={styles.headerStat}>
            <Text style={styles.headerStatValue}>85%</Text>
            <Text style={styles.headerStatLabel}>Avg Match</Text>
          </View>
          <View style={styles.headerDivider} />
          <View style={styles.headerStat}>
            <Text style={styles.headerStatValue}>12</Text>
            <Text style={styles.headerStatLabel}>Pending</Text>
          </View>
        </View>
      </LinearGradient>

      <View style={styles.tabContainer}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'matches' && styles.tabActive]} 
          onPress={() => setActiveTab('matches')}
        >
          <Icon name="people" size={20} color={activeTab === 'matches' ? COLORS.white : '#94a3b8'} />
          <Text style={[styles.tabText, activeTab === 'matches' && styles.tabTextActive]}>My Matches</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'suggestions' && styles.tabActive]} 
          onPress={() => setActiveTab('suggestions')}
        >
          <Icon name="lightbulb" size={20} color={activeTab === 'suggestions' ? COLORS.white : '#94a3b8'} />
          <Text style={[styles.tabText, activeTab === 'suggestions' && styles.tabTextActive]}>Suggestions</Text>
        </TouchableOpacity>
      </View>

      <Animated.ScrollView 
        style={[styles.content, { opacity: fadeAnim }]} 
        showsVerticalScrollIndicator={false}
      >
        {data.map(item => (
          <View key={item.id} style={styles.matchCard}>
            <View style={styles.matchHeader}>
              <View style={styles.matchLeft}>
                <View style={[styles.matchIcon, { backgroundColor: item.color + '20' }]}>
                  <Icon name="business" size={24} color={item.color} />
                </View>
                <View>
                  <Text style={styles.matchName}>{item.name}</Text>
                  <Text style={styles.matchIndustry}>{item.industry}</Text>
                </View>
              </View>
              <View style={styles.matchScoreContainer}>
                <View style={[styles.matchScoreBadge, { backgroundColor: getScoreColor(item.matchScore) + '20' }]}>
                  <Text style={[styles.matchScoreText, { color: getScoreColor(item.matchScore) }]}>
                    {item.matchScore}%
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.matchDetails}>
              <View style={styles.detailItem}>
                <Icon name="place" size={16} color="#94a3b8" />
                <Text style={styles.detailText}>{item.location}</Text>
              </View>
              <View style={styles.detailDivider} />
              <View style={styles.detailItem}>
                <Icon name="attach-money" size={16} color="#94a3b8" />
                <Text style={styles.detailText}>M {item.funding.toLocaleString()}</Text>
              </View>
              <View style={styles.detailDivider} />
              <View style={styles.detailItem}>
                <Icon name="verified" size={16} color="#10b981" />
                <Text style={[styles.detailText, { color: '#10b981' }]}>Verified</Text>
              </View>
            </View>

            <View style={styles.matchActions}>
              <TouchableOpacity style={styles.connectButton}>
                <LinearGradient colors={['#6366f1', '#4f46e5']} style={styles.connectGradient}>
                  <Icon name="handshake" size={16} color={COLORS.white} />
                  <Text style={styles.connectButtonText}>Connect</Text>
                </LinearGradient>
              </TouchableOpacity>
              <TouchableOpacity style={styles.messageButton}>
                <Icon name="message" size={20} color="#6366f1" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveButton}>
                <Icon name="bookmark-border" size={20} color="#94a3b8" />
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </Animated.ScrollView>
    </View>
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
    marginBottom: SPACING.lg,
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
    padding: SPACING.md,
  },
  headerStat: { alignItems: 'center' },
  headerStatValue: { 
    fontSize: TYPOGRAPHY.sizes.lg, 
    fontWeight: 'bold', 
    color: COLORS.white 
  },
  headerStatLabel: { 
    fontSize: TYPOGRAPHY.sizes.xs, 
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },
  headerDivider: { width: 1, backgroundColor: 'rgba(255,255,255,0.2)' },
  tabContainer: { 
    flexDirection: 'row', 
    backgroundColor: COLORS.white, 
    marginHorizontal: SPACING.lg, 
    marginTop: -SPACING.lg, 
    borderRadius: BORDER_RADIUS.lg, 
    ...SHADOWS.md,
    padding: 4,
  },
  tab: { 
    flex: 1, 
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    paddingVertical: SPACING.md, 
    borderRadius: BORDER_RADIUS.lg,
  },
  tabActive: { backgroundColor: '#6366f1' },
  tabText: { 
    fontSize: TYPOGRAPHY.sizes.md, 
    color: '#94a3b8',
    fontWeight: '500',
  },
  tabTextActive: { color: COLORS.white, fontWeight: 'bold' },
  content: { padding: SPACING.lg },
  matchCard: { 
    backgroundColor: COLORS.white, 
    borderRadius: BORDER_RADIUS.lg, 
    padding: SPACING.lg, 
    marginBottom: SPACING.md, 
    ...SHADOWS.md 
  },
  matchHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: SPACING.md 
  },
  matchLeft: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md, flex: 1 },
  matchIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  matchName: { 
    fontSize: TYPOGRAPHY.sizes.md, 
    fontWeight: 'bold', 
    color: '#1e293b' 
  },
  matchIndustry: { 
    fontSize: TYPOGRAPHY.sizes.sm, 
    color: '#94a3b8', 
    marginTop: 2 
  },
  matchScoreContainer: { alignItems: 'flex-end' },
  matchScoreBadge: { 
    paddingHorizontal: SPACING.sm, 
    paddingVertical: 4, 
    borderRadius: BORDER_RADIUS.round 
  },
  matchScoreText: { 
    fontSize: TYPOGRAPHY.sizes.sm, 
    fontWeight: 'bold' 
  },
  matchDetails: { 
    flexDirection: 'row', 
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
    paddingVertical: SPACING.sm,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#f1f5f9',
  },
  detailItem: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 4,
    flex: 1,
    justifyContent: 'center',
  },
  detailDivider: { width: 1, height: 20, backgroundColor: '#f1f5f9' },
  detailText: { 
    fontSize: TYPOGRAPHY.sizes.sm, 
    color: '#64748b' 
  },
  matchActions: { 
    flexDirection: 'row', 
    gap: SPACING.sm 
  },
  connectButton: { 
    flex: 1,
    borderRadius: BORDER_RADIUS.md,
    overflow: 'hidden',
  },
  connectGradient: { 
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
  },
  connectButtonText: { 
    color: COLORS.white, 
    fontSize: TYPOGRAPHY.sizes.sm, 
    fontWeight: '600' 
  },
  messageButton: { 
    width: 44, 
    height: 44, 
    borderRadius: BORDER_RADIUS.md, 
    borderWidth: 1, 
    borderColor: '#6366f1', 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  saveButton: { 
    width: 44, 
    height: 44, 
    borderRadius: BORDER_RADIUS.md, 
    borderWidth: 1, 
    borderColor: '#e2e8f0', 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
});