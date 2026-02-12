import { Stack, useRouter, useSegments } from 'expo-router';
import { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { LanguageProvider } from '../src/context/LanguageContext';
import { ThemeProvider } from '../src/context/ThemeContext';
import { UserProvider, useUser } from '../src/context/UserContext';
import { initializeDatabase } from '../src/db/database';

const MainLayout = () => {
  const { username, isLoading } = useUser();
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    initializeDatabase()
      .then(() => console.log("Baza je spremna!"))
      .catch(e => console.error("Greška pri kreiranju baze:", e));
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