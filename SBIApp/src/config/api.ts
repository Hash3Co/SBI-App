// src/config/api.ts
import { API_CONFIG } from './apiConfig';

export const API_ENDPOINTS = {
  auth: {
    register: `${API_CONFIG.baseURL}/auth/register/`,
    login: `${API_CONFIG.baseURL}/auth/login/`,
    logout: `${API_CONFIG.baseURL}/auth/logout/`,
    refresh: `${API_CONFIG.baseURL}/auth/refresh/`,
    forgotPassword: `${API_CONFIG.baseURL}/auth/forgot-password/`,
    resetPassword: `${API_CONFIG.baseURL}/auth/reset-password/`,
    verifyEmail: `${API_CONFIG.baseURL}/auth/verify-email/`,
    me: `${API_CONFIG.baseURL}/auth/profile/`,
    profile: `${API_CONFIG.baseURL}/auth/profile/update/`,
    verify: `${API_CONFIG.baseURL}/auth/verify/`,
    changePassword: `${API_CONFIG.baseURL}/auth/change-password/`,
  },
  sme: {
    profile: `${API_CONFIG.baseURL}/sme/profile/`,
    updateProfile: `${API_CONFIG.baseURL}/sme/profile/update/`,
    readinessScore: `${API_CONFIG.baseURL}/sme/readiness-score/`,
    myMatches: `${API_CONFIG.baseURL}/sme/matches/`,
    documents: `${API_CONFIG.baseURL}/sme/documents/`,
    profileCompletion: `${API_CONFIG.baseURL}/sme/profile/completion/`,
  },
  investor: {
    profile: `${API_CONFIG.baseURL}/investor/profile/`,
    updateProfile: `${API_CONFIG.baseURL}/investor/profile/update/`,
    matches: `${API_CONFIG.baseURL}/investor/matches/`,
    portfolio: `${API_CONFIG.baseURL}/investor/portfolio/`,
    impactMetrics: `${API_CONFIG.baseURL}/investor/impact-metrics/`,
    profileCompletion: `${API_CONFIG.baseURL}/investor/profile/completion/`,
  },
  matching: {
    getMatches: `${API_CONFIG.baseURL}/matching/`,
    getSuggestions: `${API_CONFIG.baseURL}/matching/suggestions/`,
    updatePreferences: `${API_CONFIG.baseURL}/matching/preferences/`,
    acceptMatch: `${API_CONFIG.baseURL}/matching/accept/`,
    rejectMatch: `${API_CONFIG.baseURL}/matching/reject/`,
    stats: `${API_CONFIG.baseURL}/matching/stats/`,
    connect: `${API_CONFIG.baseURL}/matching/connect/`,
  },
  training: {
    courses: `${API_CONFIG.baseURL}/training/courses/`,
    courseDetail: (id: string) => `${API_CONFIG.baseURL}/training/courses/${id}/`,
    enrolled: `${API_CONFIG.baseURL}/training/courses/enrolled/`,
    recommended: `${API_CONFIG.baseURL}/training/courses/recommended/`,
    categories: `${API_CONFIG.baseURL}/training/courses/categories/`,
    enroll: `${API_CONFIG.baseURL}/training/enroll/`,
    progress: `${API_CONFIG.baseURL}/training/progress/`,
    completeChapter: `${API_CONFIG.baseURL}/training/complete-chapter/`,
    submitQuiz: `${API_CONFIG.baseURL}/training/quiz/submit/`,
    certificate: (courseId: string) => `${API_CONFIG.baseURL}/training/certificate/${courseId}/`,
  },
  payment: {
    subscriptions: `${API_CONFIG.baseURL}/payment/subscriptions/`,
    current: `${API_CONFIG.baseURL}/payment/subscriptions/current/`,
    createPaymentIntent: `${API_CONFIG.baseURL}/payment/create-intent/`,
    confirmPayment: `${API_CONFIG.baseURL}/payment/confirm/`,
    history: `${API_CONFIG.baseURL}/payment/history/`,
    cancelSubscription: `${API_CONFIG.baseURL}/payment/cancel-subscription/`,
    paymentMethods: `${API_CONFIG.baseURL}/payment/methods/`,
    setDefault: (id: string) => `${API_CONFIG.baseURL}/payment/methods/${id}/set-default/`,
  },
  marketplace: {
    resources: `${API_CONFIG.baseURL}/marketplace/resources/`,
    categories: `${API_CONFIG.baseURL}/marketplace/categories/`,
    countries: `${API_CONFIG.baseURL}/marketplace/resources/countries/`,
    types: `${API_CONFIG.baseURL}/marketplace/resources/types/`,
    stats: `${API_CONFIG.baseURL}/marketplace/resources/stats/`,
    tradeRequests: `${API_CONFIG.baseURL}/marketplace/trade-requests/`,
    myResources: `${API_CONFIG.baseURL}/marketplace/resources/my/`,
    saved: `${API_CONFIG.baseURL}/marketplace/saved/`,
    recommendations: `${API_CONFIG.baseURL}/marketplace/resources/recommendations/`,
  },
  notifications: {
    // Notifications
    list: `${API_CONFIG.baseURL}/notifications/`,
    unreadCount: `${API_CONFIG.baseURL}/notifications/unread-count/`,
    markRead: (id: string) => `${API_CONFIG.baseURL}/notifications/${id}/read/`,
    markAllRead: `${API_CONFIG.baseURL}/notifications/mark-all-read/`,
    preferences: `${API_CONFIG.baseURL}/notifications/preferences/`,
    
    // Conversations
    conversations: `${API_CONFIG.baseURL}/notifications/conversations/`,
    conversationDetail: (id: string) => `${API_CONFIG.baseURL}/notifications/conversations/${id}/`,
    conversationMarkRead: (id: string) => `${API_CONFIG.baseURL}/notifications/conversations/${id}/mark-read/`,
    
    // Messages
    messages: `${API_CONFIG.baseURL}/notifications/messages/`,
    messagesUnread: `${API_CONFIG.baseURL}/notifications/messages/unread-count/`,
    messageRead: (id: string) => `${API_CONFIG.baseURL}/notifications/messages/${id}/read/`,
    
    // Devices
    devices: `${API_CONFIG.baseURL}/notifications/devices/`,
    registerDevice: `${API_CONFIG.baseURL}/notifications/devices/register/`,
    deleteDevice: (id: string) => `${API_CONFIG.baseURL}/notifications/devices/${id}/`,
  },
  
  health: `${API_CONFIG.baseURL}/health/`,
};

export default API_ENDPOINTS;