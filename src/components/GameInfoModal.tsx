import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';

interface GameInfoModalProps {
  visible: boolean;
  onClose: () => void;
  gameKey: 'tictactoe' | 'memory' | 'mathquiz';
  // videoUrl je obrisan
}

export default function GameInfoModal({ visible, onClose, gameKey }: GameInfoModalProps) {
  const { theme, accentColor } = useTheme();
  const { t } = useLanguage();

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.centeredView}>
        <View style={[styles.modalView, { backgroundColor: theme.card }]}>
          
          {/* Header */}
          <View style={styles.header}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>{t('info_title')}</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color={theme.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* Pravila */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Ionicons name="book-outline" size={20} color={accentColor} />
                <Text style={[styles.sectionTitle, { color: theme.text }]}>{t('info_rules')}</Text>
              </View>
              <Text style={[styles.sectionText, { color: theme.textSecondary }]}>
                {t(`rules_${gameKey}` as any)}
              </Text>
            </View>

            {/* Bodovanje */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Ionicons name="trophy-outline" size={20} color={accentColor} />
                <Text style={[styles.sectionTitle, { color: theme.text }]}>{t('info_scoring')}</Text>
              </View>
              <Text style={[styles.sectionText, { color: theme.textSecondary }]}>
                {t(`scoring_${gameKey}` as any)}
              </Text>
            </View>
          </ScrollView>

          {/* Close Button */}
          <TouchableOpacity 
            style={[styles.closeButton, { backgroundColor: accentColor }]} 
            onPress={onClose}
          >
            <Text style={styles.closeButtonText}>{t('close')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 20,
  },
  modalView: {
    width: '100%',
    maxHeight: '70%', // Malo smanjena visina jer nema videa
    borderRadius: 20,
    padding: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  content: {
    marginBottom: 20,
  },
  section: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  sectionText: {
    fontSize: 14,
    lineHeight: 20,
    marginLeft: 28, 
  },
  closeButton: {
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
  },
  closeButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});