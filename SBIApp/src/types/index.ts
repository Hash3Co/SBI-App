export type UserRole = 'sme' | 'investor';

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
  type: 'subscription' | 'course';
  description: string;
  createdAt: string;
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
  userId: string;
  title: string;
  message: string;
  type: 'match' | 'message' | 'system' | 'training';
  isRead: boolean;
  data?: any;
  createdAt: string;
}

export interface ImpactMetric {
  id: string;
  title: string;
  value: string;
  change: number;
  icon: string;
  color: string;
}

export interface MarketplaceResource {
  id: string;
  title: string;
  type: string;
  country: string;
  price: number;
  seller: string;
  description: string;
}

