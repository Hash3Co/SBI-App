export const API_ENDPOINTS = {
  auth: {
    register: '/auth/register/',
    login: '/auth/login/',
    logout: '/auth/logout/',
    refresh: '/auth/token/refresh/',
    forgotPassword: '/auth/forgot-password/',
    resetPassword: '/auth/reset-password/',
    verifyEmail: '/auth/verify-email/',
  },
  sme: {
    profile: '/sme/profile/',
    updateProfile: '/sme/profile/update/',
    readinessScore: '/sme/readiness-score/',
    myMatches: '/sme/matches/',
    documents: '/sme/documents/',
  },
  investor: {
    profile: '/investor/profile/',
    updateProfile: '/investor/profile/update/',
    matches: '/investor/matches/',
    portfolio: '/investor/portfolio/',
    impactMetrics: '/investor/impact-metrics/',
  },
  matching: {
    getMatches: '/matching/',
    getSuggestions: '/matching/suggestions/',
    updatePreferences: '/matching/preferences/',
    acceptMatch: '/matching/accept/',
    rejectMatch: '/matching/reject/',
  },
  training: {
    courses: '/training/courses/',
    courseDetail: (id: string) => `/training/courses/${id}/`,
    enroll: '/training/enroll/',
    progress: '/training/progress/',
    completeChapter: '/training/complete-chapter/',
    submitQuiz: '/training/quiz/submit/',
    certificate: (courseId: string) => `/training/certificate/${courseId}/`,
  },
  payment: {
    subscriptions: '/payment/subscriptions/',
    createPaymentIntent: '/payment/create-intent/',
    confirmPayment: '/payment/confirm/',
    history: '/payment/history/',
    cancelSubscription: '/payment/cancel-subscription/',
    paymentMethods: '/payment/methods/',
  },
  marketplace: {
    resources: '/marketplace/resources/',
    countries: '/marketplace/countries/',
    tradeRequest: '/marketplace/trade-request/',
  },
  analytics: {
    smeInsights: '/analytics/sme/',
    investorInsights: '/analytics/investor/',
    impactMetrics: '/analytics/impact/',
  },
  health: '/health/',
};

export default API_ENDPOINTS;