// src/context/TrainingContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { trainingService } from '../services';
import { Course, QuizResult, Certificate } from '../types';
import { showToast } from '../components/Toast';

interface TrainingContextType {
  courses: Course[];
  enrolledCourses: Course[];
  recommendedCourses: Course[];
  isLoading: boolean;
  fetchCourses: () => Promise<void>;
  fetchEnrolledCourses: () => Promise<void>;
  fetchRecommendedCourses: () => Promise<void>;
  enrollInCourse: (courseId: string) => Promise<void>;
  updateProgress: (courseId: string, chapterId: string, isCompleted: boolean) => Promise<void>;
  submitQuiz: (courseId: string, chapterId: string, answers: number[]) => Promise<QuizResult>;
  getCertificate: (courseId: string) => Promise<Certificate>;
  getCourseDetail: (courseId: string) => Promise<Course>;
}

const TrainingContext = createContext<TrainingContextType | undefined>(undefined);

export const useTraining = () => {
  const context = useContext(TrainingContext);
  if (!context) throw new Error('useTraining must be used within TrainingProvider');
  return context;
};

export const TrainingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [enrolledCourses, setEnrolledCourses] = useState<Course[]>([]);
  const [recommendedCourses, setRecommendedCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadAllCourses();
  }, []);

  const loadAllCourses = async () => {
    setIsLoading(true);
    try {
      await Promise.all([
        fetchCourses(),
        fetchEnrolledCourses(),
        fetchRecommendedCourses(),
      ]);
    } catch (error) {
      console.error('Failed to load courses:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCourses = async () => {
    try {
      const data = await trainingService.getCourses();
      setCourses(data);
    } catch (error) {
      console.error('Failed to fetch courses:', error);
      setCourses([]);
      showToast('Failed to load courses', 'error');
    }
  };

  const fetchEnrolledCourses = async () => {
    try {
      const data = await trainingService.getEnrolledCourses();
      setEnrolledCourses(data);
    } catch (error) {
      console.error('Failed to fetch enrolled courses:', error);
      setEnrolledCourses([]);
    }
  };

  const fetchRecommendedCourses = async () => {
    try {
      const data = await trainingService.getRecommendedCourses();
      setRecommendedCourses(data);
    } catch (error) {
      console.error('Failed to fetch recommended courses:', error);
      setRecommendedCourses([]);
    }
  };

  const getCourseDetail = async (courseId: string): Promise<Course> => {
    return await trainingService.getCourseDetail(courseId);
  };

  const enrollInCourse = async (courseId: string) => {
    if (!courseId) throw new Error('Course ID required');
    
    setIsLoading(true);
    try {
      await trainingService.enrollInCourse(courseId);
      await Promise.all([fetchEnrolledCourses(), fetchCourses(), fetchRecommendedCourses()]);
      showToast('Successfully enrolled in course!', 'success');
    } catch (error) {
      console.error('Enrollment failed:', error);
      showToast('Failed to enroll in course', 'error');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const updateProgress = async (courseId: string, chapterId: string, isCompleted: boolean) => {
    if (!courseId || !chapterId) throw new Error('Course ID and Chapter ID required');
    
    try {
      await trainingService.completeChapter(courseId, chapterId);
      
      // Update local state
      const updatedCourses = enrolledCourses.map(course => {
        if (course.id === courseId) {
          const updatedChapters = course.chapters.map(chapter => {
            if (chapter.id === chapterId) return { ...chapter, isCompleted };
            return chapter;
          });
          const completedCount = updatedChapters.filter(c => c.isCompleted).length;
          const progress = course.totalChapters > 0 ? (completedCount / course.totalChapters) * 100 : 0;
          return { ...course, chapters: updatedChapters, completedChapters: completedCount, progress };
        }
        return course;
      });
      
      setEnrolledCourses(updatedCourses);
    } catch (error) {
      console.error('Failed to update progress:', error);
      showToast('Failed to update progress', 'error');
      throw error;
    }
  };

  const submitQuiz = async (courseId: string, chapterId: string, answers: number[]): Promise<QuizResult> => {
    if (!courseId || !chapterId || !answers.length) {
      throw new Error('Invalid quiz submission');
    }
    
    try {
      const result = await trainingService.submitQuiz(courseId, { chapterId, answers });
      if (result.passed) {
        showToast(`🎉 Quiz passed! Score: ${result.score}%`, 'success');
      } else {
        showToast(`Quiz failed. Score: ${result.score}%`, 'error');
      }
      return result;
    } catch (error) {
      console.error('Quiz submission failed:', error);
      showToast('Failed to submit quiz', 'error');
      throw error;
    }
  };

  const getCertificate = async (courseId: string): Promise<Certificate> => {
    return await trainingService.getCertificate(courseId);
  };

  return (
    <TrainingContext.Provider value={{ 
      courses, 
      enrolledCourses,
      recommendedCourses,
      isLoading, 
      fetchCourses,
      fetchEnrolledCourses,
      fetchRecommendedCourses,
      enrollInCourse, 
      updateProgress, 
      submitQuiz, 
      getCertificate,
      getCourseDetail,
    }}>
      {children}
    </TrainingContext.Provider>
  );
};