// src/screens/SettingsScreen.js
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Linking,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLanguage } from '../utils/LanguageContext';
import { useFavorites } from '../utils/FavoritesContext';
import { useShoppingList } from '../utils/ShoppingListContext';
import { COLORS, SIZES, SPACING, SHADOWS } from '../constants/theme';
import { t } from '../constants/translations';
import { EmojiText } from '../components/EmojiText';

const SettingsScreen = ({ navigation }) => {
  const { language, changeLanguage } = useLanguage();
  const { clearFavorites, favorites } = useFavorites();
  const { clearAll, items } = useShoppingList();

  const languages = [
    { code: 'kk', flag: '🇰🇿', name: 'Қазақша' },
    { code: 'ru', flag: '🇷🇺', name: 'Русский' },
    { code: 'en', flag: '🇬🇧', name: 'English' },
  ];

  const handleLanguageChange = () => {
    Alert.alert(
      t('language', language),
      t('selectLanguage', language),
      [
        ...languages.map(lang => ({
          text: `${lang.flag} ${lang.name}`,
          onPress: async () => {
            await changeLanguage(lang.code);
            Alert.alert('✅', t('languageChanged', language));
          },
        })),
        { text: t('cancel', language), style: 'cancel' },
      ]
    );
  };

  const handleClearHistory = async () => {
    Alert.alert(
      t('clearHistoryTitle', language),
      t('clearHistoryMessage', language),
      [
        { text: t('cancel', language), style: 'cancel' },
        {
          text: t('clear', language),
          style: 'destructive',
          onPress: async () => {
            try {
              await AsyncStorage.removeItem('recentSearches');
              Alert.alert(t('success', language), t('historyCleared', language));
            } catch (error) {
              Alert.alert(t('error', language), error.message);
            }
          },
        },
      ]
    );
  };

  const handleClearFavorites = () => {
    Alert.alert(
      t('clearFavoritesTitle', language),
      `${t('willBeDeleted', language)} ${favorites.length} ${t('clearFavoritesMessage', language)}`,
      [
        { text: t('cancel', language), style: 'cancel' },
        {
          text: t('clear', language),
          style: 'destructive',
          onPress: async () => {
            await clearFavorites();
            Alert.alert(t('success', language), t('favoritesCleared', language));
          },
        },
      ]
    );
  };

  const handleClearShoppingList = () => {
    Alert.alert(
      t('clearShoppingListTitle', language),
      `${t('willBeDeleted', language)} ${items.length} ${t('clearShoppingListMessage', language)}`,
      [
        { text: t('cancel', language), style: 'cancel' },
        {
          text: t('clear', language),
          style: 'destructive',
          onPress: async () => {
            await clearAll();
            Alert.alert(t('success', language), t('shoppingListCleared', language));
          },
        },
      ]
    );
  };

  const handleContact = () => {
    Alert.alert(
      t('contactUs', language),
      t('chooseContactMethod', language),
      [
        {
          text: t('email', language),
          onPress: () => Linking.openURL('mailto:danbookovski@gmail.com'),
        },
        { text: t('cancel', language), style: 'cancel' },
      ]
    );
  };

  const handleShare = () => {
    Alert.alert(
      t('shareAppTitle', language),
      t('shareAppMessage', language),
      [{ text: t('ok', language) }]
    );
  };

  const handleRate = () => {
    Alert.alert(
      t('rateAppTitle', language),
      t('rateAppMessage', language),
      [{ text: t('ok', language) }]
    );
  };

  const currentLang = languages.find(l => l.code === language);

  const SettingItem = ({ icon, title, value, onPress, showArrow = true, color = COLORS.text }) => (
    <TouchableOpacity style={styles.settingItem} onPress={onPress}>
      <View style={styles.settingLeft}>
        <Text style={styles.settingIcon}>{icon}</Text>
        <Text style={[styles.settingTitle, { color }]}>{title}</Text>
      </View>
      <View style={styles.settingRight}>
        {value && <Text style={styles.settingValue}>{value}</Text>}
        {showArrow && <Text style={styles.settingArrow}>›</Text>}
      </View>
    </TouchableOpacity>
  );

  const SectionHeader = ({ title }) => (
    <Text style={styles.sectionHeader}>{title}</Text>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>

        <Text style={styles.headerTitle}>
          {t('settings', language)}
        </Text>

        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Общее */}
        <SectionHeader title={t('general', language)} />
        
        <View style={styles.section}>
          <SettingItem
            icon={currentLang?.flag}
            title={t('language', language)}
            value={currentLang?.name}
            onPress={handleLanguageChange}
          />
        </View>

        {/* Данные */}
        <SectionHeader title={t('data', language)} />
        
        <View style={styles.section}>
          <SettingItem
            icon={<EmojiText>🕐</EmojiText>}
            title={t('clearHistory', language)}
            onPress={handleClearHistory}
          />
          
          {favorites.length > 0 && (
            <SettingItem
              icon={<EmojiText>❤️</EmojiText>}
              title={t('clearFavorites', language)}
              value={`${favorites.length} ${t('recipes', language)}`}
              onPress={handleClearFavorites}
            />
          )}

          {items.length > 0 && (
            <SettingItem
              icon={<EmojiText>📋</EmojiText>}
              title={t('clearShoppingListButton', language)}
              value={`${items.length} ${t('ingredients', language)}`}
              onPress={handleClearShoppingList}
            />
          )}
        </View>

        {/* О приложении */}
        <SectionHeader title={t('about', language)} />
        
        <View style={styles.section}>
          <SettingItem
            icon={<EmojiText>ℹ️</EmojiText>}
            title={t('version', language)}
            value="1.0.0"
            showArrow={false}
            onPress={() => {}}
          />
          
          <SettingItem
            icon={<EmojiText>📤</EmojiText>}
            title={t('shareApp', language)}
            onPress={handleShare}
          />
          
          <SettingItem
            icon={<EmojiText>⭐</EmojiText>}
            title={t('rateApp', language)}
            onPress={handleRate}
          />
          
          <SettingItem
            icon={<EmojiText>📧</EmojiText>}
            title={t('contactUs', language)}
            onPress={handleContact}
          />

          <SettingItem
            icon={<EmojiText>📸</EmojiText>}
            title={t('instagram', language)}
            onPress={() => Linking.openURL('https://instagram.com/turkishrecipesapp')}
          />

          <SettingItem
            icon={<EmojiText>🎵</EmojiText>}
            title={t('tiktok', language)}
            onPress={() => Linking.openURL('https://tiktok.com/@turkishrecipesapp')}
          />
          
          <SettingItem
            icon="👑"
            title="Premium"
            onPress={() => navigation.navigate('Premium')}
          />

          {/* НОВЫЕ ПУНКТЫ */}
          <SettingItem
            icon={<EmojiText>🔒</EmojiText>}
            title={t('privacyPolicy', language)}
            onPress={() => navigation.navigate('PrivacyPolicy')}
          />

          <SettingItem
            icon={<EmojiText>💳</EmojiText>}
            title={t('refundPolicy', language)}
            onPress={() => navigation.navigate('RefundPolicy')}
          />
        </View>

        {/* Информация */}
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>Turkish Recipes</Text>
          <Text style={styles.infoText}>
            {t('appDescription', language)}
          </Text>
          <Text style={styles.infoFooter}>
            {t('madeWithLove', language)}
          </Text>
        </View>

        <View style={{ height: SPACING.xl }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.m,
    paddingTop: 50,
    paddingBottom: SPACING.m,
    backgroundColor: COLORS.background,
    ...SHADOWS.small,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backIcon: {
    fontSize: 24,
    color: COLORS.text,
  },
  headerTitle: {
    flex: 1,
    fontSize: SIZES.h4,
    fontWeight: 'bold',
    color: COLORS.text,
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.m,
  },
  sectionHeader: {
    fontSize: SIZES.caption,
    fontWeight: '600',
    color: COLORS.textLight,
    marginTop: SPACING.l,
    marginBottom: SPACING.s,
    marginLeft: SPACING.s,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  section: {
    backgroundColor: COLORS.background,
    borderRadius: SIZES.radius,
    overflow: 'hidden',
    ...SHADOWS.small,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.m,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: SPACING.m,
  },
  settingIcon: {
    fontSize: 20,
    width: 28,
  },
  settingTitle: {
    fontSize: SIZES.body,
    color: COLORS.text,
  },
  settingRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.s,
  },
  settingValue: {
    fontSize: SIZES.bodySmall,
    color: COLORS.textLight,
  },
  settingArrow: {
    fontSize: 20,
    color: COLORS.textLight,
  },
  infoCard: {
    backgroundColor: COLORS.backgroundGray,
    padding: SPACING.l,
    borderRadius: SIZES.radius,
    marginTop: SPACING.xl,
    alignItems: 'center',
  },
  infoTitle: {
    fontSize: SIZES.h3,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: SPACING.s,
  },
  infoText: {
    fontSize: SIZES.bodySmall,
    color: COLORS.textLight,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: SPACING.m,
  },
  infoFooter: {
    fontSize: SIZES.caption,
    color: COLORS.textLight,
  },
});

export default SettingsScreen;