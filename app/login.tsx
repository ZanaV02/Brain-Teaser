import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { useLanguage } from '../src/context/LanguageContext';
import { useUser } from '../src/context/UserContext';

export default function LoginScreen() {
  const [inputText, setInputText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useUser();
  const { t } = useLanguage();

  const handleStart = async () => {
    const name = inputText.trim();

    if (name.length < 3) {
      Alert.alert(
        t('alert_short_name'), 
        t('alert_short_name_msg')
      );
      return;
    }

    setIsSubmitting(true);
    try {
      await login(name);
    } catch (error) {
      console.error("Greška pri prijavi:", error);
      Alert.alert(t('alert_error'), t('alert_login_error_msg'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
      style={styles.container}
    >
      <View style={styles.card}>
        <View style={styles.iconCircle}>
          <MaterialCommunityIcons name="brain" size={45} color="#206571" />
        </View>

        <Text style={styles.title}>{t('login_welcome')}</Text>
        <Text style={styles.subtitle}>
          {t('login_subtitle')}
        </Text>

        <View style={styles.inputWrapper}>
          <Ionicons name="person-outline" size={20} color="#206571" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder={t('login_placeholder')}
            value={inputText}
            onChangeText={setInputText}
            placeholderTextColor="#999"
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>

        <TouchableOpacity 
          style={[styles.button, isSubmitting && styles.buttonDisabled]} 
          onPress={handleStart}
          disabled={isSubmitting}
          activeOpacity={0.8}
        >
          {isSubmitting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <View style={styles.buttonContent}>
              <Text style={styles.buttonText}>{t('login_btn')}</Text>
              <Ionicons name="arrow-forward" size={20} color="#fff" />
            </View>
          )}
        </TouchableOpacity>
      </View>
      
      <Text style={styles.footerText}>ETF BL</Text>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#206571',
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 30,
    padding: 32,
    alignItems: 'center',
    elevation: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  iconCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#f0eaff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#212121',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: '#757575',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 22,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 16,
    paddingHorizontal: 16,
    width: '100%',
    height: 60,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#212121',
    fontWeight: '500',
  },
  button: {
    backgroundColor: '#206571',
    width: '100%',
    height: 60,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#b39ddb',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
    marginRight: 12,
    letterSpacing: 1,
  },
  footerText: {
    position: 'absolute',
    bottom: 30,
    alignSelf: 'center',
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
    letterSpacing: 1,
  }
});