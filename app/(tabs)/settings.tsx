import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Switch, 
  ScrollView,
  Alert 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useUser } from '../../src/context/UserContext';
import { useTheme, ACCENT_COLORS } from '../../src/context/ThemeContext';
import { clearDatabase } from '../../src/db/database';
// 1. IMPORTUJEMO KONTEKST ZA JEZIK
import { useLanguage } from '../../src/context/LanguageContext';

export default function SettingsScreen() {
  // 2. KORISTIMO KUKU (izbacili smo lokalni state)
  const { language, toggleLanguage, t } = useLanguage();
  
  const { username, logout } = useUser();
  const { isDarkMode, toggleTheme, accentColor, setAccentColor, theme } = useTheme();

  // FUNKCIJA ZA BRISANJE ISTORIJE (Sada sa prevodima)
  const handleClearHistory = () => {
    Alert.alert(
      t('alert_clear_title'), // "Obriši istoriju"
      t('alert_clear_msg'),   // "Da li ste sigurni..."
      [
        { text: t('alert_cancel'), style: "cancel" },
        { 
          text: t('alert_confirm_clear'), // "Obriši"
          style: 'destructive',
          onPress: async () => {
            try {
              await clearDatabase();
              Alert.alert(t('alert_success'), t('alert_history_cleared'));
            } catch (e) {
              Alert.alert(t('alert_error'), t('alert_error_msg'));
            }
          }
        }
      ]
    );
  };

  const handleLogout = () => {
    Alert.alert(
      t('alert_logout_title'),
      t('alert_logout_msg'),
      [
        { text: t('alert_cancel'), style: "cancel" },
        { 
          text: t('settings_logout'), 
          style: 'destructive',
          onPress: async () => {
            await logout();
          }
        }
      ]
    );
  };

  const ColorOption = ({ color, name }: { color: string, name: string }) => (
    <TouchableOpacity 
      onPress={() => setAccentColor(color)}
      style={[
        styles.colorCircle, 
        { backgroundColor: color },
        accentColor === color && styles.activeColorCircle 
      ]}
    />
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
      <ScrollView 
        style={{ flex: 1 }} 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        alwaysBounceVertical={true} 
      >
        
        {/* Profil korisnika */}
        <View style={[styles.profileHeader, { backgroundColor: theme.card }]}>
            <View style={[styles.avatar, { backgroundColor: accentColor }]}>
                <Text style={styles.avatarText}>
                    {username ? username.charAt(0).toUpperCase() : "?"}
                </Text>
            </View>
            <View>
                {/* PREVOD: Prijavljeni ste kao */}
                <Text style={styles.welcomeLabel}>{t('logged_in_as')}</Text>
                <Text style={[styles.usernameText, { color: theme.text }]}>{username}</Text>
            </View>
        </View>

        {/* Sekcija: Izgled aplikacije */}
        <Text style={styles.sectionTitle}>{t('settings_appearance')}</Text>

        {/* Izbor boje */}
        <View style={[styles.settingItem, { backgroundColor: theme.card }]}>
           <View style={styles.leftPart}>
              <View style={[styles.iconBox, { backgroundColor: theme.iconBg }]}>
                <Ionicons name="color-palette-outline" size={22} color={accentColor} />
              </View>
              <Text style={[styles.settingLabel, { color: theme.text }]}>{t('settings_theme_color')}</Text>
           </View>
           <View style={{ flexDirection: 'row', gap: 10 }}>
              {/* Ovdje koristimo prevode za boje koje smo dodali */}
              <ColorOption color={ACCENT_COLORS.purple} name={t('color_purple')} />
              <ColorOption color={ACCENT_COLORS.blue} name={t('color_blue')} />
              <ColorOption color={ACCENT_COLORS.orange} name={t('color_orange')} />
           </View>
        </View>

        {/* Tamni način rada */}
        <View style={[styles.settingItem, { backgroundColor: theme.card }]}>
          <View style={styles.leftPart}>
            <View style={[styles.iconBox, { backgroundColor: theme.iconBg }]}>
              <Ionicons name="moon-outline" size={22} color={accentColor} />
            </View>
            <Text style={[styles.settingLabel, { color: theme.text }]}>{t('settings_dark_mode')}</Text>
          </View>
          <Switch 
            value={isDarkMode} 
            onValueChange={toggleTheme}
            trackColor={{ false: "#D1D1D1", true: accentColor }}
            thumbColor={isDarkMode ? "#fff" : "#f4f3f4"}
          />
        </View>

        <Text style={[styles.sectionTitle, { marginTop: 30 }]}>{t('settings_general')}</Text>
        
        {/* Jezik */}
        <TouchableOpacity 
          style={[styles.settingItem, { backgroundColor: theme.card }]} 
          onPress={toggleLanguage} // Poziva funkciju iz konteksta
          activeOpacity={0.7}
        >
          <View style={styles.leftPart}>
            <View style={[styles.iconBox, { backgroundColor: theme.iconBg }]}>
              <Ionicons name="language" size={22} color={accentColor} />
            </View>
            <Text style={[styles.settingLabel, { color: theme.text }]}>{t('settings_language')}</Text>
          </View>
          <View style={styles.rightPart}>
            {/* Prikaz trenutnog jezika na osnovu konteksta */}
            <Text style={[styles.currentValueText, { color: accentColor }]}>
                {language === 'sr' ? 'Srpski' : 'English'}
            </Text>
            <Ionicons name="chevron-forward" size={18} color="#BDBDBD" />
          </View>
        </TouchableOpacity>

        {/* DUGME ZA BRISANJE ISTORIJE */}
        <TouchableOpacity 
          style={[styles.settingItem, { backgroundColor: theme.card }]} 
          onPress={handleClearHistory}
          activeOpacity={0.7}
        >
          <View style={styles.leftPart}>
            <View style={[styles.iconBox, { backgroundColor: theme.iconBg }]}>
              <Ionicons name="trash-outline" size={22} color="#F44336" />
            </View>
            <Text style={[styles.settingLabel, { color: theme.text }]}>{t('settings_clear_history')}</Text>
          </View>
          <View style={styles.rightPart}>
            <Ionicons name="chevron-forward" size={18} color="#BDBDBD" />
          </View>
        </TouchableOpacity>

        <Text style={[styles.sectionTitle, { marginTop: 30 }]}>{t('settings_about')}</Text>
        
        {/* Verzija aplikacije */}
        <View style={[styles.settingItem, { backgroundColor: theme.card }]}>
          <View style={styles.leftPart}>
            <View style={[styles.iconBox, { backgroundColor: theme.iconBg }]}>
              <Ionicons name="information-circle-outline" size={22} color="#616161" />
            </View>
            <Text style={[styles.settingLabel, { color: theme.text }]}>{t('settings_version')}</Text>
          </View>
          <Text style={styles.versionText}>1.0.0</Text>
        </View>

        <View style={{ marginTop: 40 }} />

        {/* Odjava */}
        <TouchableOpacity 
          style={styles.logoutButton} 
          onPress={handleLogout}
          activeOpacity={0.8}
        >
            <Ionicons name="log-out-outline" size={22} color="#D32F2F" style={{ marginRight: 8 }} />
            <Text style={styles.logoutButtonText}>{t('settings_logout')}</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 30,
    padding: 20,
    borderRadius: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  avatarText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  welcomeLabel: {
    fontSize: 12,
    color: '#757575',
    textTransform: 'uppercase',
  },
  usernameText: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  sectionTitle: { 
    fontSize: 13, 
    fontWeight: '700', 
    color: '#9E9E9E', 
    marginBottom: 12, 
    textTransform: 'uppercase',
    letterSpacing: 1
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
    borderRadius: 16,
    marginBottom: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },
  leftPart: { 
    flexDirection: 'row', 
    alignItems: 'center' 
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  settingLabel: { 
    fontSize: 16, 
    fontWeight: '500' 
  },
  rightPart: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  currentValueText: { 
    fontWeight: '600', 
    marginRight: 8,
    fontSize: 15
  },
  versionText: {
    color: '#757575', 
    fontWeight: '500',
    fontSize: 14
  },
  logoutButton: {
      backgroundColor: '#FFEBEE', 
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      padding: 16,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: '#FFCDD2',
  },
  logoutButtonText: {
      color: '#D32F2F', 
      fontSize: 16,
      fontWeight: 'bold'
  },
  colorCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  activeColorCircle: {
    borderColor: '#333', 
    transform: [{ scale: 1.1 }]
  }
});