import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../src/context/ThemeContext';
import { useUser } from '../../src/context/UserContext';
import { saveGameScore } from '../../src/db/database'; 
import { useLanguage } from '../../src/context/LanguageContext';
import GameInfoModal from '../../src/components/GameInfoModal';

interface Question {
  text: string;
  correctAnswer: number;
  options: number[];
}

export default function MathQuizScreen() {
  const router = useRouter();
  const { theme, accentColor } = useTheme();
  const { username } = useUser();
  const { t } = useLanguage();

  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard' | null>(null);
  const [correctAnswers, setCorrectAnswers] = useState(0); 
  const [questionCount, setQuestionCount] = useState(1);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  
  const [totalTime, setTotalTime] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  
  const TOTAL_QUESTIONS = 10;

  useEffect(() => {
    let interval: any;
    if (isActive) {
      interval = setInterval(() => {
        setTotalTime((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isActive]);

  const generateQuestion = (level: 'easy' | 'medium' | 'hard'): Question => {
    let num1: number = 0;
    let num2: number = 0;
    let operator: string = '+';
    let answer: number = 0;
    
    if (level === 'easy') {
      num1 = Math.floor(Math.random() * 20) + 1;
      num2 = Math.floor(Math.random() * 20) + 1;
      operator = Math.random() > 0.5 ? '+' : '-';
    } else if (level === 'medium') {
      if (Math.random() > 0.6) {
        operator = '*';
        num1 = Math.floor(Math.random() * 10) + 1;
        num2 = Math.floor(Math.random() * 10) + 1;
      } else {
        operator = Math.random() > 0.5 ? '+' : '-';
        num1 = Math.floor(Math.random() * 50) + 1;
        num2 = Math.floor(Math.random() * 50) + 1;
      }
    } else {
      if (Math.random() > 0.5) {
        operator = '*';
        num1 = Math.floor(Math.random() * 15) + 2;
        num2 = Math.floor(Math.random() * 15) + 2;
      } else {
        operator = Math.random() > 0.5 ? '+' : '-';
        num1 = Math.floor(Math.random() * 100) + 10;
        num2 = Math.floor(Math.random() * 100) + 10;
      }
    }

    if (operator === '+') answer = num1 + num2;
    else if (operator === '-') answer = num1 - num2;
    else answer = num1 * num2;

    const options = new Set<number>();
    options.add(answer);
    while (options.size < 4) {
      const offset = Math.floor(Math.random() * 10) - 5; 
      const wrong = answer + offset; 
      if (wrong !== answer) options.add(wrong);
    }

    return {
      text: `${num1} ${operator} ${num2} = ?`,
      correctAnswer: answer,
      options: Array.from(options).sort(() => Math.random() - 0.5),
    };
  };

  const startGame = (level: 'easy' | 'medium' | 'hard') => {
    setDifficulty(level);
    setCorrectAnswers(0);
    setQuestionCount(1);
    setCurrentQuestion(generateQuestion(level));
    setTotalTime(0);
    setIsActive(true);
  };

  const handleAnswer = (selected: number) => {
    if (selected === currentQuestion?.correctAnswer) {
      setCorrectAnswers(prev => prev + 1);
    }

    if (questionCount < TOTAL_QUESTIONS) {
        setQuestionCount(prev => prev + 1);
        setCurrentQuestion(generateQuestion(difficulty!));
    } else {
        setIsActive(false);
        finishGame();
    }
  };

  const finishGame = async () => {
    const accuracyPoints = correctAnswers * 50;
    const timePenalty = totalTime;
    const finalScore = Math.max(0, accuracyPoints - timePenalty);

    if (username) {
      await saveGameScore(username, 'Matematika', finalScore); 
    }

    Alert.alert(
      t('game_over'), 
      `${t('correct')}: ${correctAnswers}/${TOTAL_QUESTIONS}\n${t('time')}: ${totalTime}s\n\n${t('points').toUpperCase()}: ${finalScore}`,
      [
        { text: t('menu'), onPress: () => setDifficulty(null) },
        { text: t('play_again'), onPress: () => startGame(difficulty!) }
      ]
    );
  };

  if (!difficulty) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={styles.header}>
           <TouchableOpacity onPress={() => router.back()} style={[styles.backButton, { backgroundColor: theme.card }]}>
             <Ionicons name="arrow-back" size={24} color={theme.text} />
           </TouchableOpacity>
           <Text style={[styles.title, { color: theme.text }]}>{t('new_game')}</Text>
           
           <TouchableOpacity onPress={() => setModalVisible(true)} style={[styles.backButton, { backgroundColor: theme.card }]}>
             <Ionicons name="information-circle-outline" size={24} color={accentColor} />
           </TouchableOpacity>
        </View>

        <View style={styles.selectionContent}>
          <Ionicons name="calculator-outline" size={80} color={accentColor} style={{ marginBottom: 20 }} />
          <Text style={[styles.selectTitle, { color: theme.text }]}>{t('game_math')}</Text>
          <Text style={[styles.selectSubtitle, { color: theme.textSecondary }]}>{t('desc_math')}</Text>
          
          <TouchableOpacity style={[styles.difficultyButton, { backgroundColor: '#4CAF50' }]} onPress={() => startGame('easy')}>
            <Text style={styles.difficultyText}>{t('easy')}</Text>
            <Text style={styles.difficultySubText}>{t('difficulty')}: 1</Text> 
          </TouchableOpacity>

          <TouchableOpacity style={[styles.difficultyButton, { backgroundColor: '#FF9800' }]} onPress={() => startGame('medium')}>
            <Text style={styles.difficultyText}>{t('medium')}</Text>
            <Text style={styles.difficultySubText}>{t('difficulty')}: 2</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.difficultyButton, { backgroundColor: '#F44336' }]} onPress={() => startGame('hard')}>
            <Text style={styles.difficultyText}>{t('hard')}</Text>
            <Text style={styles.difficultySubText}>{t('difficulty')}: 3</Text>
          </TouchableOpacity>
        </View>

        <GameInfoModal 
          visible={modalVisible} 
          onClose={() => setModalVisible(false)}
          gameKey="mathquiz"
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => { setIsActive(false); setDifficulty(null); }} style={[styles.backButton, { backgroundColor: theme.card }]}>
          <Ionicons name="close" size={24} color={theme.text} />
        </TouchableOpacity>
        
        <View style={{alignItems: 'center'}}>
            <Text style={[styles.subTitle, { color: theme.textSecondary }]}>{t('game_math').toUpperCase()} {questionCount}/{TOTAL_QUESTIONS}</Text>
            <Text style={[styles.scoreText, { color: accentColor }]}>{t('correct')}: {correctAnswers}</Text>
        </View>

        <View style={[styles.timerBadge, { backgroundColor: theme.card, borderColor: accentColor }]}>
            <Text style={{color: theme.text, fontWeight: 'bold', fontSize: 18}}>{totalTime}s</Text>
        </View>
      </View>

      <View style={styles.quizContent}>
        <View style={[styles.questionContainer, { backgroundColor: theme.card }]}>
            <Text style={[styles.questionText, { color: theme.text }]}>{currentQuestion?.text}</Text>
        </View>

        <View style={styles.answersContainer}>
            {currentQuestion?.options.map((option, index) => (
                <TouchableOpacity 
                    key={index}
                    style={[styles.answerButton, { borderColor: accentColor, backgroundColor: theme.card }]}
                    onPress={() => handleAnswer(option)}
                    activeOpacity={0.7}
                >
                    <Text style={[styles.answerText, { color: theme.text }]}>{option}</Text>
                </TouchableOpacity>
            ))}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingBottom: 10
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  title: { fontSize: 18, fontWeight: 'bold' },
  subTitle: { fontSize: 12, textTransform: 'uppercase', letterSpacing: 1 },
  scoreText: { fontSize: 18, fontWeight: '900' }, 
  timerBadge: {
    width: 70, 
    height: 50,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    elevation: 2,
  },
  selectionContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  selectTitle: { fontSize: 28, fontWeight: 'bold', marginBottom: 5 },
  selectSubtitle: { fontSize: 16, marginBottom: 40 },
  difficultyButton: {
    width: '100%',
    padding: 20,
    borderRadius: 16,
    marginBottom: 15,
    alignItems: 'center',
    elevation: 3,
  },
  difficultyText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
    textTransform: 'uppercase'
  },
  difficultySubText: { color: 'rgba(255,255,255,0.8)', fontSize: 14 },
  quizContent: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  questionContainer: {
    paddingVertical: 50,
    paddingHorizontal: 20,
    borderRadius: 24,
    alignItems: 'center',
    marginBottom: 40,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  questionText: {
    fontSize: 48,
    fontWeight: 'bold',
  },
  answersContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 15,
  },
  answerButton: {
    width: '47%', 
    paddingVertical: 25,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
    elevation: 2,
  },
  answerText: {
    fontSize: 24,
    fontWeight: 'bold',
  }
});