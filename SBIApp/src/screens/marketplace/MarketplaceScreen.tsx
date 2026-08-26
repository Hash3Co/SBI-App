// src/screens/marketplace/MarketplaceScreen.tsx
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  FlatList,
  Animated,
  RefreshControl,
  Modal,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';
import { useAuth } from '../../context/AuthenticationContext';
import { useMarketplace } from '../../context/MarketplaceContext';
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS, SHADOWS } from '../../constants/theme';
import { MarketplaceResource } from '../../types';
import { CreateResourceModal } from './CreateResourceModal';
import { ResourceDetailModal } from './ResourceDetailModal';

export const MarketplaceScreen = ({ navigation }: any) => {
  const { user } = useAuth();
  const {
    resources,
    myResources,
    savedResources,
    isLoading,
    fetchResources,
    fetchMyResources,
    fetchSavedResources,
    deleteResource,
    saveResource,
    unsaveResource,
  } = useMarketplace();

  const [selectedCountry, setSelectedCountry] = useState('All');
  const [selectedType, setSelectedType] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedResource, setSelectedResource] = useState<MarketplaceResource | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'my' | 'saved'>('all');
  const [fadeAnim] = useState(new Animated.Value(0));

  // Only investors can create resources
  const canCreate = user?.role === 'investor';

  useEffect(() => {
    loadData();
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
  }, []);

  const loadData = async () => {
    await Promise.all([
      fetchResources(),
      fetchMyResources(),
      fetchSavedResources(),
    ]);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleSearch = () => {
    const filters: any = {};
    if (searchQuery) filters.search = searchQuery;
    if (selectedCountry !== 'All') filters.country = selectedCountry;
    if (selectedType !== 'All') filters.type = selectedType;
    fetchResources(filters);
  };

  const handleDeleteResource = (resourceId: string) => {
    Alert.alert(
      'Delete Resource',
      'Are you sure you want to delete this resource?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => deleteResource(resourceId)
        },
      ]
    );
  };

  const getDisplayResources = () => {
    switch (activeTab) {
      case 'my':
        return myResources;
      case 'saved':
        return savedResources;
      default:
        return resources;
    }
  };

  const getCountries = () => {
    const countries = ['All', ...new Set(resources.map(r => r.country))];
    return countries;
  };

  const getResourceTypes = () => {
    const types = ['All', ...new Set(resources.map(r => r.resource_type))];
    return types;
  };

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      'training': '#6366f1',
      'research': '#06b6d4',
      'software': '#10b981',
      'consulting': '#f59e0b',
      'event': '#ec4899',
      'funding': '#8b5cf6',
      'partnership': '#14b8a6',
      'supply': '#f97316',
      'export': '#6366f1',
      'investment': '#ef4444',
    };
    return colors[type] || '#6366f1';
  };

  const getTypeIcon = (type: string) => {
    const icons: Record<string, string> = {
      'training': 'school',
      'research': 'analytics',
      'software': 'code',
      'consulting': 'work',
      'event': 'event',
      'funding': 'attach-money',
      'partnership': 'handshake',
      'supply': 'local-shipping',
      'export': 'flight',
      'investment': 'trending-up',
    };
    return icons[type] || 'apps';
  };

  const renderResourceItem = ({ item }: { item: MarketplaceResource }) => {
    const isSaved = savedResources.some(r => r.id === item.id);
    const isOwner = item.seller?.id === user?.id;

    return (
      <Animated.View style={[styles.resourceCard, { opacity: fadeAnim }]}>
        <TouchableOpacity
          onPress={() => {
            setSelectedResource(item);
            setShowDetailModal(true);
          }}
          activeOpacity={0.7}
        >
          <View style={styles.resourceHeader}>
            <View style={[styles.resourceTypeBadge, { backgroundColor: getTypeColor(item.resource_type) + '20' }]}>
              <Icon name={getTypeIcon(item.resource_type)} size={14} color={getTypeColor(item.resource_type)} />
              <Text style={[styles.resourceTypeText, { color: getTypeColor(item.resource_type) }]}>
                {item.resource_type.toUpperCase()}
              </Text>
            </View>
            <View style={styles.resourceCountry}>
              <Icon name="place" size={14} color="#94a3b8" />
              <Text style={styles.resourceCountryText}>{item.country}</Text>
            </View>
          </View>

          <Text style={styles.resourceTitle} numberOfLines={2}>{item.title}</Text>
          <Text style={styles.resourceDescription} numberOfLines={2}>{item.description}</Text>

          <View style={styles.resourceFooter}>
            <View style={styles.resourceSellerContainer}>
              <Icon name="store" size={14} color="#94a3b8" />
              <Text style={styles.resourceSeller}>{item.seller_name || 'Unknown'}</Text>
            </View>
            <View style={styles.resourceStats}>
              <View style={styles.statItem}>
                <Icon name="visibility" size={14} color="#94a3b8" />
                <Text style={styles.statText}>{item.views || 0}</Text>
              </View>
              <View style={styles.statItem}>
                <Icon name="bookmark" size={14} color="#94a3b8" />
                <Text style={styles.statText}>{item.saves || 0}</Text>
              </View>
            </View>
          </View>

          <View style={styles.resourcePriceContainer}>
            <Text style={styles.resourcePrice}>
              {item.currency || 'M'} {Number(item.price).toLocaleString()}
            </Text>
          </View>
        </TouchableOpacity>

        <View style={styles.resourceActions}>
          {isOwner && (
            <>
              <TouchableOpacity 
                style={styles.actionButton}
                onPress={() => {
                  setSelectedResource(item);
                  setShowDetailModal(true);
                }}
              >
                <Icon name="edit" size={18} color="#6366f1" />
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.actionButton, styles.deleteButton]}
                onPress={() => handleDeleteResource(item.id)}
              >
                <Icon name="delete" size={18} color="#ef4444" />
              </TouchableOpacity>
            </>
          )}
          {!isOwner && (
            <>
              <TouchableOpacity 
                style={[styles.actionButton, isSaved && styles.savedButton]}
                onPress={() => isSaved ? unsaveResource(item.id) : saveResource(item.id)}
              >
                <Icon 
                  name={isSaved ? 'bookmark' : 'bookmark-border'} 
                  size={18} 
                  color={isSaved ? '#6366f1' : '#94a3b8'} 
                />
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.actionButton, styles.tradeButton]}
                onPress={() => {
                  setSelectedResource(item);
                  setShowDetailModal(true);
                }}
              >
                <Icon name="send" size={18} color="#10b981" />
              </TouchableOpacity>
            </>
          )}
        </View>
      </Animated.View>
    );
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#1B2A4A', '#2A3F6A', '#3A558A']}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      >
        <Text style={styles.headerTitle}>Marketplace</Text>
        <Text style={styles.headerSubtitle}>Resources & Opportunities</Text>

        <View style={styles.searchContainer}>
          <Icon name="search" size={20} color="#94a3b8" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search resources..."
            placeholderTextColor="#94a3b8"
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearch}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Icon name="close" size={20} color="#94a3b8" />
            </TouchableOpacity>
          )}
        </View>
      </LinearGradient>

      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'all' && styles.tabActive]}
          onPress={() => setActiveTab('all')}
        >
          <Text style={[styles.tabText, activeTab === 'all' && styles.tabTextActive]}>
            All Resources
          </Text>
          <Text style={styles.tabCount}>{resources.length}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'my' && styles.tabActive]}
          onPress={() => setActiveTab('my')}
        >
          <Text style={[styles.tabText, activeTab === 'my' && styles.tabTextActive]}>
            My Resources
          </Text>
          <Text style={styles.tabCount}>{myResources.length}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'saved' && styles.tabActive]}
          onPress={() => setActiveTab('saved')}
        >
          <Text style={[styles.tabText, activeTab === 'saved' && styles.tabTextActive]}>
            Saved
          </Text>
          <Text style={styles.tabCount}>{savedResources.length}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.filterSection}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
          <Text style={styles.filterLabel}>Country:</Text>
          {getCountries().map(country => (
            <TouchableOpacity
              key={country}
              style={[styles.filterChip, selectedCountry === country && styles.filterChipActive]}
              onPress={() => setSelectedCountry(country)}
            >
              <Text style={[styles.filterChipText, selectedCountry === country && styles.filterChipTextActive]}>
                {country}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <View style={styles.typeFilterSection}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {getResourceTypes().map(type => (
            <TouchableOpacity
              key={type}
              style={[styles.typeChip, selectedType === type && styles.typeChipActive]}
              onPress={() => setSelectedType(type)}
            >
              <Text style={[styles.typeChipText, selectedType === type && styles.typeChipTextActive]}>
                {type === 'All' ? 'All Types' : type}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {canCreate && (
        <TouchableOpacity 
          style={styles.createButton}
          onPress={() => setShowCreateModal(true)}
        >
          <LinearGradient colors={['#10b981', '#059669']} style={styles.createGradient}>
            <Icon name="add" size={24} color={COLORS.white} />
          </LinearGradient>
        </TouchableOpacity>
      )}

      <FlatList
        data={getDisplayResources()}
        renderItem={renderResourceItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Icon name="store" size={64} color="#e2e8f0" />
            <Text style={styles.emptyStateText}>
              {activeTab === 'my' ? 'You haven\'t created any resources' :
               activeTab === 'saved' ? 'No saved resources' :
               'No resources found'}
            </Text>
            <Text style={styles.emptyStateSubtext}>
              {activeTab === 'my' && canCreate ? 'Tap the + button to create one' :
               activeTab === 'saved' ? 'Save resources you\'re interested in' :
               'Try adjusting your filters'}
            </Text>
          </View>
        }
      />

      {/* Create Resource Modal */}
      <CreateResourceModal
        visible={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={() => {
          setShowCreateModal(false);
          loadData();
        }}
      />

      {/* Resource Detail Modal */}
      <ResourceDetailModal
        visible={showDetailModal}
        resource={selectedResource}
        onClose={() => setShowDetailModal(false)}
        onUpdate={() => loadData()}
        onDelete={(id) => {
          setShowDetailModal(false);
          handleDeleteResource(id);
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F7FA' },
  header: {
    padding: SPACING.xl,
    paddingTop: SPACING.xxxl,
    paddingBottom: SPACING.lg,
    borderBottomLeftRadius: BORDER_RADIUS.xxl,
    borderBottomRightRadius: BORDER_RADIUS.xxl,
  },
  headerTitle: {
    fontSize: TYPOGRAPHY.sizes.xxl,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  headerSubtitle: {
    fontSize: TYPOGRAPHY.sizes.md,
    color: 'rgba(255,255,255,0.9)',
    marginTop: SPACING.xs,
    marginBottom: SPACING.md,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: BORDER_RADIUS.lg,
    paddingHorizontal: SPACING.md,
    gap: SPACING.sm,
    marginTop: SPACING.sm,
  },
  searchInput: {
    flex: 1,
    paddingVertical: SPACING.md,
    fontSize: TYPOGRAPHY.sizes.md,
    color: COLORS.white,
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    marginHorizontal: SPACING.lg,
    marginTop: -SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    ...SHADOWS.md,
    padding: 4,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    gap: SPACING.sm,
  },
  tabActive: {
    backgroundColor: '#1B2A4A',
  },
  tabText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: '#94a3b8',
    fontWeight: '500',
  },
  tabTextActive: {
    color: COLORS.white,
    fontWeight: 'bold',
  },
  tabCount: {
    fontSize: 10,
    color: '#94a3b8',
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.round,
  },
  filterSection: {
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.lg,
  },
  filterScroll: {
    flexDirection: 'row',
  },
  filterLabel: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: '#64748b',
    fontWeight: '500',
    marginRight: SPACING.sm,
    paddingVertical: SPACING.xs,
  },
  filterChip: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    backgroundColor: '#f1f5f9',
    borderRadius: BORDER_RADIUS.round,
    marginRight: SPACING.sm,
  },
  filterChipActive: {
    backgroundColor: '#1B2A4A',
  },
  filterChipText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: '#64748b',
  },
  filterChipTextActive: {
    color: COLORS.white,
  },
  typeFilterSection: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.sm,
  },
  typeChip: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.round,
    marginRight: SPACING.sm,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  typeChipActive: {
    backgroundColor: '#1B2A4A',
    borderColor: '#1B2A4A',
  },
  typeChipText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: '#64748b',
  },
  typeChipTextActive: {
    color: COLORS.white,
  },
  listContent: {
    padding: SPACING.lg,
    paddingBottom: SPACING.xxxl,
  },
  resourceCard: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    ...SHADOWS.md,
  },
  resourceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
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
    fontWeight: 'bold',
  },
  resourceCountry: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  resourceCountryText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: '#94a3b8',
  },
  resourceTitle: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: 'bold',
    color: '#1B2A4A',
    marginBottom: SPACING.xs,
  },
  resourceDescription: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: '#64748b',
    marginBottom: SPACING.md,
  },
  resourceFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  resourceSellerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  resourceSeller: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: '#94a3b8',
  },
  resourceStats: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: 10,
    color: '#94a3b8',
  },
  resourcePriceContainer: {
    marginTop: SPACING.xs,
  },
  resourcePrice: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: 'bold',
    color: '#10b981',
  },
  resourceActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: SPACING.sm,
    gap: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    paddingTop: SPACING.sm,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteButton: {
    backgroundColor: '#fef2f2',
  },
  savedButton: {
    backgroundColor: '#eef2ff',
  },
  tradeButton: {
    backgroundColor: '#ecfdf5',
  },
  createButton: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    zIndex: 10,
    ...SHADOWS.lg,
  },
  createGradient: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyState: {
    alignItems: 'center',
    padding: SPACING.xxxl,
    marginTop: SPACING.xxl,
  },
  emptyStateText: {
    fontSize: TYPOGRAPHY.sizes.lg,
    color: '#94a3b8',
    marginTop: SPACING.md,
  },
  emptyStateSubtext: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: '#cbd5e1',
    marginTop: SPACING.xs,
  },
});