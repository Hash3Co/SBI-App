// src/services/trainingService.ts
import { apiClient } from './api/client';
import { Course, QuizResult, Certificate } from '../types';
import { API_ENDPOINTS } from '../config/api';

export interface QuizSubmission {
  chapterId: string;
  answers: number[];
}

export interface TrainingProgress {
  courseId: string;
  progress: number;
  completedChapters: string[];
  totalChapters: number;
}

class TrainingService {
  async getCourses(): Promise<Course[]> {
    const response = await apiClient.get<Course[]>(API_ENDPOINTS.training.courses);
    return response.data;
  }

  async getEnrolledCourses(): Promise<Course[]> {
    const response = await apiClient.get<Course[]>(`${API_ENDPOINTS.training.courses}enrolled/`);
    return response.data;
  }

  async getRecommendedCourses(): Promise<Course[]> {
    const response = await apiClient.get<Course[]>(`${API_ENDPOINTS.training.courses}recommended/`);
    return response.data;
  }

  async getCourseDetail(courseId: string): Promise<Course> {
    const response = await apiClient.get<Course>(API_ENDPOINTS.training.courseDetail(courseId));
    return response.data;
  }

  async enrollInCourse(courseId: string): Promise<void> {
    await apiClient.post(API_ENDPOINTS.training.enroll, { course_id: courseId });
  }

  async getProgress(courseId: string): Promise<TrainingProgress> {
    const response = await apiClient.get<TrainingProgress>(`${API_ENDPOINTS.training.progress}?course_id=${courseId}`);
    return response.data;
  }

  async completeChapter(courseId: string, chapterId: string): Promise<void> {
    await apiClient.post(API_ENDPOINTS.training.completeChapter, {
      course_id: courseId,
      chapter_id: chapterId,
    });
  }

  async submitQuiz(courseId: string, submission: QuizSubmission): Promise<QuizResult> {
    const response = await apiClient.post<QuizResult>(API_ENDPOINTS.training.submitQuiz, {
      course_id: courseId,
      chapter_id: submission.chapterId,
      answers: submission.answers,
    });
    return response.data;
  }

  async getCertificate(courseId: string): Promise<Certificate> {
    const response = await apiClient.get<Certificate>(API_ENDPOINTS.training.certificate(courseId));
    return response.data;
  }

  async getCourseCategories(): Promise<string[]> {
    const response = await apiClient.get<string[]>(`${API_ENDPOINTS.training.courses}categories/`);
    return response.data;
  }
}

export default new TrainingService();