// CertificateScreen.tsx
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Share, Animated } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS, SHADOWS } from '../../constants/theme';
import { useAuth } from '../../context/AuthenticationContext';
import { showToast } from '../../components/Toast';

export const CertificateScreen = ({ route, navigation }: any) => {
  const { courseId } = route.params;
  const { user } = useAuth();
  const [isGenerating, setIsGenerating] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));

  const course = {
    title: 'Business Plan Development',
    completionDate: '2024-01-15',
    score: 92,
    instructor: 'Dr. Sarah Johnson',
  };

  React.useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleShare = async () => {
    setIsGenerating(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsGenerating(false);
    
    try {
      await Share.share({
        message: `🎓 I completed "${course.title}" on SBI App with a score of ${course.score}%! #SBIAfrica #BusinessTraining`,
        title: 'Course Certificate',
      });
      showToast('Certificate shared successfully!', 'success');
    } catch (error) {
      showToast('Failed to share certificate', 'error');
    }
  };

  const handleDownload = () => {
    showToast('Certificate downloaded successfully!', 'success');
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
          <Text style={styles.headerTitle}>Certificate</Text>
          <TouchableOpacity style={styles.headerAction}>
            <Icon name="more-vert" size={24} color={COLORS.white} />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        <View style={styles.certificateCard}>
          <LinearGradient
            colors={['#ffffff', '#f8fafc']}
            style={styles.certificateBorder}
          >
            <View style={styles.certificateBadge}>
              <LinearGradient colors={['#f59e0b', '#d97706']} style={styles.badgeGradient}>
                <Icon name="emoji-events" size={32} color={COLORS.white} />
              </LinearGradient>
            </View>
            
            <Text style={styles.certificateTitle}>Certificate of Completion</Text>
            <View style={styles.decorativeLine} />
            
            <Text style={styles.certificateSubtitle}>This certificate is proudly presented to</Text>
            <Text style={styles.certificateName}>{user?.fullName || 'Student Name'}</Text>
            
            <View style={styles.decorativeLine} />
            <Text style={styles.certificateText}>for successfully completing the course</Text>
            <Text style={styles.courseTitle}>{course.title}</Text>
            
            <View style={styles.certificateDetails}>
              <View style={styles.detailItem}>
                <Icon name="calendar-today" size={16} color="#64748b" />
                <Text style={styles.detailLabel}>Completion Date</Text>
                <Text style={styles.detailValue}>{course.completionDate}</Text>
              </View>
              <View style={styles.detailDivider} />
              <View style={styles.detailItem}>
                <Icon name="star" size={16} color="#f59e0b" />
                <Text style={styles.detailLabel}>Final Score</Text>
                <Text style={[styles.detailValue, { color: '#10b981' }]}>{course.score}%</Text>
              </View>
              <View style={styles.detailDivider} />
              <View style={styles.detailItem}>
                <Icon name="person" size={16} color="#64748b" />
                <Text style={styles.detailLabel}>Instructor</Text>
                <Text style={styles.detailValue}>{course.instructor}</Text>
              </View>
            </View>

            <View style={styles.signatureLine}>
              <View style={styles.signature}>
                <View style={styles.signatureBorder} />
                <Text style={styles.signatureText}>SBI App</Text>
                <Text style={styles.signatureSubtext}>Authorized Training Partner</Text>
              </View>
            </View>

            <View style={styles.certificateId}>
              <Text style={styles.certificateIdText}>Certificate ID: SBI-{Date.now().toString().slice(-8)}</Text>
            </View>
          </LinearGradient>
        </View>

        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.shareButton} onPress={handleShare} disabled={isGenerating}>
            <LinearGradient 
              colors={['#6366f1', '#4f46e5']} 
              style={styles.actionGradient}
              start={{x: 0, y: 0}}
              end={{x: 1, y: 0}}
            >
              <Icon name="share" size={20} color={COLORS.white} />
              <Text style={styles.actionButtonText}>{isGenerating ? 'Generating...' : 'Share'}</Text>
            </LinearGradient>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.downloadButton} onPress={handleDownload}>
            <LinearGradient 
              colors={['#10b981', '#059669']} 
              style={styles.actionGradient}
              start={{x: 0, y: 0}}
              end={{x: 1, y: 0}}
            >
              <Icon name="download" size={20} color={COLORS.white} />
              <Text style={styles.actionButtonText}>Download PDF</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.continueButton} onPress={() => navigation.navigate('CourseLibrary')}>
          <Text style={styles.continueButtonText}>Browse More Courses →</Text>
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
  headerAction: { padding: SPACING.sm },
  content: { padding: SPACING.lg, paddingBottom: SPACING.xxxl },
  certificateCard: { 
    marginBottom: SPACING.lg,
    borderRadius: BORDER_RADIUS.xl,
    ...SHADOWS.lg,
    overflow: 'hidden',
  },
  certificateBorder: { 
    padding: SPACING.xl, 
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#6366f1' + '20',
    borderRadius: BORDER_RADIUS.xl,
  },
  certificateBadge: {
    marginBottom: SPACING.md,
    ...SHADOWS.md,
  },
  badgeGradient: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  decorativeLine: {
    width: 60,
    height: 3,
    backgroundColor: '#6366f1',
    borderRadius: BORDER_RADIUS.round,
    marginVertical: SPACING.md,
  },
  certificateTitle: { 
    fontSize: TYPOGRAPHY.sizes.xl, 
    fontWeight: 'bold', 
    color: '#1e293b',
    textAlign: 'center',
  },
  certificateSubtitle: { 
    fontSize: TYPOGRAPHY.sizes.md, 
    color: '#64748b',
    marginTop: SPACING.sm,
  },
  certificateName: { 
    fontSize: 32, 
    fontWeight: 'bold', 
    color: '#6366f1',
    marginVertical: SPACING.sm,
    textAlign: 'center',
  },
  certificateText: { 
    fontSize: TYPOGRAPHY.sizes.md, 
    color: '#64748b',
  },
  courseTitle: { 
    fontSize: TYPOGRAPHY.sizes.xl, 
    fontWeight: '600', 
    color: '#4f46e5',
    marginVertical: SPACING.sm,
    textAlign: 'center',
  },
  certificateDetails: { 
    flexDirection: 'row', 
    justifyContent: 'space-around', 
    width: '100%', 
    marginTop: SPACING.lg,
    paddingVertical: SPACING.md,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#f1f5f9',
  },
  detailItem: { 
    alignItems: 'center', 
    flex: 1,
    gap: 4,
  },
  detailLabel: { 
    fontSize: TYPOGRAPHY.sizes.xs, 
    color: '#94a3b8',
    marginTop: 2,
  },
  detailValue: { 
    fontSize: TYPOGRAPHY.sizes.sm, 
    fontWeight: 'bold', 
    color: '#1e293b',
  },
  detailDivider: { 
    width: 1, 
    height: 40, 
    backgroundColor: '#f1f5f9' 
  },
  signatureLine: { 
    marginTop: SPACING.xl, 
    width: '100%', 
    alignItems: 'center' 
  },
  signature: { 
    alignItems: 'center' 
  },
  signatureBorder: { 
    width: 160, 
    borderBottomWidth: 2, 
    borderBottomColor: '#6366f1',
    marginBottom: SPACING.xs,
  },
  signatureText: { 
    fontSize: TYPOGRAPHY.sizes.sm, 
    color: '#6366f1',
    fontWeight: 'bold',
  },
  signatureSubtext: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: '#94a3b8',
    marginTop: 2,
  },
  certificateId: {
    marginTop: SPACING.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: 4,
    backgroundColor: '#f1f5f9',
    borderRadius: BORDER_RADIUS.round,
  },
  certificateIdText: {
    fontSize: 10,
    color: '#94a3b8',
  },
  actionButtons: { 
    flexDirection: 'row', 
    gap: SPACING.md,
    marginBottom: SPACING.md,
  },
  shareButton: { flex: 1 },
  downloadButton: { flex: 1 },
  actionGradient: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center', 
    gap: SPACING.sm, 
    paddingVertical: SPACING.md, 
    borderRadius: BORDER_RADIUS.lg,
    ...SHADOWS.sm,
  },
  actionButtonText: { 
    color: COLORS.white, 
    fontSize: TYPOGRAPHY.sizes.md, 
    fontWeight: 'bold' 
  },
  continueButton: { 
    alignItems: 'center',
    paddingVertical: SPACING.md,
  },
  continueButtonText: { 
    color: '#6366f1', 
    fontSize: TYPOGRAPHY.sizes.md, 
    fontWeight: '500' 
  },
});