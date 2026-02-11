import React from 'react';
import { Tabs } from 'expo-router';
import { StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../src/context/ThemeContext';
// 1. IMPORTUJEMO PREVOD
import { useLanguage } from '../../src/context/LanguageContext';

export default function TabLayout() {
  const { theme, accentColor } = useTheme();
  // 2. KORISTIMO T FUNKCIJU
  const { t } = useLanguage();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: accentColor,
        tabBarInactiveTintColor: theme.textSecondary,
        tabBarStyle: [styles.tabBar, { 
            backgroundColor: theme.card, 
            borderTopColor: theme.border 
        }],
        tabBarLabelStyle: styles.tabLabel,
        headerStyle: {
          backgroundColor: accentColor, 
        },
        headerTintColor: '#fff',
        headerTitleStyle: styles.headerTitle,
        headerShadowVisible: true,
      }}
    >
      {/* Tab za listu igara */}
      <Tabs.Screen
        name="index"
        options={{
          title: t('tab_games'),       // <--- PREVEDENO (Naslov gore)
          tabBarLabel: t('tab_games'), // <--- PREVEDENO (Labela dole)
          tabBarIcon: ({ color, focused }) => (
            <Ionicons 
              name={focused ? 'game-controller' : 'game-controller-outline'} 
              size={24} 
              color={color} 
            />
          ),
        }}
      />

      {/* Tab za istoriju rezultata */}
      <Tabs.Screen
        name="history"
        options={{
          title: t('tab_history'),       // <--- PREVEDENO
          tabBarLabel: t('tab_history'), // <--- PREVEDENO
          tabBarIcon: ({ color, focused }) => (
            <Ionicons 
              name={focused ? 'list-circle' : 'list-circle-outline'} 
              size={24} 
              color={color} 
            />
          ),
        }}
      />

      {/* Tab za postavke */}
      <Tabs.Screen
        name="settings"
        options={{
          title: t('tab_settings'),       // <--- PREVEDENO
          tabBarLabel: t('tab_settings'), // <--- PREVEDENO
          tabBarIcon: ({ color, focused }) => (
            <Ionicons 
              name={focused ? 'settings' : 'settings-outline'} 
              size={24} 
              color={color} 
            />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    height: 65,
    paddingBottom: 10,
    paddingTop: 5,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  tabLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  header: {
    backgroundColor: '#6200ee',
  },
  headerTitle: {
    fontWeight: 'bold',
    fontSize: 20,
    letterSpacing: 0.5,
  },
});