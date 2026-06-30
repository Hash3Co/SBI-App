// PaymentMethodScreen.tsx
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Animated, Platform } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS, SHADOWS } from '../../constants/theme';
import { showToast } from '../../components/Toast';

export const PaymentMethodScreen = ({ navigation }: any) => {
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [cardholderName, setCardholderName] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState('1');
  const [fadeAnim] = useState(new Animated.Value(0));

  const savedMethods = [
    { id: '1', last4: '4242', brand: 'Visa', expiry: '12/25', color: '#6366f1' },
    { id: '2', last4: '5555', brand: 'Mastercard', expiry: '08/26', color: '#f59e0b' },
  ];

  React.useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
  }, []);

  const getCardIcon = (brand: string) => {
    switch(brand) {
      case 'Visa': return 'credit-card';
      case 'Mastercard': return 'credit-card';
      default: return 'credit-card';
    }
  };

  const formatCardNumber = (text: string) => {
    const cleaned = text.replace(/\s/g, '');
    const groups = cleaned.match(/.{1,4}/g);
    return groups ? groups.join(' ') : cleaned;
  };

  const formatExpiry = (text: string) => {
    const cleaned = text.replace(/\D/g, '');
    if (cleaned.length >= 2) {
      return `${cleaned.slice(0, 2)}/${cleaned.slice(2, 4)}`;
    }
    return cleaned;
  };

  const handleAddCard = async () => {
    if (!cardNumber || !expiryDate || !cvv || !cardholderName) {
      showToast('Please fill all fields', 'error');
      return;
    }
    
    setIsAdding(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsAdding(false);
    showToast('Payment method added successfully', 'success');
    navigation.goBack();
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
          <Text style={styles.headerTitle}>Payment Methods</Text>
          <TouchableOpacity style={styles.addButton}>
            <Icon name="add" size={24} color={COLORS.white} />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        <Text style={styles.sectionTitle}>Saved Cards</Text>
        {savedMethods.map(method => (
          <TouchableOpacity 
            key={method.id} 
            style={[styles.methodCard, selectedMethod === method.id && styles.methodCardSelected]}
            onPress={() => setSelectedMethod(method.id)}
          >
            <LinearGradient
              colors={[method.color + '10', method.color + '05']}
              style={styles.methodGradient}
            >
              <View style={styles.methodLeft}>
                <View style={[styles.methodIcon, { backgroundColor: method.color + '20' }]}>
                  <Icon name={getCardIcon(method.brand)} size={24} color={method.color} />
                </View>
                <View style={styles.methodInfo}>
                  <Text style={styles.methodBrand}>{method.brand}</Text>
                  <Text style={styles.methodDetails}>•••• {method.last4}</Text>
                  <Text style={styles.methodExpiry}>Expires {method.expiry}</Text>
                </View>
              </View>
              <View style={[styles.methodRadio, selectedMethod === method.id && styles.methodRadioSelected]}>
                {selectedMethod === method.id && <View style={styles.methodRadioDot} />}
              </View>
            </LinearGradient>
          </TouchableOpacity>
        ))}

        <View style={styles.addSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Add New Card</Text>
            <View style={styles.secureBadge}>
              <Icon name="lock" size={12} color="#10b981" />
              <Text style={styles.secureBadgeText}>Secure</Text>
            </View>
          </View>
          
          <View style={styles.addCardForm}>
            <View style={styles.cardPreview}>
              <LinearGradient colors={['#6366f1', '#4f46e5']} style={styles.cardPreviewGradient}>
                <View style={styles.cardPreviewHeader}>
                  <Text style={styles.cardPreviewBrand}>SBI</Text>
                  <Icon name="credit-card" size={24} color="rgba(255,255,255,0.5)" />
                </View>
                <Text style={styles.cardPreviewNumber}>
                  {cardNumber || '•••• •••• •••• ••••'}
                </Text>
                <View style={styles.cardPreviewFooter}>
                  <View>
                    <Text style={styles.cardPreviewLabel}>Cardholder</Text>
                    <Text style={styles.cardPreviewValue}>{cardholderName || 'FULL NAME'}</Text>
                  </View>
                  <View>
                    <Text style={styles.cardPreviewLabel}>Expires</Text>
                    <Text style={styles.cardPreviewValue}>{expiryDate || 'MM/YY'}</Text>
                  </View>
                </View>
              </LinearGradient>
            </View>

            <TextInput 
              style={styles.input} 
              placeholder="Card Number" 
              placeholderTextColor="#94a3b8" 
              value={cardNumber} 
              onChangeText={text => setCardNumber(formatCardNumber(text))} 
              keyboardType="numeric" 
              maxLength={19} 
            />
            
            <View style={styles.row}>
              <TextInput 
                style={[styles.input, styles.halfInput]} 
                placeholder="MM/YY" 
                placeholderTextColor="#94a3b8" 
                value={expiryDate} 
                onChangeText={text => setExpiryDate(formatExpiry(text))} 
                maxLength={5} 
              />
              <TextInput 
                style={[styles.input, styles.halfInput]} 
                placeholder="CVV" 
                placeholderTextColor="#94a3b8" 
                value={cvv} 
                onChangeText={setCvv} 
                keyboardType="numeric" 
                maxLength={4} 
                secureTextEntry 
              />
            </View>
            
            <TextInput 
              style={styles.input} 
              placeholder="Cardholder Name" 
              placeholderTextColor="#94a3b8" 
              value={cardholderName} 
              onChangeText={setCardholderName} 
            />

            <TouchableOpacity style={styles.addButton} onPress={handleAddCard} disabled={isAdding}>
              <LinearGradient colors={['#10b981', '#059669']} style={styles.addGradient}>
                <Icon name="add" size={20} color={COLORS.white} />
                <Text style={styles.addButtonText}>{isAdding ? 'Adding...' : 'Add Card'}</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>

        <Text style={styles.secureText}>
          <Icon name="lock" size={14} color="#10b981" /> Your payment info is securely encrypted
        </Text>
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
  addButton: { padding: SPACING.sm },
  content: { padding: SPACING.lg, paddingBottom: SPACING.xxxl },
  sectionTitle: { 
    fontSize: TYPOGRAPHY.sizes.lg, 
    fontWeight: 'bold', 
    color: '#1e293b',
    marginBottom: SPACING.md,
  },
  methodCard: { 
    borderRadius: BORDER_RADIUS.lg, 
    marginBottom: SPACING.md,
    overflow: 'hidden',
    ...SHADOWS.sm,
  },
  methodCardSelected: { borderWidth: 2, borderColor: '#6366f1' },
  methodGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.md,
  },
  methodLeft: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md, flex: 1 },
  methodIcon: { 
    width: 48, 
    height: 48, 
    borderRadius: 24, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  methodInfo: { flex: 1 },
  methodBrand: { 
    fontSize: TYPOGRAPHY.sizes.md, 
    fontWeight: 'bold', 
    color: '#1e293b' 
  },
  methodDetails: { 
    fontSize: TYPOGRAPHY.sizes.sm, 
    color: '#64748b' 
  },
  methodExpiry: { 
    fontSize: TYPOGRAPHY.sizes.xs, 
    color: '#94a3b8',
    marginTop: 2,
  },
  methodRadio: { 
    width: 24, 
    height: 24, 
    borderRadius: 12, 
    borderWidth: 2, 
    borderColor: '#cbd5e1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  methodRadioSelected: { borderColor: '#6366f1' },
  methodRadioDot: { 
    width: 12, 
    height: 12, 
    borderRadius: 6, 
    backgroundColor: '#6366f1' 
  },
  addSection: { marginTop: SPACING.xl },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  secureBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#10b981' + '15',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.round,
  },
  secureBadgeText: {
    fontSize: 10,
    color: '#10b981',
    fontWeight: '600',
  },
  addCardForm: { 
    backgroundColor: COLORS.white, 
    borderRadius: BORDER_RADIUS.lg, 
    padding: SPACING.lg, 
    ...SHADOWS.md 
  },
  cardPreview: {
    marginBottom: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
  },
  cardPreviewGradient: {
    padding: SPACING.lg,
    ...Platform.select({
      ios: {
        shadowColor: '#6366f1',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  cardPreviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  cardPreviewBrand: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: 'bold',
    color: 'rgba(255,255,255,0.8)',
  },
  cardPreviewNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.white,
    letterSpacing: 2,
    marginBottom: SPACING.md,
  },
  cardPreviewFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cardPreviewLabel: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.6)',
    textTransform: 'uppercase',
  },
  cardPreviewValue: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.white,
    fontWeight: '500',
    marginTop: 2,
  },
  input: { 
    borderWidth: 1, 
    borderColor: '#e2e8f0', 
    borderRadius: BORDER_RADIUS.md, 
    padding: SPACING.md, 
    fontSize: TYPOGRAPHY.sizes.md, 
    color: '#1e293b', 
    backgroundColor: '#f8fafc',
    marginBottom: SPACING.md,
  },
  row: { 
    flexDirection: 'row', 
    gap: SPACING.md 
  },
  halfInput: { flex: 1 },
  addButton: { marginTop: SPACING.sm },
  addGradient: { 
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
  addButtonText: { 
    color: COLORS.white, 
    fontSize: TYPOGRAPHY.sizes.md, 
    fontWeight: 'bold' 
  },
  secureText: { 
    textAlign: 'center', 
    marginTop: SPACING.xl, 
    fontSize: TYPOGRAPHY.sizes.xs, 
    color: '#94a3b8' 
  },
});