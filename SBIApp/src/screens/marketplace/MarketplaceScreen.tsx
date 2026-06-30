// MarketplaceScreen.tsx
import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, FlatList, Animated } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { LinearGradient } from 'react-native-linear-gradient';
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS, SHADOWS } from '../../constants/theme';

export const MarketplaceScreen = () => {
  const [selectedCountry, setSelectedCountry] = useState('All');
  const [selectedType, setSelectedType] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [resources] = useState([
    { id: '1', title: 'Export Ready Training Manual', description: 'Complete guide for African SMEs to prepare for export', seller: 'AfriTrade Institute', price: 1500, country: 'South Africa', type: 'training' },
    { id: '2', title: 'Market Research Report: Tech Sector', description: 'Comprehensive analysis of African tech market trends', seller: 'DataAfrica', price: 2500, country: 'Kenya', type: 'research' },
    { id: '3', title: 'Export Compliance Software', description: 'Digital tool for export documentation management', seller: 'CompliancePro', price: 5000, country: 'Nigeria', type: 'software' },
  ]);
  const [fadeAnim] = useState(new Animated.Value(0));

  React.useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, []);

  const filteredResources = resources.filter(resource => {
    const matchesCountry = selectedCountry === 'All' || resource.country === selectedCountry;
    const matchesType = selectedType === 'All' || resource.type === selectedType;
    const matchesSearch = resource.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          resource.seller.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCountry && matchesType && matchesSearch;
  });

  const countries = ['All', ...new Set(resources.map(r => r.country))];
  const resourceTypes = ['All', ...new Set(resources.map(r => r.type))];

  const getTypeColor = (type: string) => {
    switch(type) {
      case 'training': return '#6366f1';
      case 'research': return '#06b6d4';
      case 'software': return '#10b981';
      default: return '#f59e0b';
    }
  };

  const getTypeIcon = (type: string) => {
    switch(type) {
      case 'training': return 'school';
      case 'research': return 'analytics';
      case 'software': return 'code';
      default: return 'apps';
    }
  };

  const renderResourceItem = ({ item, index }: any) => (
    <Animated.View style={[
      styles.resourceCard,
      {
        opacity: fadeAnim,
        transform: [{ translateY: fadeAnim.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }],
      }
    ]}>
      <View style={styles.resourceHeader}>
        <View style={[styles.resourceTypeBadge, { backgroundColor: getTypeColor(item.type) + '20' }]}>
          <Icon name={getTypeIcon(item.type)} size={14} color={getTypeColor(item.type)} />
          <Text style={[styles.resourceTypeText, { color: getTypeColor(item.type) }]}>{item.type.toUpperCase()}</Text>
        </View>
        <View style={styles.resourceCountry}>
          <Icon name="place" size={14} color="#94a3b8" />
          <Text style={styles.resourceCountryText}>{item.country}</Text>
        </View>
      </View>
      <Text style={styles.resourceTitle}>{item.title}</Text>
      <Text style={styles.resourceDescription} numberOfLines={2}>{item.description}</Text>
      <View style={styles.resourceFooter}>
        <View style={styles.resourceSellerContainer}>
          <Icon name="store" size={14} color="#94a3b8" />
          <Text style={styles.resourceSeller}>{item.seller}</Text>
        </View>
        <View style={styles.resourcePriceContainer}>
          <Text style={styles.resourcePrice}>M {item.price.toLocaleString()}</Text>
          <TouchableOpacity style={styles.resourceButton}>
            <LinearGradient colors={['#6366f1', '#4f46e5']} style={styles.resourceGradient}>
              <Text style={styles.resourceButtonText}>View</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    </Animated.View>
  );

  return (
    <View style={styles.container}>
      <LinearGradient 
        colors={['#6366f1', '#4f46e5', '#4338ca']} 
        style={styles.header}
        start={{x: 0, y: 0}}
        end={{x: 1, y: 0}}
      >
        <Text style={styles.headerTitle}>Marketplace</Text>
        <Text style={styles.headerSubtitle}>Trade Resources & Export Tools</Text>
      </LinearGradient>

      <View style={styles.searchContainer}>
        <Icon name="search" size={20} color="#94a3b8" />
        <TextInput 
          style={styles.searchInput} 
          placeholder="Search resources..." 
          placeholderTextColor="#94a3b8" 
          value={searchQuery} 
          onChangeText={setSearchQuery} 
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Icon name="close" size={20} color="#94a3b8" />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.filterSection}>
        <View style={styles.filterHeader}>
          <Text style={styles.filterLabel}>Filter by Country</Text>
          <TouchableOpacity onPress={() => setSelectedCountry('All')}>
            <Text style={styles.clearFilter}>Clear</Text>
          </TouchableOpacity>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.countryScroll}>
          {countries.map(country => (
            <TouchableOpacity 
              key={country} 
              style={[styles.countryChip, selectedCountry === country && styles.countryChipActive]} 
              onPress={() => setSelectedCountry(country)}
            >
              <Text style={[styles.countryChipText, selectedCountry === country && styles.countryChipTextActive]}>
                {country}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <View style={styles.typeFilterSection}>
        {resourceTypes.map(type => (
          <TouchableOpacity 
            key={type} 
            style={[styles.typeButton, selectedType === type && styles.typeButtonActive]} 
            onPress={() => setSelectedType(type)}
          >
            <Text style={[styles.typeButtonText, selectedType === type && styles.typeButtonTextActive]}>
              {type}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList 
        data={filteredResources} 
        renderItem={renderResourceItem} 
        keyExtractor={item => item.id} 
        contentContainerStyle={styles.listContent} 
        showsVerticalScrollIndicator={false} 
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Icon name="store" size={64} color="#e2e8f0" />
            <Text style={styles.emptyStateText}>No resources found</Text>
            <Text style={styles.emptyStateSubtext}>Try adjusting your filters</Text>
          </View>
        } 
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: { 
    padding: SPACING.xl, 
    paddingTop: SPACING.xxxl, 
    paddingBottom: SPACING.xxl,
    borderBottomLeftRadius: BORDER_RADIUS.xxl,
    borderBottomRightRadius: BORDER_RADIUS.xxl,
  },
  headerTitle: { 
    fontSize: TYPOGRAPHY.sizes.xxl, 
    fontWeight: 'bold', 
    color: COLORS.white 
  },
  headerSubtitle: { 
    fontSize: TYPOGRAPHY.sizes.md, 
    color: 'rgba(255,255,255,0.9)', 
    marginTop: SPACING.xs 
  },
  searchContainer: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: COLORS.white, 
    marginHorizontal: SPACING.lg, 
    marginTop: -SPACING.lg, 
    paddingHorizontal: SPACING.md, 
    borderRadius: BORDER_RADIUS.lg, 
    ...SHADOWS.md,
    gap: SPACING.sm,
  },
  searchInput: { 
    flex: 1, 
    paddingVertical: SPACING.md, 
    fontSize: TYPOGRAPHY.sizes.md, 
    color: '#1e293b' 
  },
  filterSection: { paddingHorizontal: SPACING.lg, paddingTop: SPACING.lg },
  filterHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  filterLabel: { 
    fontSize: TYPOGRAPHY.sizes.sm, 
    fontWeight: '500', 
    color: '#64748b' 
  },
  clearFilter: { 
    fontSize: TYPOGRAPHY.sizes.sm, 
    color: '#6366f1', 
    fontWeight: '500' 
  },
  countryScroll: { marginBottom: SPACING.xs },
  countryChip: { 
    paddingHorizontal: SPACING.md, 
    paddingVertical: SPACING.sm, 
    backgroundColor: '#f1f5f9', 
    borderRadius: BORDER_RADIUS.round, 
    marginRight: SPACING.sm 
  },
  countryChipActive: { backgroundColor: '#6366f1' },
  countryChipText: { 
    fontSize: TYPOGRAPHY.sizes.sm, 
    color: '#64748b' 
  },
  countryChipTextActive: { color: COLORS.white },
  typeFilterSection: { 
    flexDirection: 'row', 
    paddingHorizontal: SPACING.lg, 
    marginBottom: SPACING.lg, 
    gap: SPACING.sm 
  },
  typeButton: { 
    flex: 1, 
    paddingVertical: SPACING.sm, 
    backgroundColor: COLORS.white, 
    borderRadius: BORDER_RADIUS.md, 
    borderWidth: 1, 
    borderColor: '#6366f1', 
    alignItems: 'center' 
  },
  typeButtonActive: { backgroundColor: '#6366f1' },
  typeButtonText: { 
    fontSize: TYPOGRAPHY.sizes.sm, 
    color: '#6366f1' 
  },
  typeButtonTextActive: { color: COLORS.white },
  listContent: { padding: SPACING.lg, paddingTop: 0 },
  resourceCard: { 
    backgroundColor: COLORS.white, 
    borderRadius: BORDER_RADIUS.lg, 
    padding: SPACING.lg, 
    marginBottom: SPACING.md, 
    ...SHADOWS.sm 
  },
  resourceHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: SPACING.sm 
  },
  resourceTypeBadge: { 
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.sm, 
    paddingVertical: 4, 
    borderRadius: BORDER_RADIUS.sm,
    gap: 4,
  },
  resourceTypeText: { 
    fontSize: 10, 
    fontWeight: 'bold' 
  },
  resourceCountry: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 4 
  },
  resourceCountryText: { 
    fontSize: TYPOGRAPHY.sizes.xs, 
    color: '#94a3b8' 
  },
  resourceTitle: { 
    fontSize: TYPOGRAPHY.sizes.md, 
    fontWeight: 'bold', 
    color: '#1e293b', 
    marginBottom: SPACING.xs 
  },
  resourceDescription: { 
    fontSize: TYPOGRAPHY.sizes.sm, 
    color: '#64748b', 
    marginBottom: SPACING.md 
  },
  resourceFooter: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center' 
  },
  resourceSellerContainer: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 4 
  },
  resourceSeller: { 
    fontSize: TYPOGRAPHY.sizes.xs, 
    color: '#94a3b8' 
  },
  resourcePriceContainer: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: SPACING.sm 
  },
  resourcePrice: { 
    fontSize: TYPOGRAPHY.sizes.md, 
    fontWeight: 'bold', 
    color: '#10b981' 
  },
  resourceButton: { borderRadius: BORDER_RADIUS.sm, overflow: 'hidden' },
  resourceGradient: { 
    paddingHorizontal: SPACING.md, 
    paddingVertical: 4, 
    alignItems: 'center' 
  },
  resourceButtonText: { 
    fontSize: 10, 
    color: COLORS.white, 
    fontWeight: 'bold' 
  },
  emptyState: { alignItems: 'center', padding: SPACING.xxxl },
  emptyStateText: { 
    fontSize: TYPOGRAPHY.sizes.lg, 
    color: '#94a3b8', 
    marginTop: SPACING.md 
  },
  emptyStateSubtext: { 
    fontSize: TYPOGRAPHY.sizes.sm, 
    color: '#cbd5e1', 
    marginTop: SPACING.xs 
  },
});