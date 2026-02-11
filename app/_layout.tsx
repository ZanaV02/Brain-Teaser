import { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { UserProvider, useUser } from '../src/context/UserContext';
import { ThemeProvider } from '../src/context/ThemeContext';
import { View, ActivityIndicator } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
// 1. DODAJ OBAVEZNO OVAJ IMPORT:
import { initializeDatabase } from '../src/db/database';
import { LanguageProvider } from '../src/context/LanguageContext';

const MainLayout = () => {
  const { username, isLoading } = useUser();
  const router = useRouter();
  const segments = useSegments();

  // 2. DODAJ OVAJ USE EFFECT (Ovo kreira tabele u bazi):
  useEffect(() => {
    initializeDatabase()
      .then(() => console.log("✅ Baza je spremna!"))
      .catch(e => console.error("❌ Greška pri kreiranju baze:", e));
  }, []);

  useEffect(() => {
    if (isLoading) return;

    const inTabsGroup = segments[0] === '(tabs)';
    const inGamesGroup = segments[0] === 'games'; 

    if (username && !inTabsGroup && !inGamesGroup) {
      router.replace('/(tabs)');
    } else if (!username && inTabsGroup) {
      router.replace('/login');
    }
  }, [username, isLoading, segments]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#6200ee" />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="login" />
      <Stack.Screen name="(tabs)" />
      
      <Stack.Screen name="games/tictactoe" />
      <Stack.Screen name="games/memory" />
      <Stack.Screen name="games/mathquiz"/>
    </Stack>
  );
};

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <LanguageProvider>
        <ThemeProvider>
          <UserProvider>
            <MainLayout />
          </UserProvider>
        </ThemeProvider>
      </LanguageProvider> 
    </SafeAreaProvider>
  );
}