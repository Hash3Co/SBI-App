// QuizScreen.tsx
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Animated } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS, SHADOWS } from '../../constants/theme';
import { useTraining } from '../../context/TrainingContext';
import { showToast } from '../../components/Toast';

export const QuizScreen = ({ route, navigation }: any) => {
  const { courseId, chapterId } = route.params;
  const { submitQuiz } = useTraining();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [fadeAnim] = useState(new Animated.Value(0));
  const progressAnim = useState(new Animated.Value(0))[0];

  const questions = [
    { id: '1', text: 'What is the primary purpose of a business plan?', options: ['To secure funding', 'To guide operations', 'To attract partners', 'All of the above'], correct: 3 },
    { id: '2', text: 'Which financial statement shows profitability?', options: ['Balance Sheet', 'Income Statement', 'Cash Flow Statement', 'All of these'], correct: 1 },
    { id: '3', text: 'What is the typical first step in pitching to investors?', options: ['Sending an email', 'Cold calling', 'Building a network', 'Creating a pitch deck'], correct: 2 },
    { id: '4', text: 'What does ROI stand for?', options: ['Return on Investment', 'Rate of Interest', 'Risk of Inflation', 'Revenue on Income'], correct: 0 },
  ];

  React.useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
    Animated.timing(progressAnim, {
      toValue: (currentQuestion + 1) / questions.length,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [currentQuestion]);

  const handleAnswer = (answerIndex: number) => {
    setSelectedOption(answerIndex);
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = answerIndex;
    setAnswers(newAnswers);
    
    if (currentQuestion < questions.length - 1) {
      setTimeout(() => {
        setCurrentQuestion(currentQuestion + 1);
        setSelectedOption(null);
      }, 600);
    } else {
      handleSubmit(newAnswers);
    }
  };

  const handleSubmit = async (finalAnswers: number[]) => {
    const result = await submitQuiz(courseId, chapterId, finalAnswers);
    setScore(result.score);
    setSubmitted(true);
    if (result.passed) {
      showToast(`🎉 Quiz passed! Score: ${result.score}%`, 'success');
    } else {
      showToast(`Quiz failed. Score: ${result.score}%`, 'error');
    }
  };

  if (submitted) {
    const passed = score >= 70;
    return (
      <View style={styles.container}>
        <LinearGradient 
          colors={passed ? ['#10b981', '#059669'] : ['#ef4444', '#dc2626']} 
          style={styles.resultHeader}
        >
          <Icon name={passed ? 'celebration' : 'sentiment-dissatisfied'} size={60} color={COLORS.white} />
          <Text style={styles.resultTitle}>{passed ? 'Congratulations!' : 'Keep Learning!'}</Text>
          <Text style={styles.resultSubtitle}>{passed ? 'You passed the quiz!' : 'Don\'t give up!'}</Text>
        </LinearGradient>
        
        <View style={styles.resultCard}>
          <Text style={styles.scoreValue}>{score}%</Text>
          <Text style={styles.scoreLabel}>{passed ? 'Passed!' : 'Failed'}</Text>
          <View style={styles.resultBar}>
            <View style={[styles.resultProgress, { width: `${score}%`, backgroundColor: passed ? '#10b981' : '#ef4444' }]} />
          </View>
          <Text style={styles.scoreMessage}>
            {passed ? 'Great job! You can proceed to the next chapter.' : 'Please review the chapter and try again.'}
          </Text>
          <View style={styles.resultStats}>
            <View style={styles.resultStat}>
              <Text style={styles.resultStatValue}>{questions.length}</Text>
              <Text style={styles.resultStatLabel}>Questions</Text>
            </View>
            <View style={styles.resultDivider} />
            <View style={styles.resultStat}>
              <Text style={styles.resultStatValue}>{Math.round(questions.length * score / 100)}</Text>
              <Text style={styles.resultStatLabel}>Correct</Text>
            </View>
            <View style={styles.resultDivider} />
            <View style={styles.resultStat}>
              <Text style={styles.resultStatValue}>{Math.round(questions.length * (100 - score) / 100)}</Text>
              <Text style={styles.resultStatLabel}>Incorrect</Text>
            </View>
          </View>
        </View>

        <TouchableOpacity style={styles.doneButton} onPress={() => navigation.goBack()}>
          <LinearGradient colors={['#6366f1', '#4f46e5']} style={styles.doneGradient}>
            <Text style={styles.doneButtonText}>Done</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    );
  }

  const question = questions[currentQuestion];
  return (
    <View style={styles.container}>
      <LinearGradient 
        colors={['#6366f1', '#4f46e5', '#4338ca']} 
        style={styles.header}
        start={{x: 0, y: 0}}
        end={{x: 1, y: 0}}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Icon name="arrow-back" size={24} color={COLORS.white} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Quiz</Text>
          <Text style={styles.questionCounter}>{currentQuestion + 1}/{questions.length}</Text>
        </View>
        <View style={styles.progressContainer}>
          <Animated.View style={[styles.progressBar, { width: progressAnim.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }) }]} />
        </View>
      </LinearGradient>

      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        <View style={styles.questionCard}>
          <Text style={styles.questionNumber}>Question {currentQuestion + 1}</Text>
          <Text style={styles.questionText}>{question.text}</Text>
        </View>

        <View style={styles.optionsContainer}>
          {question.options.map((option, index) => (
            <TouchableOpacity 
              key={index} 
              style={[
                styles.optionButton,
                selectedOption === index && styles.optionButtonSelected,
                selectedOption !== null && selectedOption === index && question.correct === index && styles.optionButtonCorrect,
                selectedOption !== null && selectedOption === index && question.correct !== index && styles.optionButtonWrong,
              ]} 
              onPress={() => handleAnswer(index)}
              disabled={selectedOption !== null}
              activeOpacity={0.7}
            >
              <View style={[
                styles.optionCircle,
                selectedOption === index && styles.optionCircleSelected,
                selectedOption !== null && selectedOption === index && question.correct === index && styles.optionCircleCorrect,
                selectedOption !== null && selectedOption === index && question.correct !== index && styles.optionCircleWrong,
              ]}>
                <Text style={[
                  styles.optionLetter,
                  selectedOption === index && styles.optionLetterSelected,
                ]}>{String.fromCharCode(65 + index)}</Text>
              </View>
              <Text style={[
                styles.optionText,
                selectedOption === index && styles.optionTextSelected,
                selectedOption !== null && selectedOption === index && question.correct === index && styles.optionTextCorrect,
                selectedOption !== null && selectedOption === index && question.correct !== index && styles.optionTextWrong,
              ]}>{option}</Text>
              {selectedOption !== null && selectedOption === index && (
                <Icon 
                  name={question.correct === index ? 'check-circle' : 'cancel'} 
                  size={20} 
                  color={question.correct === index ? '#10b981' : '#ef4444'} 
                />
              )}
            </TouchableOpacity>
          ))}
        </View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: { 
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.xxxl,
    paddingBottom: SPACING.lg,
    borderBottomLeftRadius: BORDER_RADIUS.xxl,
    borderBottomRightRadius: BORDER_RADIUS.xxl,
  },
  headerContent: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  backButton: { padding: SPACING.sm },
  headerTitle: { 
    fontSize: TYPOGRAPHY.sizes.xl, 
    fontWeight: 'bold', 
    color: COLORS.white 
  },
  questionCounter: { 
    fontSize: TYPOGRAPHY.sizes.md, 
    color: COLORS.white,
    fontWeight: '500',
  },
  progressContainer: {
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: BORDER_RADIUS.round,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.round,
  },
  content: { flex: 1, padding: SPACING.xl },
  questionCard: {
    marginBottom: SPACING.xl,
  },
  questionNumber: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: '#94a3b8',
    fontWeight: '500',
    marginBottom: SPACING.sm,
  },
  questionText: { 
    fontSize: TYPOGRAPHY.sizes.xl, 
    fontWeight: 'bold', 
    color: '#1e293b',
    lineHeight: 32,
  },
  optionsContainer: {
    flex: 1,
  },
  optionButton: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: COLORS.white, 
    borderRadius: BORDER_RADIUS.lg, 
    padding: SPACING.md, 
    marginBottom: SPACING.md, 
    ...SHADOWS.sm,
  },
  optionButtonSelected: {
    borderWidth: 2,
    borderColor: '#6366f1',
  },
  optionButtonCorrect: {
    borderWidth: 2,
    borderColor: '#10b981',
    backgroundColor: '#10b981' + '05',
  },
  optionButtonWrong: {
    borderWidth: 2,
    borderColor: '#ef4444',
    backgroundColor: '#ef4444' + '05',
  },
  optionCircle: { 
    width: 36, 
    height: 36, 
    borderRadius: 18, 
    backgroundColor: '#f1f5f9', 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginRight: SPACING.md 
  },
  optionCircleSelected: {
    backgroundColor: '#6366f1',
  },
  optionCircleCorrect: {
    backgroundColor: '#10b981',
  },
  optionCircleWrong: {
    backgroundColor: '#ef4444',
  },
  optionLetter: { 
    fontSize: TYPOGRAPHY.sizes.md, 
    fontWeight: 'bold', 
    color: '#64748b' 
  },
  optionLetterSelected: {
    color: COLORS.white,
  },
  optionText: { 
    fontSize: TYPOGRAPHY.sizes.md, 
    color: '#1e293b',
    flex: 1,
  },
  optionTextSelected: {
    color: '#6366f1',
    fontWeight: '500',
  },
  optionTextCorrect: {
    color: '#10b981',
    fontWeight: '500',
  },
  optionTextWrong: {
    color: '#ef4444',
    fontWeight: '500',
  },
  resultHeader: {
    alignItems: 'center',
    padding: SPACING.xxxl,
    paddingTop: SPACING.xxxl,
    borderBottomLeftRadius: BORDER_RADIUS.xxl,
    borderBottomRightRadius: BORDER_RADIUS.xxl,
  },
  resultTitle: { 
    fontSize: TYPOGRAPHY.sizes.xxl, 
    fontWeight: 'bold', 
    color: COLORS.white,
    marginTop: SPACING.md,
  },
  resultSubtitle: {
    fontSize: TYPOGRAPHY.sizes.md,
    color: 'rgba(255,255,255,0.9)',
    marginTop: SPACING.xs,
  },
  resultCard: { 
    backgroundColor: COLORS.white, 
    margin: SPACING.xl, 
    padding: SPACING.xl, 
    borderRadius: BORDER_RADIUS.xl, 
    alignItems: 'center', 
    ...SHADOWS.lg,
    marginTop: -SPACING.lg,
  },
  scoreValue: { 
    fontSize: 72, 
    fontWeight: 'bold', 
    color: '#1e293b' 
  },
  scoreLabel: { 
    fontSize: TYPOGRAPHY.sizes.xl, 
    fontWeight: 'bold', 
    color: '#64748b',
    marginTop: 4,
  },
  resultBar: {
    width: '100%',
    height: 8,
    backgroundColor: '#f1f5f9',
    borderRadius: BORDER_RADIUS.round,
    overflow: 'hidden',
    marginVertical: SPACING.md,
  },
  resultProgress: {
    height: '100%',
    borderRadius: BORDER_RADIUS.round,
  },
  scoreMessage: { 
    fontSize: TYPOGRAPHY.sizes.md, 
    color: '#64748b', 
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  resultStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  resultStat: { alignItems: 'center' },
  resultStatValue: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  resultStatLabel: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: '#94a3b8',
    marginTop: 2,
  },
  resultDivider: {
    width: 1,
    height: 30,
    backgroundColor: '#f1f5f9',
  },
  doneButton: { 
    marginHorizontal: SPACING.xl, 
    marginBottom: SPACING.xxxl,
    ...SHADOWS.md,
  },
  doneGradient: {
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    alignItems: 'center',
  },
  doneButtonText: { 
    color: COLORS.white, 
    fontSize: TYPOGRAPHY.sizes.md, 
    fontWeight: 'bold' 
  },
});