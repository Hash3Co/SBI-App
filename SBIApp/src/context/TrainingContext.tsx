import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Course } from '../types';
import trainingService from '../services/trainingService';

interface TrainingContextType {
  courses: Course[];
  enrolledCourses: Course[];
  isLoading: boolean;
  fetchCourses: () => Promise<void>;
  enrollInCourse: (courseId: string) => Promise<void>;
  updateProgress: (courseId: string, chapterId: string, isCompleted: boolean) => Promise<void>;
  submitQuiz: (courseId: string, chapterId: string, answers: number[]) => Promise<{ passed: boolean; score: number }>;
  getCertificate: (courseId: string) => Promise<string>;
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
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchCourses();
    loadEnrolledCourses();
  }, []);

  const fetchCourses = async () => {
    setIsLoading(true);
    try {
      const fetchedCourses = await trainingService.getCourses();
      setCourses(fetchedCourses);
    } catch (error) {
      console.error('Failed to load courses:', error);
      setCourses([]);
    } finally {
      setIsLoading(false);
    }
  };

  const loadEnrolledCourses = async () => {
    try {
      const saved = await AsyncStorage.getItem('enrolledCourses');
      if (saved) {
        const enrolledIds = JSON.parse(saved);
        if (Array.isArray(enrolledIds) && enrolledIds.length > 0) {
          const enrolled = courses.filter(c => enrolledIds.includes(c.id));
          setEnrolledCourses(enrolled);
        }
      }
    } catch (error) {
      console.error('Failed to load enrolled courses:', error);
      setEnrolledCourses([]);
    }
  };

  const enrollInCourse = async (courseId: string) => {
    if (!courseId) throw new Error('Course ID required');
    
    setIsLoading(true);
    try {
      await trainingService.enrollInCourse(courseId);
      
      const course = courses.find(c => c.id === courseId);
      if (course) {
        const updatedCourse = { ...course, isEnrolled: true };
        const newEnrolled = [...enrolledCourses, updatedCourse];
        setEnrolledCourses(newEnrolled);
        await AsyncStorage.setItem('enrolledCourses', JSON.stringify(newEnrolled.map(c => c.id)));
      }
    } catch (error) {
      console.error('Enrollment failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const updateProgress = async (courseId: string, chapterId: string, isCompleted: boolean) => {
    if (!courseId || !chapterId) throw new Error('Course ID and Chapter ID required');
    
    try {
      await trainingService.completeChapter(courseId, chapterId);
      
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
      await AsyncStorage.setItem(`course_progress_${courseId}`, JSON.stringify({
        completedChapters: updatedCourses.find(c => c.id === courseId)?.completedChapters,
        progress: updatedCourses.find(c => c.id === courseId)?.progress,
      }));
    } catch (error) {
      console.error('Failed to update progress:', error);
      throw error;
    }
  };

  const submitQuiz = async (courseId: string, chapterId: string, answers: number[]) => {
    if (!courseId || !chapterId || !answers.length) {
      throw new Error('Invalid quiz submission');
    }
    
    return await trainingService.submitQuiz(courseId, { chapterId, answers });
  };

  const getCertificate = async (courseId: string): Promise<string> => {
    if (!courseId) throw new Error('Course ID required');
    
    try {
      const response = await trainingService.getCertificate(courseId);
      return response.url;
    } catch (error) {
      console.error('Failed to get certificate:', error);
      throw error;
    }
  };

  return (
    <TrainingContext.Provider value={{ 
      courses, 
      enrolledCourses, 
      isLoading, 
      fetchCourses,
      enrollInCourse, 
      updateProgress, 
      submitQuiz, 
      getCertificate 
    }}>
      {children}
    </TrainingContext.Provider>
  );
};