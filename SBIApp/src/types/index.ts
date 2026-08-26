// src/types/index.ts
export type UserRole = 'sme' | 'investor' | 'admin';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  fullName: string;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SMEProfile {
  id: string;
  userId: string;
  businessName: string;
  industry: string;
  location: string;
  description: string;
  foundedYear: number;
  employeeCount: string;
  fundingNeeded: number;
  fundingPurpose: string;
  financials?: { annualRevenue: number; profitMargin: number };
  documents: Document[];
  verificationStatus: 'pending' | 'verified' | 'rejected';
  readinessScore: number;
  createdAt: string;
  updatedAt: string;
}

export interface InvestorProfile {
  id: string;
  userId: string;
  fullName: string;
  companyName?: string;
  investmentInterests: string[];
  preferredIndustries: string[];
  fundingRange: { min: number; max: number };
  investmentHistory: Investment[];
  portfolioValue: number;
  location: string;
  verificationStatus: 'pending' | 'verified' | 'rejected';
  createdAt: string;
  updatedAt: string;
}

export interface Investment {
  id: string;
  smeId: string;
  smeName: string;
  amount: number;
  date: string;
  equity: number;
}

export interface Match {
  id: string;
  smeId: string;
  investorId: string;
  matchScore: number;
  status: 'pending' | 'accepted' | 'rejected' | 'connected';
  smeProfile?: SMEProfile;
  investorProfile?: InvestorProfile;
  createdAt: string;
  updatedAt: string;
}

export interface MatchSuggestion {
  id: string;
  name: string;
  industry: string;
  matchScore: number;
  location: string;
  funding: number;
  color?: string;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  instructor: string;
  category: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  duration: string;
  chapters: Chapter[];
  totalChapters: number;
  completedChapters: number;
  thumbnail: string;
  price: number;
  isEnrolled: boolean;
  progress: number;
  certificateAvailable: boolean;
}

export interface Chapter {
  id: string;
  title: string;
  videoUrl: string;
  duration: string;
  isCompleted: boolean;
  quiz?: Quiz;
}

export interface Quiz {
  id: string;
  questions: Question[];
  passingScore: number;
}

export interface Question {
  id: string;
  text: string;
  options: string[];
  correctAnswer: number;
}

export interface QuizResult {
  passed: boolean;
  score: number;
  totalQuestions: number;
  correctAnswers: number;
}

export interface Certificate {
  id: string;
  courseId: string;
  userId: string;
  url: string;
  issuedAt: string;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  interval: 'month' | 'year';
  features: string[];
  isPopular: boolean;
  role: UserRole;
}

export interface Transaction {
  id: string;
  userId: string;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  type: 'subscription' | 'course' | 'trial' | 'investment' | 'marketplace';
  description: string;
  createdAt: string;
}

export interface PaymentMethod {
  id: string;
  last4: string;
  brand: string;
  expiry: string;
  isDefault: boolean;
}

export interface Document {
  id: string;
  name: string;
  type: string;
  url: string;
  uploadedAt: string;
}

export interface Notification {
  id: string;
  type: 'match' | 'message' | 'system' | 'training' | 'payment' | 'marketplace' | 'investment' | 'follow';
  title: string;
  message: string;
  data: any;
  is_read: boolean;
  read_at: string | null;
  action_url: string | null;
  action_label: string | null;
  created_at: string;
}

export interface Conversation {
  id: string;
  participants: User[];
  match_id?: string;
  last_message: Message | null;
  unread_count: number;
  last_message_at: string;
  created_at: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender: User;
  sender_name: string;
  content: string;
  attachment_url?: string;
  attachment_type?: string;
  is_read: boolean;
  read_at: string | null;
  status: 'sent' | 'delivered' | 'read';
  created_at: string;
}

export interface NotificationPreferences {
  email_match: boolean;
  email_message: boolean;
  email_system: boolean;
  email_training: boolean;
  email_payment: boolean;
  email_marketplace: boolean;
  push_match: boolean;
  push_message: boolean;
  push_system: boolean;
  push_training: boolean;
  push_payment: boolean;
  push_marketplace: boolean;
  inapp_match: boolean;
  inapp_message: boolean;
  inapp_system: boolean;
  inapp_training: boolean;
  inapp_payment: boolean;
  inapp_marketplace: boolean;
}

export interface PushDevice {
  id: string;
  platform: 'ios' | 'android' | 'web';
  device_token: string;
  device_name: string;
  is_active: boolean;
  last_active: string;
  created_at: string;
}

export interface ImpactMetric {
  id: string;
  title: string;
  value: string;
  change: number;
  icon: string;
  color: string;
}

// Marketplace Types
export interface MarketplaceResource {
  id: string;
  title: string;
  description: string;
  resource_type: string;
  price: number;
  currency: string;
  country: string;
  region?: string;
  seller: User;
  seller_name: string;
  seller_email: string;
  contact_phone?: string;
  contact_website?: string;
  image?: string;
  attachments?: string[];
  requirements?: string;
  benefits?: string;
  valid_from: string;
  valid_until?: string;
  status: 'draft' | 'published' | 'expired' | 'archived';
  views: number;
  saves: number;
  is_saved?: boolean;
  created_at: string;
  updated_at: string;
}

export interface TradeRequest {
  id: string;
  resource: string;
  resource_title: string;
  buyer: User;
  buyer_name: string;
  buyer_email: string;
  message: string;
  quantity: number;
  proposed_price?: number;
  status: 'pending' | 'accepted' | 'rejected' | 'completed';
  buyer_notes?: string;
  seller_response?: string;
  created_at: string;
  updated_at: string;
}

export interface MarketplaceCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  order: number;
  is_active: boolean;
}

export interface ResourceFilter {
  type?: string;
  country?: string;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
}