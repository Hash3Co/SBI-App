import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, FlatList, Animated, TextInput } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS, SHADOWS } from '../../constants/theme';
import { useTraining } from '../../context/TrainingContext';

export const CourseLibraryScreen = ({ navigation }: any) => {
  const { courses, enrolledCourses } = useTraining();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [fadeAnim] = useState(new Animated.Value(0));

  const categories = ['all', 'Business', 'Finance', 'Pitching', 'Marketing', 'Leadership'];

  React.useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
  }, []);

  const filteredCourses = courses.filter(course => {
    const matchesCategory = selectedCategory === 'all' || course.category === selectedCategory;
    const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          course.instructor.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const getCategoryColor = (category: string) => {
    switch(category) {
      case 'Business': return '#6366f1';
      case 'Finance': return '#10b981';
      case 'Pitching': return '#f59e0b';
      case 'Marketing': return '#ec4899';
      case 'Leadership': return '#06b6d4';
      default: return '#6366f1';
    }
  };

  const renderCourseCard = ({ item, index }: any) => {
    const isEnrolled = enrolledCourses.some(c => c.id === item.id);
    const progress = item.progress || 0;
    
    return (
      <Animated.View
        style={[
          styles.courseCard,
          {
            opacity: fadeAnim,
            transform: [{ 
              translateY: fadeAnim.interpolate({ 
                inputRange: [0, 1], 
                outputRange: [20 * (index + 1), 0] 
              }) 
            }],
          }
        ]}
      >
        <TouchableOpacity 
          style={styles.courseTouchable}
          onPress={() => navigation.navigate('CourseDetail', { courseId: item.id })}
          activeOpacity={0.7}
        >
          <LinearGradient 
            colors={[getCategoryColor(item.category), getCategoryColor(item.category) + 'CC']} 
            style={styles.courseThumbnail}
          >
            <Icon name="school" size={32} color={COLORS.white} />
            <Text style={styles.categoryBadge}>{item.category}</Text>
          </LinearGradient>
          <View style={styles.courseInfo}>
            <Text style={styles.courseTitle} numberOfLines={1}>{item.title}</Text>
            <Text style={styles.courseInstructor}>{item.instructor}</Text>
            <View style={styles.courseMeta}>
              <View style={styles.metaItem}>
                <Icon name="schedule" size={14} color="#94a3b8" />
                <Text style={styles.metaText}>{item.duration}</Text>
              </View>
              <View style={styles.metaDot} />
              <View style={styles.metaItem}>
                <Icon name="bar-chart" size={14} color="#94a3b8" />
                <Text style={styles.metaText}>{item.level}</Text>
              </View>
            </View>
            {isEnrolled && progress > 0 && (
              <View style={styles.progressContainer}>
                <View style={styles.progressBar}>
                  <View style={[styles.progressFill, { width: `${progress}%` }]} />
                </View>
                <Text style={styles.progressText}>{progress}% complete</Text>
              </View>
            )}
            <View style={[styles.enrollStatus, isEnrolled && styles.enrolledStatus]}>
              <Icon 
                name={isEnrolled ? 'check-circle' : 'add-circle'} 
                size={16} 
                color={isEnrolled ? '#10b981' : '#6366f1'} 
              />
              <Text style={[styles.enrollStatusText, isEnrolled && styles.enrolledStatusText]}>
                {isEnrolled ? 'Enrolled' : 'Enroll Now'}
              </Text>
            </View>
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <View style={styles.container}>
      <LinearGradient 
        colors={['#6366f1', '#4f46e5', '#4338ca']} 
        style={styles.header}
        start={{x: 0, y: 0}}
        end={{x: 1, y: 0}}
      >
        <Text style={styles.headerTitle}>Training Library</Text>
        <Text style={styles.headerSubtitle}>Learn to get funding ready</Text>
        <View style={styles.searchContainer}>
          <Icon name="search" size={20} color="#94a3b8" />
          <TextInput 
            style={styles.searchInput}
            placeholder="Search courses..."
            placeholderTextColor="#94a3b8"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Icon name="close" size={20} color="#94a3b8" />
            </TouchableOpacity>
          )}
        </View>
      </LinearGradient>

      <View style={styles.categoriesContainer}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          style={styles.categoriesScroll}
        >
          {categories.map(cat => (
            <TouchableOpacity 
              key={cat} 
              style={[styles.categoryChip, selectedCategory === cat && styles.categoryChipActive]} 
              onPress={() => setSelectedCategory(cat)}
            >
              <Text style={[styles.categoryText, selectedCategory === cat && styles.categoryTextActive]}>
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <FlatList
        data={filteredCourses}
        renderItem={renderCourseCard}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Icon name="school" size={64} color="#e2e8f0" />
            <Text style={styles.emptyStateText}>No courses found</Text>
            <Text style={styles.emptyStateSubtext}>Try adjusting your filters</Text>
          </View>
        }
        ListFooterComponent={
          <View style={styles.footer}>
            <Text style={styles.footerText}>Showing {filteredCourses.length} courses</Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: { 
    padding: SPACING.xl, 
    paddingTop: SPACING.xxxl, 
    paddingBottom: SPACING.lg,
    borderBottomLeftRadius: BORDER_RADIUS.xxl,
    borderBottomRightRadius: BORDER_RADIUS.xxl,
  },
  headerTitle: { 
    fontSize: TYPOGRAPHY.sizes.xxl, 
    fontWeight: 'bold', 
    color: COLORS.white 
  },
  headerSubtitle: { 
    fontSize: TYPOGRAPHY.sizes.md, 
    color: 'rgba(255,255,255,0.9)', 
    marginTop: SPACING.xs,
    marginBottom: SPACING.md,
  },
  searchContainer: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: 'rgba(255,255,255,0.15)', 
    borderRadius: BORDER_RADIUS.lg, 
    paddingHorizontal: SPACING.md,
    gap: SPACING.sm,
  },
  searchInput: { 
    flex: 1, 
    paddingVertical: SPACING.md, 
    fontSize: TYPOGRAPHY.sizes.md, 
    color: COLORS.white 
  },
  categoriesContainer: {
    marginTop: -SPACING.lg,
    paddingBottom: SPACING.sm,
  },
  categoriesScroll: { 
    paddingHorizontal: SPACING.lg,
  },
  categoryChip: { 
    paddingHorizontal: SPACING.md, 
    paddingVertical: SPACING.sm, 
    backgroundColor: COLORS.white, 
    borderRadius: BORDER_RADIUS.round, 
    marginRight: SPACING.sm,
    ...SHADOWS.sm,
  },
  categoryChipActive: { 
    backgroundColor: '#6366f1' 
  },
  categoryText: { 
    fontSize: TYPOGRAPHY.sizes.sm, 
    color: '#64748b',
    fontWeight: '500',
  },
  categoryTextActive: { color: COLORS.white },
  listContent: { 
    padding: SPACING.lg, 
    paddingTop: SPACING.md,
    paddingBottom: SPACING.xxxl,
  },
  courseCard: { 
    backgroundColor: COLORS.white, 
    borderRadius: BORDER_RADIUS.lg, 
    marginBottom: SPACING.md, 
    overflow: 'hidden', 
    ...SHADOWS.md,
  },
  courseTouchable: { 
    flexDirection: 'row',
  },
  courseThumbnail: { 
    width: 120, 
    minHeight: 140,
    justifyContent: 'center', 
    alignItems: 'center',
    padding: SPACING.md,
  },
  categoryBadge: {
    marginTop: SPACING.sm,
    fontSize: 10,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  courseInfo: { 
    flex: 1, 
    padding: SPACING.md,
  },
  courseTitle: { 
    fontSize: TYPOGRAPHY.sizes.md, 
    fontWeight: 'bold', 
    color: '#1e293b',
    marginBottom: 2,
  },
  courseInstructor: { 
    fontSize: TYPOGRAPHY.sizes.xs, 
    color: '#94a3b8',
    marginBottom: SPACING.xs,
  },
  courseMeta: { 
    flexDirection: 'row', 
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  metaItem: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 4,
  },
  metaText: { 
    fontSize: 10, 
    color: '#94a3b8',
  },
  metaDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: '#e2e8f0',
  },
  progressContainer: {
    marginBottom: SPACING.sm,
  },
  progressBar: { 
    height: 4, 
    backgroundColor: '#f1f5f9', 
    borderRadius: BORDER_RADIUS.round, 
    overflow: 'hidden',
    marginBottom: 2,
  },
  progressFill: { 
    height: '100%', 
    backgroundColor: '#10b981', 
    borderRadius: BORDER_RADIUS.round 
  },
  progressText: {
    fontSize: 10,
    color: '#94a3b8',
  },
  enrollStatus: { 
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  enrollStatusText: {
    fontSize: 12,
    color: '#6366f1',
    fontWeight: '500',
  },
  enrolledStatus: {
    alignContent: 'center',
    gap: 4,
  },
  enrolledStatusText: {
    color: '#10b981',
  },
  emptyState: { 
    alignItems: 'center', 
    padding: SPACING.xxxl,
    marginTop: SPACING.xxl,
  },
  emptyStateText: { 
    fontSize: TYPOGRAPHY.sizes.lg, 
    color: '#94a3b8', 
    marginTop: SPACING.md 
  },
  emptyStateSubtext: { 
    fontSize: TYPOGRAPHY.sizes.sm, 
    color: '#cbd5e1', 
    marginTop: SPACING.xs 
  },
  footer: {
    paddingVertical: SPACING.md,
    alignItems: 'center',
  },
  footerText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: '#94a3b8',
  },
});