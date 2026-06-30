import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS, SHADOWS } from '../../constants/theme';

interface PaymentMethodProps {
  onAddCard: (cardDetails: any) => void;
  savedCards?: Array<{ id: string; last4: string; brand: string; expiry: string }>;
}

export const PaymentMethod: React.FC<PaymentMethodProps> = ({ onAddCard, savedCards = [] }) => {
  const [showForm, setShowForm] = useState(false);
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');

  const formatCardNumber = (text: string) => {
    const cleaned = text.replace(/\s/g, '');
    const groups = cleaned.match(/.{1,4}/g);
    return groups ? groups.join(' ') : cleaned;
  };

  const formatExpiry = (text: string) => {
    const cleaned = text.replace(/\D/g, '');
    if (cleaned.length >= 2) return `${cleaned.slice(0, 2)}/${cleaned.slice(2, 4)}`;
    return cleaned;
  };

  const handleSubmit = () => {
    if (cardNumber && expiry && cvv) {
      onAddCard({ cardNumber: cardNumber.replace(/\s/g, ''), expiry, cvv });
      setShowForm(false);
      setCardNumber('');
      setExpiry('');
      setCvv('');
    }
  };

  return (
    <View style={styles.container}>
      {savedCards.map(card => (
        <View key={card.id} style={styles.savedCard}>
          <Icon name="credit-card" size={24} color={COLORS.primary} />
          <View style={styles.cardInfo}>
            <Text style={styles.cardBrand}>{card.brand}</Text>
            <Text style={styles.cardDetails}>•••• {card.last4} • Expires {card.expiry}</Text>
          </View>
          <TouchableOpacity><Icon name="more-vert" size={20} color={COLORS.gray500} /></TouchableOpacity>
        </View>
      ))}
      
      {!showForm ? (
        <TouchableOpacity style={styles.addButton} onPress={() => setShowForm(true)}>
          <Icon name="add-circle" size={24} color={COLORS.primary} />
          <Text style={styles.addButtonText}>Add New Card</Text>
        </TouchableOpacity>
      ) : (
        <View style={styles.form}>
          <TextInput style={styles.input} placeholder="Card Number" value={cardNumber} onChangeText={text => setCardNumber(formatCardNumber(text))} keyboardType="numeric" maxLength={19} />
          <View style={styles.row}>
            <TextInput style={[styles.input, styles.halfInput]} placeholder="MM/YY" value={expiry} onChangeText={text => setExpiry(formatExpiry(text))} maxLength={5} />
            <TextInput style={[styles.input, styles.halfInput]} placeholder="CVV" value={cvv} onChangeText={setCvv} keyboardType="numeric" maxLength={4} secureTextEntry />
          </View>
          <View style={styles.formActions}>
            <TouchableOpacity style={styles.cancelButton} onPress={() => setShowForm(false)}><Text style={styles.cancelText}>Cancel</Text></TouchableOpacity>
            <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}><Text style={styles.submitText}>Add Card</Text></TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { backgroundColor: COLORS.white, borderRadius: BORDER_RADIUS.lg, padding: SPACING.lg, ...SHADOWS.md },
  savedCard: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md, paddingVertical: SPACING.sm, borderBottomWidth: 1, borderBottomColor: COLORS.gray100 },
  cardInfo: { flex: 1 },
  cardBrand: { fontSize: TYPOGRAPHY.sizes.md, fontWeight: '500', color: COLORS.gray800 },
  cardDetails: { fontSize: TYPOGRAPHY.sizes.sm, color: COLORS.gray500 },
  addButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: SPACING.sm, paddingVertical: SPACING.md, marginTop: SPACING.sm },
  addButtonText: { color: COLORS.primary, fontSize: TYPOGRAPHY.sizes.md, fontWeight: '500' },
  form: { marginTop: SPACING.md },
  input: { borderWidth: 1, borderColor: COLORS.gray200, borderRadius: BORDER_RADIUS.md, padding: SPACING.md, fontSize: TYPOGRAPHY.sizes.md, marginBottom: SPACING.sm },
  row: { flexDirection: 'row', gap: SPACING.sm },
  halfInput: { flex: 1 },
  formActions: { flexDirection: 'row', gap: SPACING.md, marginTop: SPACING.sm },
  cancelButton: { flex: 1, paddingVertical: SPACING.sm, alignItems: 'center', borderRadius: BORDER_RADIUS.md, borderWidth: 1, borderColor: COLORS.gray300 },
  cancelText: { color: COLORS.gray600 },
  submitButton: { flex: 1, paddingVertical: SPACING.sm, alignItems: 'center', backgroundColor: COLORS.primary, borderRadius: BORDER_RADIUS.md },
  submitText: { color: COLORS.white, fontWeight: 'bold' },
});