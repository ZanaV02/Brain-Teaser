import React, { useState, useEffect } from 'react';
import { 
  View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView, Dimensions
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../src/context/ThemeContext';
import { useUser } from '../../src/context/UserContext';
import { saveGameScore } from '../../src/db/database';
import { useLanguage } from '../../src/context/LanguageContext';
import GameInfoModal from '../../src/components/GameInfoModal';

const AVAILABLE_ICONS = [
  'planet', 'rocket', 'sunny', 'moon', 'heart', 'star', 
  'flower', 'musical-note', 'car', 'bicycle', 'game-controller', 'diamond'
];

interface Card {
  id: number;
  icon: string;
  isFlipped: boolean;
  isMatched: boolean;
}

export default function MemoryGameScreen() {
  const router = useRouter();
  const { theme, accentColor } = useTheme();
  const { username } = useUser();
  const { t } = useLanguage();

  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard' | null>(null);
  const [cards, setCards] = useState<Card[]>([]);
  const [selectedCards, setSelectedCards] = useState<Card[]>([]);
  const [moves, setMoves] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

  const shuffleCards = (array: any[]) => {
    return array.sort(() => Math.random() - 0.5);
  };

  const setupGame = (level: 'easy' | 'medium' | 'hard') => {
    let numPairs = 6; 
    if (level === 'medium') numPairs = 8; 
    if (level === 'hard') numPairs = 10;

    const selectedIcons = AVAILABLE_ICONS.slice(0, numPairs);
    const pairs = [...selectedIcons, ...selectedIcons];
    
    const shuffledCards = shuffleCards(pairs).map((icon, index) => ({
      id: index,
      icon,
      isFlipped: false,
      isMatched: false,
    }));

    setCards(shuffledCards);
    setDifficulty(level);
    setMoves(0);
    setSelectedCards([]);
    setIsProcessing(false);
  };

  const handleCardPress = (card: Card) => {
    if (isProcessing || card.isFlipped || card.isMatched) return;

    const updatedCards = cards.map(c => 
      c.id === card.id ? { ...c, isFlipped: true } : c
    );
    setCards(updatedCards);

    const newSelected = [...selectedCards, card];
    setSelectedCards(newSelected);

    if (newSelected.length === 2) {
      setMoves(prev => prev + 1);
      checkForMatch(newSelected, updatedCards);
    }
  };

  const checkForMatch = (selected: Card[], currentCards: Card[]) => {
    setIsProcessing(true);

    const [first, second] = selected;

    if (first.icon === second.icon) {
      const matchedCards = currentCards.map(c => 
        c.icon === first.icon ? { ...c, isMatched: true } : c
      );
      setCards(matchedCards);
      setSelectedCards([]);
      setIsProcessing(false);
      checkWin(matchedCards);
    } else {
      setTimeout(() => {
        const resetCards = currentCards.map(c => 
          c.id === first.id || c.id === second.id 
            ? { ...c, isFlipped: false } 
            : c
        );
        setCards(resetCards);
        setSelectedCards([]);
        setIsProcessing(false);
      }, 1000);
    }
  };

  const checkWin = async (currentCards: Card[]) => {
    const allMatched = currentCards.every(c => c.isMatched);
    if (allMatched) {
      const score = Math.max(0, 500 - (moves * 10));

      if (username) {
        await saveGameScore(username, 'Memorija', score);
      }

      Alert.alert(
        t('won'), 
        `${t('game_over')}\n${t('moves')}: ${moves + 1}\n${t('points')}: ${score}`,
        [
          { text: t('menu'), onPress: () => setDifficulty(null) },
          { text: t('play_again'), onPress: () => setupGame(difficulty!) }
        ]
      );
    }
  };

  const resetGame = () => {
    if (difficulty) setupGame(difficulty);
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
          <Ionicons name="apps-outline" size={80} color={accentColor} style={{ marginBottom: 20 }} />
          <Text style={[styles.selectTitle, { color: theme.text }]}>{t('game_memory')}</Text>
          <Text style={[styles.selectSubtitle, { color: theme.textSecondary }]}>{t('desc_memory')}</Text>
          
          <TouchableOpacity style={[styles.difficultyButton, { backgroundColor: '#4CAF50' }]} onPress={() => setupGame('easy')}>
            <Text style={styles.difficultyText}>{t('easy')}</Text>
            <Text style={styles.difficultySubText}>12 {t('cards_count')}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.difficultyButton, { backgroundColor: '#FF9800' }]} onPress={() => setupGame('medium')}>
            <Text style={styles.difficultyText}>{t('medium')}</Text>
            <Text style={styles.difficultySubText}>16 {t('cards_count')}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.difficultyButton, { backgroundColor: '#F44336' }]} onPress={() => setupGame('hard')}>
            <Text style={styles.difficultyText}>{t('hard')}</Text>
            <Text style={styles.difficultySubText}>20 {t('cards_count')}</Text>
          </TouchableOpacity>
        </View>

        <GameInfoModal 
          visible={modalVisible} 
          onClose={() => setModalVisible(false)}
          gameKey="memory"
        />
      </SafeAreaView>
    );
  }

  const screenWidth = Dimensions.get('window').width;
  const numColumns = difficulty === 'easy' ? 3 : 4; 
  const spacing = difficulty === 'easy' ? 80 : 40; 
  const gap = 10;
  const cardSize = (screenWidth - spacing - 40 - (numColumns - 1) * gap) / numColumns;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => setDifficulty(null)} style={[styles.backButton, { backgroundColor: theme.card }]}>
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.text }]}>{t('game_memory')}</Text>
        <View style={{ width: 40 }} /> 
      </View>

      <View style={styles.gameContent}>
        <View style={[styles.statusContainer, { backgroundColor: theme.card }]}>
          <Text style={[styles.statusText, { color: theme.textSecondary }]}>
            {t('moves')}: <Text style={{color: accentColor, fontWeight: 'bold'}}>{moves}</Text>
          </Text>
        </View>

        <ScrollView contentContainerStyle={styles.gridContainer}>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 10 }}>
            {cards.map(card => (
              <TouchableOpacity
                key={card.id}
                style={[
                  styles.card,
                  { 
                    width: cardSize, 
                    height: cardSize,
                    backgroundColor: card.isFlipped || card.isMatched ? theme.card : accentColor,
                    borderColor: theme.border,
                  },
                  (card.isFlipped || card.isMatched) && styles.cardFlipped
                ]}
                onPress={() => handleCardPress(card)}
                activeOpacity={0.8}
              >
                {(card.isFlipped || card.isMatched) ? (
                  <Ionicons name={card.icon as any} size={cardSize * 0.5} color={accentColor} />
                ) : (
                  <Ionicons name="help" size={cardSize * 0.4} color="rgba(255,255,255,0.5)" />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

        <View style={{padding: 20}}>
            <TouchableOpacity style={[styles.resetButton, { backgroundColor: accentColor }]} onPress={resetGame}>
            <Ionicons name="refresh" size={24} color="#fff" style={{ marginRight: 8 }} />
            <Text style={styles.resetButtonText}>{t('restart')}</Text>
            </TouchableOpacity>
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
  gameContent: { flex: 1 },
  statusContainer: {
    marginHorizontal: 20,
    padding: 15,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 20,
    elevation: 2,
  },
  statusText: { fontSize: 18, fontWeight: '500' },
  gridContainer: {
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  card: {
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  cardFlipped: { borderWidth: 2 },
  resetButton: {
    flexDirection: 'row',
    paddingVertical: 15,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
  },
  resetButtonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' }
});