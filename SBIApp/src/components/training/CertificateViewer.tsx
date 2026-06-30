import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Share, Platform } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS, SHADOWS } from '../../constants/theme';

interface CertificateViewerProps {
  studentName: string;
  courseName: string;
  completionDate: string;
  score: number;
  onShare?: () => void;
  onDownload?: () => void;
}

export const CertificateViewer: React.FC<CertificateViewerProps> = ({
  studentName,
  courseName,
  completionDate,
  score,
  onShare,
  onDownload,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.certificate}>
        <Icon name="emoji-events" size={60} color={COLORS.secondary} />
        <Text style={styles.title}>Certificate of Completion</Text>
        <Text style={styles.subtitle}>This certificate is proudly presented to</Text>
        <Text style={styles.name}>{studentName}</Text>
        <Text style={styles.subtitle}>for successfully completing</Text>
        <Text style={styles.courseName}>{courseName}</Text>
        
        <View style={styles.details}>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Completion Date</Text>
            <Text style={styles.detailValue}>{completionDate}</Text>
          </View>
          <View style={styles.detailDivider} />
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Final Score</Text>
            <Text style={styles.detailValue}>{score}%</Text>
          </View>
        </View>
        
        <View style={styles.signature}>
          <View style={styles.signatureLine} />
          <Text style={styles.signatureText}>SBI App</Text>
        </View>
      </View>
      
      <View style={styles.actions}>
        <TouchableOpacity style={styles.actionButton} onPress={onShare}>
          <Icon name="share" size={24} color={COLORS.primary} />
          <Text style={styles.actionText}>Share</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton} onPress={onDownload}>
          <Icon name="download" size={24} color={COLORS.primary} />
          <Text style={styles.actionText}>Download</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { backgroundColor: COLORS.white, borderRadius: BORDER_RADIUS.xl, ...SHADOWS.lg, overflow: 'hidden', margin: SPACING.md },
  certificate: { padding: SPACING.xxxl, alignItems: 'center' },
  title: { fontSize: TYPOGRAPHY.sizes.xxl, fontWeight: 'bold', color: COLORS.primary, marginTop: SPACING.md, textAlign: 'center' },
  subtitle: { fontSize: TYPOGRAPHY.sizes.md, color: COLORS.gray600, marginTop: SPACING.md },
  name: { fontSize: 28, fontWeight: 'bold', color: COLORS.gray800, marginVertical: SPACING.sm, textAlign: 'center' },
  courseName: { fontSize: TYPOGRAPHY.sizes.xl, fontWeight: '600', color: COLORS.secondary, marginTop: SPACING.xs, textAlign: 'center' },
  details: { flexDirection: 'row', justifyContent: 'space-around', width: '100%', marginTop: SPACING.xl, paddingVertical: SPACING.md, borderTopWidth: 1, borderBottomWidth: 1, borderColor: COLORS.gray200 },
  detailItem: { alignItems: 'center', flex: 1 },
  detailLabel: { fontSize: TYPOGRAPHY.sizes.xs, color: COLORS.gray500 },
  detailValue: { fontSize: TYPOGRAPHY.sizes.md, fontWeight: 'bold', color: COLORS.gray800, marginTop: 4 },
  detailDivider: { width: 1, height: 30, backgroundColor: COLORS.gray200 },
  signature: { marginTop: SPACING.xl, alignItems: 'center' },
  signatureLine: { width: 150, borderBottomWidth: 1, borderBottomColor: COLORS.gray400, marginBottom: SPACING.xs },
  signatureText: { fontSize: TYPOGRAPHY.sizes.sm, color: COLORS.gray600 },
  actions: { flexDirection: 'row', borderTopWidth: 1, borderTopColor: COLORS.gray200 },
  actionButton: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: SPACING.sm, paddingVertical: SPACING.md },
  actionText: { fontSize: TYPOGRAPHY.sizes.md, color: COLORS.primary, fontWeight: '500' },
});