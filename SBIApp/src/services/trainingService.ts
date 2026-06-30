import { apiClient } from './api/client';
import { Course, Quiz } from '../types';
import { API_ENDPOINTS } from '../config/api';

export interface QuizSubmission {
  chapterId: string;
  answers: number[];
}

class TrainingService {
  async getCourses(): Promise<Course[]> {
    const response = await apiClient.get<Course[]>(API_ENDPOINTS.training.courses);
    return response.data;
  }

  async getCourseDetail(courseId: string): Promise<Course> {
    const response = await apiClient.get<Course>(API_ENDPOINTS.training.courseDetail(courseId));
    return response.data;
  }

  async enrollInCourse(courseId: string): Promise<void> {
    await apiClient.post(API_ENDPOINTS.training.enroll, { course_id: courseId });
  }

  async getProgress(courseId: string): Promise<{ progress: number; completedChapters: string[] }> {
    const response = await apiClient.get(`${API_ENDPOINTS.training.progress}?course_id=${courseId}`);
    return response.data;
  }

  async completeChapter(courseId: string, chapterId: string): Promise<void> {
    await apiClient.post(API_ENDPOINTS.training.completeChapter, {
      course_id: courseId,
      chapter_id: chapterId,
    });
  }

  async submitQuiz(courseId: string, submission: QuizSubmission): Promise<{ passed: boolean; score: number }> {
    const response = await apiClient.post(API_ENDPOINTS.training.submitQuiz, {
      course_id: courseId,
      chapter_id: submission.chapterId,
      answers: submission.answers,
    });
    return response.data;
  }

  async getCertificate(courseId: string): Promise<{ url: string }> {
    const response = await apiClient.get(API_ENDPOINTS.training.certificate(courseId));
    return response.data;
  }
}

export default new TrainingService();