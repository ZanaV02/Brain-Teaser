import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../src/context/ThemeContext';
import { useRouter } from 'expo-router';
import { useLanguage } from '../../src/context/LanguageContext';

interface Game {
  id: string;
  title: string;
  icon: any; 
  color: string;
  description: string;
}

export default function GamesScreen() {
  const { theme } = useTheme();
  const router = useRouter();
  const { t } = useLanguage();

  const GAMES: Game[] = [
    { 
      id: 'tictactoe', 
      title: t('game_tictactoe'), 
      icon: 'close-outline', 
      color: '#FF5722',
      description: t('desc_tictactoe')
    },
    { 
      id: 'memory', 
      title: t('game_memory'), 
      icon: 'apps-outline', 
      color: '#4CAF50',
      description: t('desc_memory')
    },
    { 
      id: 'mathquiz', 
      title: t('game_math'), 
      icon: 'calculator-outline', 
      color: '#E91E63',           
      description: t('desc_math')
    },
  ];

  const renderGameItem = ({ item }: { item: Game }) => (
    <TouchableOpacity 
      style={[styles.gameCard, { backgroundColor: theme.card }]}
      activeOpacity={0.7}
      onPress={() => router.push(`/games/${item.id}` as any)}
    >
      <View style={[styles.iconContainer, { backgroundColor: item.color }]}>
        <Ionicons name={item.icon} size={30} color="white" />
      </View>
      
      <View style={styles.infoContainer}>
        <Text style={[styles.gameTitle, { color: theme.text }]}>{item.title}</Text>
        <Text style={[styles.gameDescription, { color: theme.textSecondary }]}>{item.description}</Text>
      </View>
      
      <View style={styles.arrowContainer}>
        <Ionicons name="chevron-forward" size={20} color={theme.textSecondary} />
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['bottom', 'left', 'right']}>
      
      <View style={[styles.headerSection, { backgroundColor: theme.card }]}>
        {/* PREVOD NASLOVA */}
        <Text style={[styles.welcomeText, { color: theme.text }]}>{t('welcomeTitle')}</Text>
        <Text style={[styles.subtitle, { color: theme.textSecondary }]}>{t('welcomeSubtitle')}</Text>
      </View>

      <FlatList
        data={GAMES}
        keyExtractor={(item) => item.id}
        renderItem={renderGameItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1,
    paddingTop:15,
   },
  headerSection: {
    padding: 25,
    borderRadius: 20,
    marginBottom: 15,
    marginLeft: 11.5,
    marginRight: 11.5,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
  },
  welcomeText: { 
    fontSize: 26, 
    fontWeight: 'bold', 
    letterSpacing: 0.5
  },
  subtitle: { 
    fontSize: 16, 
    marginTop: 5 
  },
  listContent: {
    padding: 8,
  },
  gameCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 16,
    marginBottom: 15,
    marginLeft: 2,
    marginRight: 2,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  iconContainer: { 
    width: 56, 
    height: 56, 
    borderRadius: 16, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  infoContainer: { 
    flex: 1, 
    marginLeft: 15 
  },
  gameTitle: { 
    fontSize: 18, 
    fontWeight: '700', 
  },
  gameDescription: { 
    fontSize: 13, 
    marginTop: 2
  },
  arrowContainer: {
    paddingLeft: 10,
  }
});