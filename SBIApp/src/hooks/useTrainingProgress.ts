import { useState, useEffect } from 'react';
import { useTraining } from '../context/TrainingContext';
import { Course } from '../types';

export const useTrainingProgress = (courseId: string) => {
  const { courses, enrolledCourses, updateProgress } = useTraining();
  const [course, setCourse] = useState<Course | null>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const found = enrolledCourses.find(c => c.id === courseId) || courses.find(c => c.id === courseId);
    if (found) {
      setCourse(found);
      setProgress(found.progress);
    }
  }, [courseId, courses, enrolledCourses]);

  const completeChapter = async (chapterId: string) => {
    await updateProgress(courseId, chapterId, true);
  };

  return { course, progress, completeChapter };
};