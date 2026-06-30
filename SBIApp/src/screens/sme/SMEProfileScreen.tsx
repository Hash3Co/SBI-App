// SMEProfileScreen.tsx
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Animated } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS, SHADOWS } from '../../constants/theme';
import { showToast } from '../../components/Toast';

export const SMEProfileScreen = ({ navigation }: any) => {
  const [businessName, setBusinessName] = useState('Tech Solutions Ltd');
  const [industry, setIndustry] = useState('Technology');
  const [location, setLocation] = useState('Maseru, Lesotho');
  const [description, setDescription] = useState('Innovative software development company');
  const [fundingNeeded, setFundingNeeded] = useState('500000');
  const [isEditing, setIsEditing] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(1));

  const industries = ['Technology', 'Agriculture', 'Energy', 'Manufacturing', 'Retail', 'Financial Services', 'Healthcare', 'Education'];
  const locations = ['Maseru, Lesotho', 'Johannesburg, SA', 'Cape Town, SA', 'Durban, SA', 'Bloemfontein, SA', 'Gaborone, Botswana'];

  const handleSave = () => {
    setIsEditing(false);
    showToast('Profile updated successfully', 'success');
    Animated.sequence([
      Animated.timing(fadeAnim, { toValue: 0.8, duration: 100, useNativeDriver: true }),
      Animated.timing(fadeAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
    ]).start();
  };

  const getInitials = () => {
    const words = businessName.split(' ');
    return words.slice(0, 2).map(w => w[0]).join('');
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
          <Text style={styles.headerTitle}>Business Profile</Text>
          <TouchableOpacity onPress={() => setIsEditing(!isEditing)} style={styles.editButton}>
            <LinearGradient colors={['rgba(255,255,255,0.2)', 'rgba(255,255,255,0.1)']} style={styles.editGradient}>
              <Icon name={isEditing ? 'close' : 'edit'} size={20} color={COLORS.white} />
            </LinearGradient>
          </TouchableOpacity>
        </View>
        
        <Animated.View style={[styles.profileHeader, { opacity: fadeAnim }]}>
          <LinearGradient colors={['#818cf8', '#6366f1']} style={styles.avatarGradient}>
            <Text style={styles.avatarText}>{getInitials()}</Text>
          </LinearGradient>
          <Text style={styles.profileName}>{businessName}</Text>
          <Text style={styles.profileIndustry}>{industry}</Text>
          <View style={styles.profileStats}>
            <View style={styles.profileStat}>
              <Text style={styles.profileStatValue}>65%</Text>
              <Text style={styles.profileStatLabel}>Readiness Score</Text>
            </View>
            <View style={styles.profileDivider} />
            <View style={styles.profileStat}>
              <Text style={styles.profileStatValue}>M 500k</Text>
              <Text style={styles.profileStatLabel}>Funding Needed</Text>
            </View>
            <View style={styles.profileDivider} />
            <View style={styles.profileStat}>
              <Text style={styles.profileStatValue}>12</Text>
              <Text style={styles.profileStatLabel}>Investor Views</Text>
            </View>
          </View>
        </Animated.View>
      </LinearGradient>

      <View style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Basic Information</Text>
          
          <View style={styles.field}>
            <Text style={styles.label}>Business Name</Text>
            {isEditing ? (
              <TextInput style={styles.input} value={businessName} onChangeText={setBusinessName} placeholderTextColor="#94a3b8" />
            ) : (
              <Text style={styles.value}>{businessName}</Text>
            )}
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Industry</Text>
            {isEditing ? (
              <View style={styles.pickerContainer}>
                {industries.map(ind => (
                  <TouchableOpacity 
                    key={ind} 
                    style={[styles.pickerOption, industry === ind && styles.pickerOptionActive]} 
                    onPress={() => setIndustry(ind)}
                  >
                    <Text style={[styles.pickerText, industry === ind && styles.pickerTextActive]}>{ind}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            ) : (
              <View style={styles.valueContainer}>
                <Icon name="business" size={16} color="#6366f1" />
                <Text style={styles.value}>{industry}</Text>
              </View>
            )}
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Location</Text>
            {isEditing ? (
              <View style={styles.pickerContainer}>
                {locations.map(loc => (
                  <TouchableOpacity 
                    key={loc} 
                    style={[styles.pickerOption, location === loc && styles.pickerOptionActive]} 
                    onPress={() => setLocation(loc)}
                  >
                    <Text style={[styles.pickerText, location === loc && styles.pickerTextActive]}>{loc}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            ) : (
              <View style={styles.valueContainer}>
                <Icon name="location-on" size={16} color="#6366f1" />
                <Text style={styles.value}>{location}</Text>
              </View>
            )}
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Description</Text>
            {isEditing ? (
              <TextInput 
                style={[styles.input, styles.textArea]} 
                value={description} 
                onChangeText={setDescription} 
                multiline 
                numberOfLines={4} 
                placeholderTextColor="#94a3b8" 
              />
            ) : (
              <Text style={styles.value}>{description}</Text>
            )}
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Funding Needed</Text>
            {isEditing ? (
              <View style={styles.fundingInput}>
                <Text style={styles.currencySymbol}>M</Text>
                <TextInput 
                  style={[styles.input, styles.fundingTextInput]} 
                  value={fundingNeeded} 
                  onChangeText={setFundingNeeded} 
                  keyboardType="numeric" 
                  placeholderTextColor="#94a3b8" 
                />
              </View>
            ) : (
              <Text style={[styles.value, styles.fundingValue]}>M {parseInt(fundingNeeded).toLocaleString()}</Text>
            )}
          </View>
        </View>

        {isEditing && (
          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <LinearGradient colors={['#10b981', '#059669']} style={styles.saveGradient}>
              <Icon name="check" size={20} color={COLORS.white} />
              <Text style={styles.saveButtonText}>Save Changes</Text>
            </LinearGradient>
          </TouchableOpacity>
        )}
      </View>
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
    marginBottom: SPACING.xl,
  },
  backButton: { padding: SPACING.sm },
  headerTitle: { 
    fontSize: TYPOGRAPHY.sizes.xl, 
    fontWeight: 'bold', 
    color: COLORS.white 
  },
  editButton: { padding: SPACING.sm },
  editGradient: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileHeader: { alignItems: 'center' },
  avatarGradient: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.3)',
    marginBottom: SPACING.md,
  },
  avatarText: { 
    fontSize: 32, 
    fontWeight: 'bold', 
    color: COLORS.white 
  },
  profileName: { 
    fontSize: TYPOGRAPHY.sizes.xl, 
    fontWeight: 'bold', 
    color: COLORS.white,
    marginBottom: 2,
  },
  profileIndustry: { 
    fontSize: TYPOGRAPHY.sizes.md, 
    color: 'rgba(255,255,255,0.8)',
    marginBottom: SPACING.md,
  },
  profileStats: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    width: '100%',
  },
  profileStat: { flex: 1, alignItems: 'center' },
  profileStatValue: { 
    fontSize: TYPOGRAPHY.sizes.lg, 
    fontWeight: 'bold', 
    color: COLORS.white 
  },
  profileStatLabel: { 
    fontSize: TYPOGRAPHY.sizes.xs, 
    color: 'rgba(255,255,255,0.7)',
    marginTop: 2,
  },
  profileDivider: { 
    width: 1, 
    backgroundColor: 'rgba(255,255,255,0.2)' 
  },
  content: { padding: SPACING.lg, paddingBottom: SPACING.xxxl },
  section: { 
    backgroundColor: COLORS.white, 
    borderRadius: BORDER_RADIUS.lg, 
    padding: SPACING.lg, 
    ...SHADOWS.md 
  },
  sectionTitle: { 
    fontSize: TYPOGRAPHY.sizes.lg, 
    fontWeight: 'bold', 
    color: '#1e293b', 
    marginBottom: SPACING.lg 
  },
  field: { marginBottom: SPACING.lg },
  label: { 
    fontSize: TYPOGRAPHY.sizes.sm, 
    fontWeight: '500', 
    color: '#64748b', 
    marginBottom: SPACING.xs 
  },
  value: { 
    fontSize: TYPOGRAPHY.sizes.md, 
    color: '#1e293b',
    fontWeight: '500',
  },
  valueContainer: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: SPACING.xs 
  },
  fundingValue: {
    fontSize: TYPOGRAPHY.sizes.xl,
    color: '#10b981',
  },
  input: { 
    borderWidth: 1, 
    borderColor: '#e2e8f0', 
    borderRadius: BORDER_RADIUS.md, 
    padding: SPACING.md, 
    fontSize: TYPOGRAPHY.sizes.md, 
    color: '#1e293b', 
    backgroundColor: '#f8fafc' 
  },
  textArea: { 
    height: 100, 
    textAlignVertical: 'top' 
  },
  fundingInput: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  currencySymbol: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: 'bold',
    color: '#64748b',
  },
  fundingTextInput: {
    flex: 1,
  },
  pickerContainer: { 
    flexDirection: 'row', 
    flexWrap: 'wrap', 
    gap: SPACING.sm 
  },
  pickerOption: { 
    paddingHorizontal: SPACING.md, 
    paddingVertical: SPACING.sm, 
    backgroundColor: '#f1f5f9', 
    borderRadius: BORDER_RADIUS.round, 
    marginBottom: SPACING.xs 
  },
  pickerOptionActive: { backgroundColor: '#6366f1' },
  pickerText: { 
    fontSize: TYPOGRAPHY.sizes.sm, 
    color: '#64748b' 
  },
  pickerTextActive: { color: COLORS.white },
  saveButton: { 
    marginTop: SPACING.xl, 
    marginBottom: SPACING.xxxl,
    ...SHADOWS.md,
  },
  saveGradient: { 
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    paddingVertical: SPACING.md, 
    borderRadius: BORDER_RADIUS.lg 
  },
  saveButtonText: { 
    color: COLORS.white, 
    fontSize: TYPOGRAPHY.sizes.md, 
    fontWeight: 'bold' 
  },
});