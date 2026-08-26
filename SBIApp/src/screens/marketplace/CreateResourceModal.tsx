// src/screens/marketplace/CreateResourceModal.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';
import { useMarketplace } from '../../context/MarketplaceContext';
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS, SHADOWS } from '../../constants/theme';

interface CreateResourceModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const CreateResourceModal: React.FC<CreateResourceModalProps> = ({
  visible,
  onClose,
  onSuccess,
}) => {
  const { createResource, categories } = useMarketplace();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    resource_type: '',
    price: '',
    country: '',
    region: '',
    contact_phone: '',
    contact_website: '',
    requirements: '',
    benefits: '',
    valid_until: '',
  });

  const resourceTypes = [
    'training', 'research', 'software', 'consulting',
    'event', 'funding', 'partnership', 'supply',
    'export', 'investment'
  ];

  const countries = [
    'Lesotho', 'South Africa', 'Botswana', 'Zimbabwe',
    'Zambia', 'Namibia', 'Mozambique', 'Eswatini'
  ];

  const handleSubmit = async () => {
    // Validate required fields
    if (!formData.title || !formData.description || !formData.resource_type || !formData.price || !formData.country) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      const data = new FormData();
      data.append('title', formData.title);
      data.append('description', formData.description);
      data.append('resource_type', formData.resource_type);
      data.append('price', formData.price);
      data.append('country', formData.country);
      
      if (formData.region) data.append('region', formData.region);
      if (formData.contact_phone) data.append('contact_phone', formData.contact_phone);
      if (formData.contact_website) data.append('contact_website', formData.contact_website);
      if (formData.requirements) data.append('requirements', formData.requirements);
      if (formData.benefits) data.append('benefits', formData.benefits);
      if (formData.valid_until) data.append('valid_until', formData.valid_until);

      await createResource(data);
      onSuccess();
    } catch (error) {
      Alert.alert('Error', 'Failed to create resource');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Create Resource</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Icon name="close" size={24} color={COLORS.gray600} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
            <View style={styles.field}>
              <Text style={styles.label}>Title *</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter resource title"
                value={formData.title}
                onChangeText={(text) => setFormData({ ...formData, title: text })}
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Description *</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Describe your resource"
                value={formData.description}
                onChangeText={(text) => setFormData({ ...formData, description: text })}
                multiline
                numberOfLines={4}
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Resource Type *</Text>
              <View style={styles.typeGrid}>
                {resourceTypes.map((type) => (
                  <TouchableOpacity
                    key={type}
                    style={[styles.typeOption, formData.resource_type === type && styles.typeOptionActive]}
                    onPress={() => setFormData({ ...formData, resource_type: type })}
                  >
                    <Text style={[styles.typeOptionText, formData.resource_type === type && styles.typeOptionTextActive]}>
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.row}>
              <View style={[styles.field, { flex: 1, marginRight: SPACING.sm }]}>
                <Text style={styles.label}>Price *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="0.00"
                  value={formData.price}
                  onChangeText={(text) => setFormData({ ...formData, price: text })}
                  keyboardType="numeric"
                />
              </View>
              <View style={[styles.field, { flex: 1 }]}>
                <Text style={styles.label}>Country *</Text>
                <View style={styles.countryPicker}>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    {countries.map((country) => (
                      <TouchableOpacity
                        key={country}
                        style={[styles.countryOption, formData.country === country && styles.countryOptionActive]}
                        onPress={() => setFormData({ ...formData, country: country })}
                      >
                        <Text style={[styles.countryOptionText, formData.country === country && styles.countryOptionTextActive]}>
                          {country}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              </View>
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Region</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., Maseru, Johannesburg"
                value={formData.region}
                onChangeText={(text) => setFormData({ ...formData, region: text })}
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Contact Phone</Text>
              <TextInput
                style={styles.input}
                placeholder="+266 1234 5678"
                value={formData.contact_phone}
                onChangeText={(text) => setFormData({ ...formData, contact_phone: text })}
                keyboardType="phone-pad"
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Contact Website</Text>
              <TextInput
                style={styles.input}
                placeholder="https://example.com"
                value={formData.contact_website}
                onChangeText={(text) => setFormData({ ...formData, contact_website: text })}
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Requirements</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Any requirements for this opportunity"
                value={formData.requirements}
                onChangeText={(text) => setFormData({ ...formData, requirements: text })}
                multiline
                numberOfLines={3}
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Benefits</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="What are the benefits?"
                value={formData.benefits}
                onChangeText={(text) => setFormData({ ...formData, benefits: text })}
                multiline
                numberOfLines={3}
              />
            </View>

            <TouchableOpacity
              style={[styles.submitButton, loading && styles.submitButtonDisabled]}
              onPress={handleSubmit}
              disabled={loading}
            >
              <LinearGradient
                colors={['#10b981', '#059669']}
                style={styles.submitGradient}
              >
                {loading ? (
                  <ActivityIndicator color={COLORS.white} />
                ) : (
                  <>
                    <Icon name="add" size={20} color={COLORS.white} />
                    <Text style={styles.submitButtonText}>Create Resource</Text>
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: BORDER_RADIUS.xxl,
    borderTopRightRadius: BORDER_RADIUS.xxl,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  modalTitle: {
    fontSize: TYPOGRAPHY.sizes.xl,
    fontWeight: 'bold',
    color: '#1B2A4A',
  },
  closeButton: {
    padding: SPACING.sm,
  },
  modalContent: {
    padding: SPACING.lg,
  },
  field: {
    marginBottom: SPACING.md,
  },
  label: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: '500',
    color: COLORS.gray700,
    marginBottom: SPACING.xs,
  },
  input: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    fontSize: TYPOGRAPHY.sizes.md,
    color: '#1B2A4A',
    backgroundColor: '#f8fafc',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  row: {
    flexDirection: 'row',
  },
  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  typeOption: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: '#f1f5f9',
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  typeOptionActive: {
    backgroundColor: '#eef2ff',
    borderColor: '#1B2A4A',
  },
  typeOptionText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: '#64748b',
  },
  typeOptionTextActive: {
    color: '#1B2A4A',
    fontWeight: '500',
  },
  countryPicker: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  countryOption: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: '#f1f5f9',
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  countryOptionActive: {
    backgroundColor: '#eef2ff',
    borderColor: '#1B2A4A',
  },
  countryOptionText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: '#64748b',
  },
  countryOptionTextActive: {
    color: '#1B2A4A',
    fontWeight: '500',
  },
  submitButton: {
    marginTop: SPACING.md,
    marginBottom: SPACING.xl,
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
  },
  submitButtonText: {
    color: COLORS.white,
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: 'bold',
  },
});