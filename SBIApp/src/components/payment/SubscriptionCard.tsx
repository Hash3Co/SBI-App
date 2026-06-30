import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS, SHADOWS } from '../../constants/theme';
import { SubscriptionPlan } from '../../types';

interface SubscriptionCardProps {
  plan: SubscriptionPlan;
  selected: boolean;
  onSelect: () => void;
}

export const SubscriptionCard: React.FC<SubscriptionCardProps> = ({ plan, selected, onSelect }) => {
  return (
    <TouchableOpacity style={[styles.card, selected && styles.cardSelected]} onPress={onSelect}>
      {plan.isPopular && (
        <View style={styles.popularBadge}>
          <Text style={styles.popularText}>POPULAR</Text>
        </View>
      )}
      <Text style={styles.planName}>{plan.name}</Text>
      <Text style={styles.planPrice}>
        M {plan.price}
        <Text style={styles.planInterval}>/{plan.interval}</Text>
      </Text>
      <Text style={styles.planDescription}>{plan.description}</Text>
      <View style={styles.features}>
        {plan.features.map((feature, idx) => (
          <View key={idx} style={styles.feature}>
            <Icon name="check" size={16} color={COLORS.success} />
            <Text style={styles.featureText}>{feature}</Text>
          </View>
        ))}
      </View>
      {selected && <View style={styles.selectedIndicator}><Icon name="check-circle" size={24} color={COLORS.primary} /></View>}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: { backgroundColor: COLORS.white, borderRadius: BORDER_RADIUS.lg, padding: SPACING.lg, marginBottom: SPACING.md, ...SHADOWS.md, position: 'relative' },
  cardSelected: { borderWidth: 2, borderColor: COLORS.primary },
  popularBadge: { position: 'absolute', top: -10, right: SPACING.lg, backgroundColor: COLORS.secondary, paddingHorizontal: SPACING.md, paddingVertical: 4, borderRadius: BORDER_RADIUS.round },
  popularText: { fontSize: 10, color: COLORS.white, fontWeight: 'bold' },
  planName: { fontSize: TYPOGRAPHY.sizes.xl, fontWeight: 'bold', color: COLORS.gray800 },
  planPrice: { fontSize: TYPOGRAPHY.sizes.xxxl, fontWeight: 'bold', color: COLORS.primary, marginTop: SPACING.sm },
  planInterval: { fontSize: TYPOGRAPHY.sizes.md, fontWeight: 'normal', color: COLORS.gray500 },
  planDescription: { fontSize: TYPOGRAPHY.sizes.sm, color: COLORS.gray600, marginTop: SPACING.xs, marginBottom: SPACING.md },
  features: { gap: SPACING.sm },
  feature: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  featureText: { fontSize: TYPOGRAPHY.sizes.sm, color: COLORS.gray700 },
  selectedIndicator: { position: 'absolute', bottom: SPACING.lg, right: SPACING.lg },
});