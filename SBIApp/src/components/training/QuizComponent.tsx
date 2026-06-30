import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS } from '../../constants/theme';

interface Question {
  id: string;
  text: string;
  options: string[];
  correctAnswer: number;
}

interface QuizComponentProps {
  questions: Question[];
  onComplete: (results: { passed: boolean; score: number; answers: number[] }) => void;
}

export const QuizComponent: React.FC<QuizComponentProps> = ({ questions, onComplete }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [submitted, setSubmitted] = useState(false);

  const currentQuestion = questions[currentIndex];
  const isLast = currentIndex === questions.length - 1;

  const handleAnswer = (answerIndex: number) => {
    const newAnswers = [...answers];
    newAnswers[currentIndex] = answerIndex;
    setAnswers(newAnswers);
  };

  const handleNext = () => {
    if (answers[currentIndex] === undefined) return;
    if (isLast) {
      submitQuiz();
    } else {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const submitQuiz = () => {
    let correctCount = 0;
    answers.forEach((answer, idx) => {
      if (answer === questions[idx].correctAnswer) correctCount++;
    });
    const score = (correctCount / questions.length) * 100;
    const passed = score >= 70;
    setSubmitted(true);
    onComplete({ passed, score, answers });
  };

  if (submitted) return null;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.progress}>Question {currentIndex + 1} of {questions.length}</Text>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${((currentIndex + 1) / questions.length) * 100}%` }]} />
        </View>
      </View>

      <Text style={styles.question}>{currentQuestion.text}</Text>

      <View style={styles.options}>
        {currentQuestion.options.map((option, idx) => (
          <TouchableOpacity
            key={idx}
            style={[styles.option, answers[currentIndex] === idx && styles.optionSelected]}
            onPress={() => handleAnswer(idx)}
          >
            <View style={[styles.optionCircle, answers[currentIndex] === idx && styles.optionCircleSelected]}>
              <Text style={[styles.optionLetter, answers[currentIndex] === idx && styles.optionLetterSelected]}>
                {String.fromCharCode(65 + idx)}
              </Text>
            </View>
            <Text style={[styles.optionText, answers[currentIndex] === idx && styles.optionTextSelected]}>{option}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity
        style={[styles.nextButton, answers[currentIndex] === undefined && styles.nextButtonDisabled]}
        onPress={handleNext}
        disabled={answers[currentIndex] === undefined}
      >
        <Text style={styles.nextButtonText}>{isLast ? 'Submit' : 'Next'}</Text>
        <Icon name={isLast ? 'check' : 'arrow-forward'} size={20} color={COLORS.white} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { padding: SPACING.lg },
  header: { marginBottom: SPACING.lg },
  progress: { fontSize: TYPOGRAPHY.sizes.sm, color: COLORS.gray500, marginBottom: SPACING.xs },
  progressBar: { height: 4, backgroundColor: COLORS.gray200, borderRadius: BORDER_RADIUS.round, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: COLORS.primary, borderRadius: BORDER_RADIUS.round },
  question: { fontSize: TYPOGRAPHY.sizes.lg, fontWeight: 'bold', color: COLORS.gray800, marginBottom: SPACING.xl, lineHeight: 28 },
  options: { gap: SPACING.md, marginBottom: SPACING.xl },
  option: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md, padding: SPACING.md, backgroundColor: COLORS.gray50, borderRadius: BORDER_RADIUS.lg, borderWidth: 1, borderColor: COLORS.gray200 },
  optionSelected: { backgroundColor: COLORS.primary + '10', borderColor: COLORS.primary },
  optionCircle: { width: 32, height: 32, borderRadius: 16, backgroundColor: COLORS.white, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: COLORS.gray300 },
  optionCircleSelected: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  optionLetter: { fontSize: TYPOGRAPHY.sizes.md, fontWeight: 'bold', color: COLORS.gray600 },
  optionLetterSelected: { color: COLORS.white },
  optionText: { flex: 1, fontSize: TYPOGRAPHY.sizes.md, color: COLORS.gray700 },
  optionTextSelected: { color: COLORS.primary, fontWeight: '500' },
  nextButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: SPACING.sm, backgroundColor: COLORS.primary, paddingVertical: SPACING.md, borderRadius: BORDER_RADIUS.lg },
  nextButtonDisabled: { opacity: 0.5 },
  nextButtonText: { color: COLORS.white, fontSize: TYPOGRAPHY.sizes.md, fontWeight: 'bold' },
});