// InvestorProfileScreen.tsx
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Animated } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS, SHADOWS } from '../../constants/theme';
import { showToast } from '../../components/Toast';

export const InvestorProfileScreen = ({ navigation }: any) => {
  const [fullName, setFullName] = useState('John Smith');
  const [companyName, setCompanyName] = useState('African Growth Capital');
  const [location, setLocation] = useState('Cape Town, SA');
  const [minInvestment, setMinInvestment] = useState('250000');
  const [maxInvestment, setMaxInvestment] = useState('2500000');
  const [interests, setInterests] = useState(['Technology', 'Fintech']);
  const [isEditing, setIsEditing] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(1));

  const allInterests = ['Technology', 'Fintech', 'Agriculture', 'Energy', 'Healthcare', 'Education', 'Manufacturing', 'Retail'];
  const locations = ['Cape Town, SA', 'Johannesburg, SA', 'Durban, SA', 'Maseru, Lesotho', 'Gaborone, Botswana'];

  const toggleInterest = (interest: string) => {
    if (interests.includes(interest)) {
      setInterests(interests.filter(i => i !== interest));
    } else {
      setInterests([...interests, interest]);
    }
  };

  const handleSave = () => {
    setIsEditing(false);
    showToast('Profile updated successfully', 'success');
    Animated.sequence([
      Animated.timing(fadeAnim, { toValue: 0.8, duration: 100, useNativeDriver: true }),
      Animated.timing(fadeAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
    ]).start();
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
          <Text style={styles.headerTitle}>Investor Profile</Text>
          <TouchableOpacity onPress={() => setIsEditing(!isEditing)} style={styles.editButton}>
            <LinearGradient 
              colors={['rgba(255,255,255,0.2)', 'rgba(255,255,255,0.1)']} 
              style={styles.editGradient}
            >
              <Icon name={isEditing ? 'close' : 'edit'} size={20} color={COLORS.white} />
            </LinearGradient>
          </TouchableOpacity>
        </View>
        
        <Animated.View style={[styles.profileHeader, { opacity: fadeAnim }]}>
          <View style={styles.avatarContainer}>
            <LinearGradient colors={['#818cf8', '#6366f1']} style={styles.avatarGradient}>
              <Text style={styles.avatarText}>{fullName.split(' ').map(n => n[0]).join('')}</Text>
            </LinearGradient>
            <View style={styles.verifiedBadge}>
              <Icon name="verified" size={16} color={COLORS.white} />
            </View>
          </View>
          <Text style={styles.profileName}>{fullName}</Text>
          <Text style={styles.profileRole}>Investor</Text>
          <View style={styles.profileStats}>
            <View style={styles.profileStat}>
              <Text style={styles.profileStatValue}>12</Text>
              <Text style={styles.profileStatLabel}>Investments</Text>
            </View>
            <View style={styles.profileDivider} />
            <View style={styles.profileStat}>
              <Text style={styles.profileStatValue}>M 2.4M</Text>
              <Text style={styles.profileStatLabel}>Portfolio</Text>
            </View>
            <View style={styles.profileDivider} />
            <View style={styles.profileStat}>
              <Text style={styles.profileStatValue}>24.5%</Text>
              <Text style={styles.profileStatLabel}>Avg ROI</Text>
            </View>
          </View>
        </Animated.View>
      </LinearGradient>

      <View style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Personal Information</Text>
          
          <View style={styles.field}>
            <Text style={styles.label}>Full Name</Text>
            {isEditing ? (
              <TextInput style={styles.input} value={fullName} onChangeText={setFullName} />
            ) : (
              <Text style={styles.value}>{fullName}</Text>
            )}
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Company Name</Text>
            {isEditing ? (
              <TextInput style={styles.input} value={companyName} onChangeText={setCompanyName} />
            ) : (
              <Text style={styles.value}>{companyName}</Text>
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
                    <Text style={[styles.pickerText, location === loc && styles.pickerTextActive]}>
                      {loc}
                    </Text>
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
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Investment Preferences</Text>
          
          <View style={styles.row}>
            <View style={[styles.field, { flex: 1, marginRight: SPACING.md }]}>
              <Text style={styles.label}>Min Investment (M)</Text>
              {isEditing ? (
                <TextInput 
                  style={styles.input} 
                  value={minInvestment} 
                  onChangeText={setMinInvestment} 
                  keyboardType="numeric" 
                />
              ) : (
                <Text style={styles.value}>M {parseInt(minInvestment).toLocaleString()}</Text>
              )}
            </View>
            <View style={[styles.field, { flex: 1 }]}>
              <Text style={styles.label}>Max Investment (M)</Text>
              {isEditing ? (
                <TextInput 
                  style={styles.input} 
                  value={maxInvestment} 
                  onChangeText={setMaxInvestment} 
                  keyboardType="numeric" 
                />
              ) : (
                <Text style={styles.value}>M {parseInt(maxInvestment).toLocaleString()}</Text>
              )}
            </View>
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Areas of Interest</Text>
            {isEditing ? (
              <View style={styles.interestsContainer}>
                {allInterests.map(interest => (
                  <TouchableOpacity 
                    key={interest} 
                    style={[styles.interestChip, interests.includes(interest) && styles.interestChipActive]} 
                    onPress={() => toggleInterest(interest)}
                  >
                    <Text style={[styles.interestText, interests.includes(interest) && styles.interestTextActive]}>
                      {interest}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            ) : (
              <View style={styles.interestsContainer}>
                {interests.map(interest => (
                  <View key={interest} style={styles.interestBadge}>
                    <Text style={styles.interestBadgeText}>{interest}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        </View>

        {isEditing && (
          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <LinearGradient 
              colors={['#10b981', '#059669']} 
              style={styles.saveGradient}
              start={{x: 0, y: 0}}
              end={{x: 1, y: 0}}
            >
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
  avatarContainer: { position: 'relative', marginBottom: SPACING.md },
  avatarGradient: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  avatarText: { 
    fontSize: 32, 
    fontWeight: 'bold', 
    color: COLORS.white 
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#10b981',
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#6366f1',
  },
  profileName: { 
    fontSize: TYPOGRAPHY.sizes.xl, 
    fontWeight: 'bold', 
    color: COLORS.white,
    marginBottom: 2,
  },
  profileRole: { 
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
    marginBottom: SPACING.lg, 
    ...SHADOWS.md,
  },
  sectionTitle: { 
    fontSize: TYPOGRAPHY.sizes.lg, 
    fontWeight: 'bold', 
    color: '#1e293b', 
    marginBottom: SPACING.lg 
  },
  field: { marginBottom: SPACING.md },
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
  input: { 
    borderWidth: 1, 
    borderColor: '#e2e8f0', 
    borderRadius: BORDER_RADIUS.md, 
    padding: SPACING.md, 
    fontSize: TYPOGRAPHY.sizes.md, 
    color: '#1e293b', 
    backgroundColor: '#f8fafc' 
  },
  row: { flexDirection: 'row' },
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
    marginBottom: SPACING.xs,
  },
  pickerOptionActive: { backgroundColor: '#6366f1' },
  pickerText: { 
    fontSize: TYPOGRAPHY.sizes.sm, 
    color: '#64748b' 
  },
  pickerTextActive: { color: COLORS.white },
  interestsContainer: { 
    flexDirection: 'row', 
    flexWrap: 'wrap', 
    gap: SPACING.sm 
  },
  interestChip: { 
    paddingHorizontal: SPACING.md, 
    paddingVertical: SPACING.sm, 
    backgroundColor: '#f1f5f9', 
    borderRadius: BORDER_RADIUS.round,
  },
  interestChipActive: { backgroundColor: '#6366f1' },
  interestText: { 
    fontSize: TYPOGRAPHY.sizes.sm, 
    color: '#64748b' 
  },
  interestTextActive: { color: COLORS.white },
  interestBadge: { 
    backgroundColor: '#6366f1' + '15',
    paddingHorizontal: SPACING.md, 
    paddingVertical: SPACING.sm, 
    borderRadius: BORDER_RADIUS.round,
  },
  interestBadgeText: { 
    fontSize: TYPOGRAPHY.sizes.sm, 
    color: '#6366f1',
    fontWeight: '500',
  },
  saveButton: { 
    marginTop: SPACING.md, 
    marginBottom: SPACING.xxxl,
    ...SHADOWS.md,
  },
  saveGradient: { 
    flexDirection: 'row',
    paddingVertical: SPACING.md, 
    borderRadius: BORDER_RADIUS.lg, 
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
  },
  saveButtonText: { 
    color: COLORS.white, 
    fontSize: TYPOGRAPHY.sizes.md, 
    fontWeight: 'bold' 
  },
});