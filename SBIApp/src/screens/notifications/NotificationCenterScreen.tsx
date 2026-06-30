// NotificationCenterScreen.tsx
import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Animated } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS, SHADOWS } from '../../constants/theme';

export const NotificationCenterScreen = ({ navigation }: any) => {
  const [activeTab, setActiveTab] = useState<'all' | 'unread'>('all');
  const [notifications, setNotifications] = useState([
    { id: '1', title: 'New Match!', message: 'Tech Solutions Ltd is interested in your profile', time: '2 hours ago', type: 'match', read: false },
    { id: '2', title: 'Course Completed', message: 'You completed "Business Plan Development"', time: 'Yesterday', type: 'training', read: false },
    { id: '3', title: 'Investment Opportunity', message: 'New funding round opened in Agriculture sector', time: '2 days ago', type: 'system', read: true },
    { id: '4', title: 'Profile View', message: '5 investors viewed your profile this week', time: '3 days ago', type: 'analytics', read: true },
  ]);

  const [fadeAnim] = useState(new Animated.Value(0));

  React.useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
  }, [activeTab]);

  const filteredNotifications = activeTab === 'all' ? notifications : notifications.filter(n => !n.read);

  const getTypeIcon = (type: string) => {
    switch(type) {
      case 'match': return 'people';
      case 'training': return 'school';
      case 'system': return 'info';
      case 'analytics': return 'analytics';
      default: return 'notifications';
    }
  };

  const getTypeColor = (type: string) => {
    switch(type) {
      case 'match': return '#10b981';
      case 'training': return '#06b6d4';
      case 'system': return '#f59e0b';
      case 'analytics': return '#6366f1';
      default: return '#6366f1';
    }
  };

  const handleMarkAllRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  const handleNotificationPress = (id: string) => {
    setNotifications(notifications.map(n => 
      n.id === id ? { ...n, read: true } : n
    ));
  };

  return (
    <View style={styles.container}>
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
          <Text style={styles.headerTitle}>Notifications</Text>
          <TouchableOpacity style={styles.markAllButton} onPress={handleMarkAllRead}>
            <Text style={styles.markAllText}>Mark all read</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.headerStats}>
          <View style={styles.headerStat}>
            <Text style={styles.headerStatValue}>{notifications.filter(n => !n.read).length}</Text>
            <Text style={styles.headerStatLabel}>Unread</Text>
          </View>
          <View style={styles.headerDivider} />
          <View style={styles.headerStat}>
            <Text style={styles.headerStatValue}>{notifications.length}</Text>
            <Text style={styles.headerStatLabel}>Total</Text>
          </View>
        </View>
      </LinearGradient>

      <View style={styles.tabContainer}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'all' && styles.tabActive]} 
          onPress={() => setActiveTab('all')}
        >
          <Text style={[styles.tabText, activeTab === 'all' && styles.tabTextActive]}>All</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'unread' && styles.tabActive]} 
          onPress={() => setActiveTab('unread')}
        >
          <Text style={[styles.tabText, activeTab === 'unread' && styles.tabTextActive]}>Unread</Text>
          {notifications.filter(n => !n.read).length > 0 && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadCount}>{notifications.filter(n => !n.read).length}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <Animated.ScrollView 
        style={[styles.content, { opacity: fadeAnim }]} 
        showsVerticalScrollIndicator={false}
      >
        {filteredNotifications.length === 0 ? (
          <View style={styles.emptyState}>
            <Icon name="notifications-off" size={64} color="#e2e8f0" />
            <Text style={styles.emptyStateText}>No notifications</Text>
            <Text style={styles.emptyStateSubtext}>You're all caught up!</Text>
          </View>
        ) : (
          filteredNotifications.map(notification => (
            <TouchableOpacity 
              key={notification.id} 
              style={[styles.notificationCard, !notification.read && styles.unreadCard]}
              onPress={() => handleNotificationPress(notification.id)}
            >
              <View style={[styles.iconContainer, { backgroundColor: getTypeColor(notification.type) + '20' }]}>
                <Icon name={getTypeIcon(notification.type)} size={24} color={getTypeColor(notification.type)} />
              </View>
              <View style={styles.notificationInfo}>
                <Text style={[styles.notificationTitle, !notification.read && styles.unreadText]}>
                  {notification.title}
                </Text>
                <Text style={styles.notificationMessage}>{notification.message}</Text>
                <View style={styles.notificationFooter}>
                  <Text style={styles.notificationTime}>{notification.time}</Text>
                  {!notification.read && (
                    <View style={styles.unreadDot} />
                  )}
                </View>
              </View>
            </TouchableOpacity>
          ))
        )}
      </Animated.ScrollView>
    </View>
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
    marginBottom: SPACING.lg,
  },
  backButton: { padding: SPACING.sm },
  headerTitle: { 
    fontSize: TYPOGRAPHY.sizes.xl, 
    fontWeight: 'bold', 
    color: COLORS.white 
  },
  markAllButton: { padding: SPACING.sm },
  markAllText: { 
    fontSize: TYPOGRAPHY.sizes.sm, 
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '500',
  },
  headerStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
  },
  headerStat: { alignItems: 'center' },
  headerStatValue: { 
    fontSize: TYPOGRAPHY.sizes.lg, 
    fontWeight: 'bold', 
    color: COLORS.white 
  },
  headerStatLabel: { 
    fontSize: TYPOGRAPHY.sizes.xs, 
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },
  headerDivider: { width: 1, backgroundColor: 'rgba(255,255,255,0.2)' },
  tabContainer: { 
    flexDirection: 'row', 
    backgroundColor: COLORS.white, 
    marginHorizontal: SPACING.lg, 
    marginTop: -SPACING.lg, 
    borderRadius: BORDER_RADIUS.lg, 
    ...SHADOWS.md 
  },
  tab: { 
    flex: 1, 
    flexDirection: 'row',
    alignItems: 'center', 
    justifyContent: 'center', 
    gap: SPACING.sm, 
    paddingVertical: SPACING.md, 
    borderRadius: BORDER_RADIUS.lg 
  },
  tabActive: { backgroundColor: '#6366f1' },
  tabText: { 
    fontSize: TYPOGRAPHY.sizes.md, 
    color: '#94a3b8',
    fontWeight: '500',
  },
  tabTextActive: { color: COLORS.white, fontWeight: 'bold' },
  unreadBadge: { 
    backgroundColor: '#ef4444', 
    borderRadius: BORDER_RADIUS.round, 
    minWidth: 20, 
    paddingHorizontal: 6, 
    paddingVertical: 2 
  },
  unreadCount: { 
    fontSize: 10, 
    color: COLORS.white, 
    fontWeight: 'bold' 
  },
  content: { padding: SPACING.lg },
  emptyState: { alignItems: 'center', padding: SPACING.xxxl, marginTop: SPACING.xxxl },
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
  notificationCard: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: COLORS.white, 
    borderRadius: BORDER_RADIUS.lg, 
    padding: SPACING.md, 
    marginBottom: SPACING.md, 
    ...SHADOWS.sm, 
    gap: SPACING.md 
  },
  unreadCard: { backgroundColor: '#6366f1' + '05', borderLeftWidth: 3, borderLeftColor: '#6366f1' },
  iconContainer: { 
    width: 52, 
    height: 52, 
    borderRadius: 26, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  notificationInfo: { flex: 1 },
  notificationTitle: { 
    fontSize: TYPOGRAPHY.sizes.md, 
    fontWeight: '500', 
    color: '#1e293b' 
  },
  unreadText: { fontWeight: 'bold', color: '#0f172a' },
  notificationMessage: { 
    fontSize: TYPOGRAPHY.sizes.sm, 
    color: '#64748b', 
    marginTop: 2 
  },
  notificationFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginTop: 4,
  },
  notificationTime: { 
    fontSize: TYPOGRAPHY.sizes.xs, 
    color: '#94a3b8' 
  },
  unreadDot: { 
    width: 6, 
    height: 6, 
    borderRadius: 3, 
    backgroundColor: '#6366f1' 
  },
});