import React, { useState, useCallback } from 'react';
import { 
  View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../src/context/ThemeContext';
import { getScoreHistory, ScoreEntry } from '../../src/db/database';
import { useFocusEffect } from 'expo-router';
import { useLanguage } from '../../src/context/LanguageContext';

export default function HistoryScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('Sve');
  const [results, setResults] = useState<ScoreEntry[]>([]);
  
  const { theme, accentColor } = useTheme();
  const { t } = useLanguage();

  useFocusEffect(
    useCallback(() => {
      const loadHistory = async () => {
        try {
          const data = await getScoreHistory();
          setResults(data);
        } catch (error) {
          console.error("Greška pri učitavanju istorije:", error);
        }
      };
      
      loadHistory();
    }, [])
  );

  const filteredResults = results.filter(item => {
    const matchesSearch = item.username.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = activeFilter === 'Sve' || item.gameName === activeFilter;
    return matchesSearch && matchesFilter;
  });

  const formatDate = (dateString: string) => {
    try {
      return dateString.split(' ')[0]; 
    } catch (e) {
      return dateString;
    }
  };

  // POMOĆNA FUNKCIJA ZA PREVOD IMENA IGARA (IZ BAZE)
  const getTranslatedGameName = (dbName: string) => {
    switch(dbName) {
      case 'Iks-Oks': return t('game_tictactoe');
      case 'Memorija': return t('game_memory');
      case 'Matematika': return t('game_math');
      case 'Sve': return t('filter_all');
      default: return dbName;
    }
  };

  const renderResultItem = ({ item }: { item: ScoreEntry }) => (
    <View style={[styles.resultCard, { backgroundColor: theme.card }]}>
      <View style={styles.cardHeader}>
        <View style={styles.userContainer}>
          <View style={[styles.avatar, { backgroundColor: theme.iconBg }]}>
            <Text style={[styles.avatarText, { color: accentColor }]}>
              {item.username[0].toUpperCase()}
            </Text>
          </View>
          <View>
            <Text style={[styles.usernameText, { color: theme.text }]}>{item.username}</Text>
            <Text style={[styles.gameSubtitle, { color: theme.textSecondary }]}>
                {getTranslatedGameName(item.gameName)}
            </Text>
          </View>
        </View>
        <View style={[styles.scoreBadge, { backgroundColor: theme.iconBg }]}>
          <Text style={[styles.scoreValue, { color: accentColor }]}>{item.score}</Text>
          <Text style={[styles.scoreLabel, { color: accentColor }]}>{t('points').toUpperCase()}</Text>
        </View>
      </View>
      <View style={[styles.cardFooter, { borderTopColor: theme.border }]}>
        <Ionicons name="calendar-outline" size={14} color={theme.textSecondary} />
        <Text style={[styles.dateText, { color: theme.textSecondary }]}>{formatDate(item.date)}</Text>
      </View>
    </View>
  );

  // Filteri (koristimo originalna imena iz baze, a prevodimo ih pri prikazu)
  const filters = ['Sve', 'Iks-Oks', 'Memorija', 'Matematika'];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['bottom', 'left', 'right']}>
      
      <View style={[styles.searchContainer, { backgroundColor: theme.card, borderBottomColor: theme.border }]}>
        <View style={[styles.searchWrapper, { backgroundColor: theme.iconBg }]}>
          <Ionicons name="search" size={20} color={theme.textSecondary} />
          <TextInput
            style={[styles.searchInput, { color: theme.text }]}
            // PREVOD: Placeholder
            placeholder={t('history_search')}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor={theme.textSecondary}
          />
          {searchQuery !== '' && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color={theme.textSecondary} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <View style={[styles.filterWrapper, { backgroundColor: theme.card }]}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={filters}
          keyExtractor={(item) => item}
          renderItem={({ item }) => {
            const isActive = activeFilter === item;
            
            const label = getTranslatedGameName(item);
            
            return (
              <TouchableOpacity 
                style={[
                  styles.filterChip, 
                  { backgroundColor: theme.iconBg, borderColor: theme.border },
                  isActive && { backgroundColor: accentColor, borderColor: accentColor }
                ]}
                onPress={() => setActiveFilter(item)}
              >
                <Text style={[
                  styles.filterChipText,
                  { color: theme.text },
                  isActive && { color: '#FFFFFF' }
                ]}>{label}</Text>
              </TouchableOpacity>
            )
          }}
          contentContainerStyle={styles.filterListContent}
        />
      </View>

      <FlatList
        data={filteredResults}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderResultItem}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="alert-circle-outline" size={64} color={theme.textSecondary} />
            {/* PREVOD: Nema rezultata */}
            <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
              {t('history_no_results')}
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1,
    paddingTop: 12,
    paddingLeft: 7,
    paddingRight: 7,
    paddingBottom: 0,
   },
  searchContainer: {
    padding: 15,
    borderRadius: 20,
    marginBottom: 2,
    marginLeft: 5,
    marginRight: 5,
  },
  searchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 45,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
  },
  filterWrapper: {
    paddingVertical: 5,
    paddingLeft: 3,
    marginLeft: 5,
    marginRight: 5,
    marginBottom:5,
    elevation: 2,
    borderRadius:20,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
  },
  filterListContent: {
    padding:5,
    paddingHorizontal: 5,
  },
  filterChip: {
    paddingHorizontal: 15.5,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
  },
  filterChipText: {
    fontWeight: '500',
    fontSize: 13
  },
  listContent: {
    paddingTop: 20,
    paddingLeft: 7,
    paddingRight: 7,
    paddingBottom: 0,
  },
  resultCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  userContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  usernameText: {
    fontSize: 18,
    fontWeight: 'bold',
    textTransform: 'capitalize',
  },
  gameSubtitle: {
    fontSize: 14,
  },
  scoreBadge: {
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  scoreValue: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  scoreLabel: {
    fontSize: 9,
    fontWeight: 'bold',
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
  },
  dateText: {
    fontSize: 12,
    marginLeft: 5,
  },
  emptyContainer: {
    marginTop: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    marginTop: 10,
    fontSize: 16,
    fontWeight: '500',
  },
});