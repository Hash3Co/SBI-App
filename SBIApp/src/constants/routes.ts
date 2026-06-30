export const ROUTES = {
  AUTH: 'Auth',
  LOGIN: 'Login',
  REGISTER: 'Register',
  FORGOT_PASSWORD: 'ForgotPassword',
  ONBOARDING: 'Onboarding',
  MAIN: 'Main',
  SME_DASHBOARD: 'SMEDashboard',
  SME_PROFILE: 'SMEProfile',
  READINESS_SCORE: 'ReadinessScore',
  INVESTOR_DASHBOARD: 'InvestorDashboard',
  INVESTOR_PROFILE: 'InvestorProfile',
  PORTFOLIO: 'Portfolio',
  MATCHING: 'Matching',
  MARKETPLACE: 'Marketplace',
  COURSE_LIBRARY: 'CourseLibrary',
  COURSE_DETAIL: 'CourseDetail',
  VIDEO_PLAYER: 'VideoPlayer',
  QUIZ: 'Quiz',
  CERTIFICATE: 'Certificate',
  SUBSCRIPTION: 'Subscription',
  PAYMENT_METHOD: 'PaymentMethod',
  PAYMENT_HISTORY: 'PaymentHistory',
  ANALYTICS: 'Analytics',
  NOTIFICATIONS: 'Notifications',
  SETTINGS: 'Settings',
};

export type RootStackParamList = {
  [ROUTES.AUTH]: undefined;
  [ROUTES.LOGIN]: undefined;
  [ROUTES.REGISTER]: undefined;
  [ROUTES.FORGOT_PASSWORD]: undefined;
  [ROUTES.ONBOARDING]: undefined;
  [ROUTES.MAIN]: undefined;
  [ROUTES.SME_DASHBOARD]: undefined;
  [ROUTES.SME_PROFILE]: undefined;
  [ROUTES.READINESS_SCORE]: undefined;
  [ROUTES.INVESTOR_DASHBOARD]: undefined;
  [ROUTES.INVESTOR_PROFILE]: undefined;
  [ROUTES.PORTFOLIO]: undefined;
  [ROUTES.MATCHING]: undefined;
  [ROUTES.MARKETPLACE]: undefined;
  [ROUTES.COURSE_LIBRARY]: undefined;
  [ROUTES.COURSE_DETAIL]: { courseId: string };
  [ROUTES.VIDEO_PLAYER]: { chapterId: string; chapterUrl: string };
  [ROUTES.QUIZ]: { courseId: string; chapterId: string };
  [ROUTES.CERTIFICATE]: { courseId: string };
  [ROUTES.SUBSCRIPTION]: undefined;
  [ROUTES.PAYMENT_METHOD]: undefined;
  [ROUTES.PAYMENT_HISTORY]: undefined;
  [ROUTES.ANALYTICS]: undefined;
  [ROUTES.NOTIFICATIONS]: undefined;
  [ROUTES.SETTINGS]: undefined;
};