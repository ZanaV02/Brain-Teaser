import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../src/context/ThemeContext';
import { useUser } from '../../src/context/UserContext';
import { saveGameScore } from '../../src/db/database';
import { useLanguage } from '../../src/context/LanguageContext';
import GameInfoModal from '../../src/components/GameInfoModal';

export default function TicTacToeScreen() {
  const router = useRouter();
  const { theme, accentColor } = useTheme();
  const { username } = useUser();
  const { t } = useLanguage();

  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard' | null>(null);
  const [board, setBoard] = useState<(string | null)[]>(Array(9).fill(null));
  const [isHumanTurn, setIsHumanTurn] = useState(true); 
  const [gameActive, setGameActive] = useState(true);
  const [isComputerThinking, setIsComputerThinking] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

  const checkWinner = (squares: (string | null)[]) => {
    const lines = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8],
      [0, 3, 6], [1, 4, 7], [2, 5, 8],
      [0, 4, 8], [2, 4, 6]
    ];
    for (let i = 0; i < lines.length; i++) {
      const [a, b, c] = lines[i];
      if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
        return squares[a];
      }
    }
    return null;
  };

  const getEasyMove = (currentBoard: (string | null)[]) => {
    const emptyIndices = currentBoard.map((val, idx) => val === null ? idx : null).filter(val => val !== null) as number[];
    if (emptyIndices.length === 0) return null;
    const randomIndex = Math.floor(Math.random() * emptyIndices.length);
    return emptyIndices[randomIndex];
  };

  const getMediumMove = (currentBoard: (string | null)[]) => {
    for (let i = 0; i < currentBoard.length; i++) {
      if (currentBoard[i] === null) {
        const testBoard = [...currentBoard];
        testBoard[i] = 'O';
        if (checkWinner(testBoard) === 'O') return i;
      }
    }
    const chanceToBlock = Math.random() > 0.35; 
    if (chanceToBlock) {
      for (let i = 0; i < currentBoard.length; i++) {
        if (currentBoard[i] === null) {
          const testBoard = [...currentBoard];
          testBoard[i] = 'X';
          if (checkWinner(testBoard) === 'X') return i;
        }
      }
    }
    if (currentBoard[4] === null) return 4; 
    const corners = [0, 2, 6, 8].filter(i => currentBoard[i] === null);
    if (corners.length > 0) {
      return corners[Math.floor(Math.random() * corners.length)];
    }
    return getEasyMove(currentBoard);
  };

  const minimax = (tempBoard: (string | null)[], depth: number, isMaximizing: boolean): number => {
    const winner = checkWinner(tempBoard);
    if (winner === 'O') return 10 - depth;
    if (winner === 'X') return depth - 10;
    if (!tempBoard.includes(null)) return 0;

    if (isMaximizing) {
      let bestScore = -Infinity;
      for (let i = 0; i < 9; i++) {
        if (tempBoard[i] === null) {
          tempBoard[i] = 'O';
          const score = minimax(tempBoard, depth + 1, false);
          tempBoard[i] = null;
          bestScore = Math.max(score, bestScore);
        }
      }
      return bestScore;
    } else {
      let bestScore = Infinity;
      for (let i = 0; i < 9; i++) {
        if (tempBoard[i] === null) {
          tempBoard[i] = 'X';
          const score = minimax(tempBoard, depth + 1, true);
          tempBoard[i] = null;
          bestScore = Math.min(score, bestScore);
        }
      }
      return bestScore;
    }
  };

  const getHardMove = (currentBoard: (string | null)[]) => {
    let bestScore = -Infinity;
    let move = null;
    for (let i = 0; i < 9; i++) {
      if (currentBoard[i] === null) {
        currentBoard[i] = 'O';
        const score = minimax(currentBoard, 0, false);
        currentBoard[i] = null;
        if (score > bestScore) {
          bestScore = score;
          move = i;
        }
      }
    }
    return move;
  };

  const makeComputerMove = useCallback(() => {
    if (!gameActive || isHumanTurn) return;

    setTimeout(() => {
      let moveIndex: number | null = null;

      if (difficulty === 'easy') moveIndex = getEasyMove(board);
      else if (difficulty === 'medium') moveIndex = getMediumMove(board);
      else if (difficulty === 'hard') moveIndex = getHardMove(board);

      if (moveIndex !== null) {
        const newBoard = [...board];
        newBoard[moveIndex] = 'O';
        setBoard(newBoard);
        setIsComputerThinking(false);
        setIsHumanTurn(true);
        checkGameStatus(newBoard);
      }
    }, 600);
  }, [board, difficulty, gameActive, isHumanTurn]);

  useEffect(() => {
    if (!isHumanTurn && gameActive) {
      setIsComputerThinking(true);
      makeComputerMove();
    }
  }, [isHumanTurn, gameActive, makeComputerMove]);

  const checkGameStatus = async (currentBoard: (string | null)[]) => {
    const winner = checkWinner(currentBoard);
    
    if (winner) {
      setGameActive(false);
      
      if (winner === 'X' && username) {
        let score = 100;
        if (difficulty === 'medium') score = 200;
        if (difficulty === 'hard') score = 300;
        
        await saveGameScore(username, 'Iks-Oks', score);
      }

      Alert.alert(
        winner === 'X' ? t('won') : t('lost'),
        "", 
        [
          { text: t('menu'), onPress: () => setDifficulty(null) }, 
          { text: t('new_game'), onPress: resetGame }
        ]
      );
    } else if (!currentBoard.includes(null)) {
      setGameActive(false);
      Alert.alert(
        t('draw'), 
        "", 
        [
          { text: t('menu'), onPress: () => setDifficulty(null) },
          { text: t('new_game'), onPress: resetGame }
        ]
      );
    }
  };

  const handlePress = (index: number) => {
    if (board[index] || !gameActive || !isHumanTurn) return;

    const newBoard = [...board];
    newBoard[index] = 'X';
    setBoard(newBoard);
    setIsHumanTurn(false);
    checkGameStatus(newBoard);
  };

  const resetGame = () => {
    setBoard(Array(9).fill(null));
    setIsHumanTurn(true);
    setGameActive(true);
    setIsComputerThinking(false);
  };

  const changeDifficulty = () => {
    setDifficulty(null);
    resetGame();
  };

  const renderSquare = (index: number) => {
    const value = board[index];
    return (
      <TouchableOpacity
        style={[styles.square, { backgroundColor: theme.card, borderColor: theme.border }]}
        onPress={() => handlePress(index)}
        activeOpacity={0.7}
        disabled={value !== null || !isHumanTurn}
      >
        <Text style={[
          styles.squareText, 
          { color: value === 'X' ? accentColor : (value === 'O' ? '#FF5722' : theme.text) }
        ]}>
          {value}
        </Text>
      </TouchableOpacity>
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
          <Ionicons name="game-controller-outline" size={80} color={accentColor} style={{ marginBottom: 20 }} />
          <Text style={[styles.selectTitle, { color: theme.text }]}>{t('difficulty')}</Text>
          <Text style={[styles.selectSubtitle, { color: theme.textSecondary }]}>{t('game_tictactoe')}</Text>
          
          <TouchableOpacity style={[styles.difficultyButton, { backgroundColor: '#4CAF50' }]} onPress={() => setDifficulty('easy')}>
            <Text style={styles.difficultyText}>{t('easy')}</Text>
            <Text style={styles.difficultySubText}>{t('desc_easy_ai')}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.difficultyButton, { backgroundColor: '#FF9800' }]} onPress={() => setDifficulty('medium')}>
            <Text style={styles.difficultyText}>{t('medium')}</Text>
            <Text style={styles.difficultySubText}>{t('desc_medium_ai')}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.difficultyButton, { backgroundColor: '#F44336' }]} onPress={() => setDifficulty('hard')}>
            <Text style={styles.difficultyText}>{t('hard')}</Text>
            <Text style={styles.difficultySubText}>{t('desc_hard_ai')}</Text>
          </TouchableOpacity>
        </View>

        <GameInfoModal 
          visible={modalVisible} 
          onClose={() => setModalVisible(false)}
          gameKey="tictactoe"
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={changeDifficulty} style={[styles.backButton, { backgroundColor: theme.card }]}>
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.text }]}>{t('game_tictactoe')}</Text>
        <View style={{ width: 40 }} /> 
      </View>

      <View style={styles.content}>
        <View style={[styles.statusContainer, { backgroundColor: theme.card }]}>
          {isComputerThinking ? (
             <View style={{flexDirection: 'row', alignItems: 'center'}}>
               <ActivityIndicator size="small" color={accentColor} style={{marginRight: 10}}/>
               <Text style={[styles.statusText, { color: theme.textSecondary }]}>{t('computer_thinking')}</Text>
             </View>
          ) : (
            <Text style={[styles.statusText, { color: theme.textSecondary }]}>
              {gameActive ? t('your_turn') : t('game_over')}
            </Text>
          )}
        </View>

        <View style={styles.boardContainer}>
          <View style={styles.row}>
            {renderSquare(0)}
            {renderSquare(1)}
            {renderSquare(2)}
          </View>
          <View style={styles.row}>
            {renderSquare(3)}
            {renderSquare(4)}
            {renderSquare(5)}
          </View>
          <View style={styles.row}>
            {renderSquare(6)}
            {renderSquare(7)}
            {renderSquare(8)}
          </View>
        </View>

        <View style={[styles.difficultyBadge, { backgroundColor: theme.card }]}>
           <Text style={{color: theme.textSecondary, fontSize: 12}}>{t('difficulty').toUpperCase()}:</Text>
           <Text style={{color: accentColor, fontWeight: 'bold', marginLeft: 5}}>
             {difficulty === 'easy' ? t('easy').toUpperCase() : difficulty === 'medium' ? t('medium').toUpperCase() : t('hard').toUpperCase()}
           </Text>
        </View>

        <TouchableOpacity style={[styles.resetButton, { backgroundColor: accentColor }]} onPress={resetGame}>
          <Ionicons name="refresh" size={24} color="#fff" style={{ marginRight: 8 }} />
          <Text style={styles.resetButtonText}>{t('new_game')}</Text>
        </TouchableOpacity>
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
  title: { fontSize: 20, fontWeight: 'bold' },
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
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 50,
  },
  statusContainer: {
    paddingHorizontal: 25,
    paddingVertical: 12,
    borderRadius: 20,
    marginBottom: 30,
    elevation: 2,
    minWidth: 200,
    alignItems: 'center',
  },
  statusText: { fontSize: 18, fontWeight: '600' },
  boardContainer: {
    width: 300,
    height: 300,
    marginBottom: 30,
  },
  row: {
    flex: 1,
    flexDirection: 'row',
  },
  square: {
    flex: 1,
    margin: 5,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    elevation: 2,
  },
  squareText: { fontSize: 40, fontWeight: 'bold' },
  difficultyBadge: {
    flexDirection: 'row',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 20,
    alignItems: 'center',
  },
  resetButton: {
    flexDirection: 'row',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 30,
    alignItems: 'center',
    elevation: 4,
  },
  resetButtonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' }
});