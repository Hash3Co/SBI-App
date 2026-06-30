// SubscriptionScreen.tsx
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Animated, Platform } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS, SHADOWS } from '../../constants/theme';
import { useAuth } from '../../context/AuthenticationContext';
import { usePayment } from '../../context/PaymentContext';
import { showToast } from '../../components/Toast';

export const SubscriptionScreen = ({ navigation }: any) => {
  const { user } = useAuth();
  const { subscriptionPlans, subscribe, isLoading, currentSubscription } = usePayment();
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [fadeAnim] = useState(new Animated.Value(0));

  const filteredPlans = subscriptionPlans.filter(plan => plan.role === user?.role);

  React.useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleSubscribe = async () => {
    if (!selectedPlan) {
      showToast('Please select a plan', 'error');
      return;
    }
    const success = await subscribe(selectedPlan);
    if (success) {
      showToast('Subscription activated!', 'success');
      navigation.goBack();
    } else {
      showToast('Subscription failed', 'error');
    }
  };

  const getPlanColor = (isPopular: boolean, isSelected: boolean) => {
    if (isSelected) return '#6366f1';
    if (isPopular) return '#f59e0b';
    return '#e2e8f0';
  };

  const getPlanGradient = (isPopular: boolean, isSelected: boolean) => {
    if (isSelected) return ['#6366f1', '#4f46e5'];
    if (isPopular) return ['#f59e0b', '#d97706'];
    return ['#f1f5f9', '#e2e8f0'];
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
          <Text style={styles.headerTitle}>Choose Plan</Text>
          <TouchableOpacity style={styles.helpButton}>
            <Icon name="help" size={24} color={COLORS.white} />
          </TouchableOpacity>
        </View>
        <Text style={styles.headerSubtitle}>Select the best plan for your business</Text>
      </LinearGradient>

      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        {filteredPlans.map(plan => (
          <TouchableOpacity 
            key={plan.id} 
            style={[styles.planCard, selectedPlan === plan.id && styles.planCardSelected]} 
            onPress={() => setSelectedPlan(plan.id)}
          >
            {plan.isPopular && (
              <View style={styles.popularBadge}>
                <Text style={styles.popularText}>Most Popular</Text>
              </View>
            )}
            
            <View style={styles.planHeader}>
              <View>
                <Text style={styles.planName}>{plan.name}</Text>
                <Text style={styles.planDescription}>{plan.description}</Text>
              </View>
              <LinearGradient 
                colors={getPlanGradient(plan.isPopular, selectedPlan === plan.id)} 
                style={[styles.planRadio, selectedPlan === plan.id && styles.planRadioSelected]}
              >
                {selectedPlan === plan.id && <View style={styles.planRadioDot} />}
              </LinearGradient>
            </View>

            <View style={styles.planPriceContainer}>
              <Text style={styles.planPrice}>M {plan.price}</Text>
              <Text style={styles.planInterval}>/{plan.interval}</Text>
            </View>

            <View style={styles.featuresList}>
              {plan.features.map((feature, idx) => (
                <View key={idx} style={styles.featureItem}>
                  <LinearGradient colors={['#10b981', '#059669']} style={styles.featureIcon}>
                    <Icon name="check" size={12} color={COLORS.white} />
                  </LinearGradient>
                  <Text style={styles.featureText}>{feature}</Text>
                </View>
              ))}
            </View>

            {currentSubscription && currentSubscription.id === plan.id && (
              <View style={styles.currentBadge}>
                <Text style={styles.currentBadgeText}>Current Plan</Text>
              </View>
            )}
          </TouchableOpacity>
        ))}

        <TouchableOpacity 
          style={styles.subscribeButton} 
          onPress={handleSubscribe} 
          disabled={isLoading || !selectedPlan}
        >
          <LinearGradient 
            colors={!selectedPlan ? ['#cbd5e1', '#94a3b8'] : ['#10b981', '#059669']} 
            style={styles.subscribeGradient}
          >
            <Text style={styles.subscribeButtonText}>
              {isLoading ? 'Processing...' : 'Subscribe Now'}
            </Text>
            {!isLoading && <Icon name="arrow-forward" size={20} color={COLORS.white} />}
          </LinearGradient>
        </TouchableOpacity>

        <View style={styles.footer}>
          <TouchableOpacity style={styles.cancelButton} onPress={() => navigation.navigate('PaymentHistory')}>
            <Icon name="history" size={16} color="#94a3b8" />
            <Text style={styles.cancelButtonText}>View Payment History</Text>
          </TouchableOpacity>
          
          <View style={styles.guaranteeContainer}>
            <Icon name="security" size={16} color="#94a3b8" />
            <Text style={styles.guaranteeText}>30-day money-back guarantee</Text>
          </View>
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
    marginBottom: SPACING.xs,
  },
  backButton: { padding: SPACING.sm },
  headerTitle: { 
    fontSize: TYPOGRAPHY.sizes.xl, 
    fontWeight: 'bold', 
    color: COLORS.white 
  },
  helpButton: { padding: SPACING.sm },
  headerSubtitle: {
    fontSize: TYPOGRAPHY.sizes.md,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4,
  },
  content: { padding: SPACING.lg, paddingBottom: SPACING.xxxl },
  planCard: { 
    backgroundColor: COLORS.white, 
    borderRadius: BORDER_RADIUS.lg, 
    padding: SPACING.lg, 
    marginBottom: SPACING.md, 
    ...SHADOWS.md,
    position: 'relative',
  },
  planCardSelected: { borderWidth: 2, borderColor: '#6366f1' },
  popularBadge: { 
    position: 'absolute', 
    top: -10, 
    right: SPACING.lg, 
    backgroundColor: '#f59e0b', 
    paddingHorizontal: SPACING.md, 
    paddingVertical: 4, 
    borderRadius: BORDER_RADIUS.round 
  },
  popularText: { 
    fontSize: 10, 
    color: COLORS.white, 
    fontWeight: 'bold' 
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.sm,
  },
  planName: { 
    fontSize: TYPOGRAPHY.sizes.xl, 
    fontWeight: 'bold', 
    color: '#1e293b' 
  },
  planDescription: { 
    fontSize: TYPOGRAPHY.sizes.sm, 
    color: '#64748b', 
    marginTop: 2,
  },
  planRadio: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e2e8f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  planRadioSelected: { borderColor: '#6366f1' },
  planRadioDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#6366f1',
  },
  planPriceContainer: { 
    flexDirection: 'row', 
    alignItems: 'baseline',
    marginVertical: SPACING.sm,
  },
  planPrice: { 
    fontSize: 36, 
    fontWeight: 'bold', 
    color: '#1e293b' 
  },
  planInterval: { 
    fontSize: TYPOGRAPHY.sizes.md, 
    color: '#94a3b8',
    marginLeft: 4,
  },
  featuresList: { 
    marginTop: SPACING.md, 
    gap: SPACING.sm 
  },
  featureItem: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: SPACING.sm 
  },
  featureIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  featureText: { 
    fontSize: TYPOGRAPHY.sizes.sm, 
    color: '#64748b' 
  },
  currentBadge: {
    marginTop: SPACING.md,
    alignSelf: 'center',
    backgroundColor: '#6366f1' + '15',
    paddingHorizontal: SPACING.md,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.round,
  },
  currentBadgeText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: '#6366f1',
    fontWeight: '600',
  },
  subscribeButton: { marginTop: SPACING.xl, marginBottom: SPACING.md },
  subscribeGradient: { 
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    paddingVertical: SPACING.md, 
    borderRadius: BORDER_RADIUS.lg,
    ...Platform.select({
      ios: {
        shadowColor: '#10b981',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  subscribeButtonText: { 
    color: COLORS.white, 
    fontSize: TYPOGRAPHY.sizes.md, 
    fontWeight: 'bold' 
  },
  footer: {
    marginTop: SPACING.lg,
    alignItems: 'center',
    gap: SPACING.md,
  },
  cancelButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  cancelButtonText: { 
    color: '#94a3b8', 
    fontSize: TYPOGRAPHY.sizes.sm 
  },
  guaranteeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  guaranteeText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: '#94a3b8',
  },
});