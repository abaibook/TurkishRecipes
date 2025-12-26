// src/screens/LanguageSelectionScreen.js
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useLanguage } from '../utils/LanguageContext';
import { COLORS, SIZES, SPACING } from '../constants/theme';
import { EmojiText } from '../components/EmojiText';

const LanguageSelectionScreen = ({ navigation }) => {
  const [selectedLanguage, setSelectedLanguage] = useState(null);
  const { changeLanguage } = useLanguage();

  const languages = [
    { code: 'kk', flag: '🇰🇿', name: 'Қазақша' },
    { code: 'ru', flag: '🇷🇺', name: 'Русский' },
    { code: 'en', flag: '🇬🇧', name: 'English' },
  ];

  const handleLanguageSelect = async (languageCode) => {
    setSelectedLanguage(languageCode);
    
    try {
      await changeLanguage(languageCode);
      
      // Переход к онбордингу через 300ms
      setTimeout(() => {
        navigation.replace('Onboarding', { language: languageCode });
      }, 300);
    } catch (error) {
      console.error('Error saving language:', error);
    }
  };

  return (
    <View style={styles.container}>
      {/* Заголовок */}
      <View style={styles.header}>
        <Text style={styles.title}>Choose Language</Text>
        <Text style={styles.subtitle}>Select your preferred language</Text>
      </View>

      {/* Список языков */}
      <ScrollView 
        style={styles.languagesList}
        contentContainerStyle={styles.languagesContent}
        showsVerticalScrollIndicator={false}
      >
        {languages.map((lang) => (
          <TouchableOpacity
            key={lang.code}
            style={[
              styles.languageItem,
              selectedLanguage === lang.code && styles.languageItemSelected,
            ]}
            onPress={() => handleLanguageSelect(lang.code)}
            activeOpacity={0.7}
          >
            <View style={styles.languageLeft}>
              <View style={styles.flagContainer}>
                <EmojiText style={styles.flag}>{lang.flag}</EmojiText>
              </View>
              <Text style={styles.languageName}>{lang.name}</Text>
            </View>
            
            {selectedLanguage === lang.code && (
              <View style={styles.checkIcon}>
                <EmojiText style={styles.checkText}>✓</EmojiText>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Футер */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>Turkish Recipes</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingTop: 80,
    paddingHorizontal: SPACING.xl,
    paddingBottom: SPACING.xl,
    alignItems: 'center',
  },
  title: {
    fontSize: SIZES.h2,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: SIZES.body,
    color: COLORS.textLight,
  },
  languagesList: {
    flex: 1,
  },
  languagesContent: {
    paddingHorizontal: SPACING.l,
    paddingBottom: SPACING.xl,
  },
  languageItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.background,
    paddingVertical: SPACING.m,
    paddingHorizontal: SPACING.l,
    borderRadius: SIZES.radius,
    marginBottom: SPACING.s,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  languageItemSelected: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.backgroundGray,
  },
  languageLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  flagContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.backgroundGray,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.m,
  },
  flag: {
    fontSize: 20,
  },
  languageName: {
    fontSize: SIZES.body,
    color: COLORS.text,
    fontWeight: '500',
  },
  checkIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkText: {
    color: COLORS.textWhite,
    fontSize: 14,
    fontWeight: 'bold',
  },
  footer: {
    paddingVertical: SPACING.l,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  footerText: {
    fontSize: SIZES.bodySmall,
    color: COLORS.textLight,
    letterSpacing: 1,
  },
});

export default LanguageSelectionScreen;