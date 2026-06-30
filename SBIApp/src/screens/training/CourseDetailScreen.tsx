import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS, SHADOWS } from '../../constants/theme';
import { useTraining } from '../../context/TrainingContext';

export const CourseDetailScreen = ({ route, navigation }: any) => {
  const { courseId } = route.params;
  const { courses, enrolledCourses, enrollInCourse, isLoading } = useTraining();
  const [course, setCourse] = useState<any>(null);
  const [isEnrolled, setIsEnrolled] = useState(false);

  useEffect(() => {
    const found = courses.find(c => c.id === courseId);
    setCourse(found);
    setIsEnrolled(enrolledCourses.some(c => c.id === courseId));
  }, [courseId, courses, enrolledCourses]);

  const handleEnroll = async () => {
    await enrollInCourse(courseId);
    setIsEnrolled(true);
  };

  if (!course) return null;

  return (
    <ScrollView style={styles.container}>
      <LinearGradient colors={[COLORS.primary, COLORS.primaryDark]} style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}><Icon name="arrow-back" size={24} color={COLORS.white} /></TouchableOpacity>
        <Text style={styles.headerTitle}>{course.title}</Text>
        <View style={{ width: 40 }} />
      </LinearGradient>

      <View style={styles.content}>
        <View style={styles.infoCard}>
          <View style={styles.infoRow}><Icon name="person" size={20} color={COLORS.primary} /><Text style={styles.infoLabel}>Instructor:</Text><Text style={styles.infoValue}>{course.instructor}</Text></View>
          <View style={styles.infoRow}><Icon name="schedule" size={20} color={COLORS.primary} /><Text style={styles.infoLabel}>Duration:</Text><Text style={styles.infoValue}>{course.duration}</Text></View>
          <View style={styles.infoRow}><Icon name="bar-chart" size={20} color={COLORS.primary} /><Text style={styles.infoLabel}>Level:</Text><Text style={styles.infoValue}>{course.level}</Text></View>
          <View style={styles.infoRow}><Icon name="school" size={20} color={COLORS.primary} /><Text style={styles.infoLabel}>Certificate:</Text><Text style={styles.infoValue}>{course.certificateAvailable ? 'Yes' : 'No'}</Text></View>
        </View>

        <View style={styles.descriptionCard}>
          <Text style={styles.sectionTitle}>About this course</Text>
          <Text style={styles.description}>{course.description}</Text>
        </View>

        <View style={styles.chaptersCard}>
          <Text style={styles.sectionTitle}>Course Content</Text>
          {course.chapters.length > 0 ? course.chapters.map((chapter: any, index: number) => (
            <TouchableOpacity key={chapter.id} style={styles.chapterItem} onPress={() => navigation.navigate('VideoPlayer', { chapterId: chapter.id, chapterUrl: chapter.videoUrl })}>
              <View style={styles.chapterNumber}><Text style={styles.chapterNumberText}>{index + 1}</Text></View>
              <View style={styles.chapterInfo}><Text style={styles.chapterTitle}>{chapter.title}</Text><Text style={styles.chapterDuration}>{chapter.duration}</Text></View>
              {chapter.isCompleted && <Icon name="check-circle" size={20} color={COLORS.success} />}
            </TouchableOpacity>
          )) : <Text style={styles.noChapters}>Course content coming soon</Text>}
        </View>

        {!isEnrolled ? (
          <TouchableOpacity style={styles.enrollButton} onPress={handleEnroll} disabled={isLoading}>
            <LinearGradient colors={[COLORS.success, COLORS.success]} style={styles.enrollGradient}>
              <Text style={styles.enrollButtonText}>{isLoading ? 'Enrolling...' : 'Enroll Now'}</Text>
            </LinearGradient>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.continueButton} onPress={() => navigation.navigate('CourseLibrary')}>
            <Text style={styles.continueButtonText}>Continue Learning →</Text>
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: SPACING.xl, paddingTop: SPACING.xxxl, paddingBottom: SPACING.xl },
  backButton: { padding: SPACING.sm }, headerTitle: { fontSize: TYPOGRAPHY.sizes.lg, fontWeight: 'bold', color: COLORS.white, flex: 1, textAlign: 'center' },
  content: { padding: SPACING.lg },
  infoCard: { backgroundColor: COLORS.white, borderRadius: BORDER_RADIUS.lg, padding: SPACING.lg, marginBottom: SPACING.md, ...SHADOWS.sm },
  infoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.sm },
  infoLabel: { fontSize: TYPOGRAPHY.sizes.sm, fontWeight: '500', color: COLORS.gray600, width: 90, marginLeft: SPACING.sm },
  infoValue: { fontSize: TYPOGRAPHY.sizes.sm, color: COLORS.gray800, flex: 1 },
  descriptionCard: { backgroundColor: COLORS.white, borderRadius: BORDER_RADIUS.lg, padding: SPACING.lg, marginBottom: SPACING.md, ...SHADOWS.sm },
  sectionTitle: { fontSize: TYPOGRAPHY.sizes.lg, fontWeight: 'bold', color: COLORS.gray800, marginBottom: SPACING.md },
  description: { fontSize: TYPOGRAPHY.sizes.md, color: COLORS.gray600, lineHeight: 24 },
  chaptersCard: { backgroundColor: COLORS.white, borderRadius: BORDER_RADIUS.lg, padding: SPACING.lg, marginBottom: SPACING.lg, ...SHADOWS.sm },
  chapterItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: SPACING.md, borderBottomWidth: 1, borderBottomColor: COLORS.gray100 },
  chapterNumber: { width: 32, height: 32, borderRadius: 16, backgroundColor: COLORS.gray100, justifyContent: 'center', alignItems: 'center', marginRight: SPACING.md },
  chapterNumberText: { fontSize: TYPOGRAPHY.sizes.sm, fontWeight: 'bold', color: COLORS.primary },
  chapterInfo: { flex: 1 }, chapterTitle: { fontSize: TYPOGRAPHY.sizes.md, color: COLORS.gray800 },
  chapterDuration: { fontSize: TYPOGRAPHY.sizes.xs, color: COLORS.gray500, marginTop: 2 },
  noChapters: { textAlign: 'center', padding: SPACING.xl, color: COLORS.gray500 },
  enrollButton: { marginTop: SPACING.md, marginBottom: SPACING.xxxl },
  enrollGradient: { paddingVertical: SPACING.md, borderRadius: BORDER_RADIUS.lg, alignItems: 'center' },
  enrollButtonText: { color: COLORS.white, fontSize: TYPOGRAPHY.sizes.md, fontWeight: 'bold' },
  continueButton: { marginTop: SPACING.md, marginBottom: SPACING.xxxl, alignItems: 'center' },
  continueButtonText: { color: COLORS.primary, fontSize: TYPOGRAPHY.sizes.md, fontWeight: '500' },
});