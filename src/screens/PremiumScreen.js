// src/screens/PremiumScreen.js
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useLanguage } from '../utils/LanguageContext';
import { usePremium } from '../utils/PremiumContext';
import { COLORS, SIZES, SPACING, SHADOWS } from '../constants/theme';
import { t } from '../constants/translations';
import mockData from '../data/mockRecipes.json';
import { EmojiText } from '../components/EmojiText';
import { usePremiumPrice } from '../utils/usePremiumPrice';

const PremiumScreen = ({ navigation }) => {
  const { language } = useLanguage();
  const { hasPremium, products, purchasePremium, restorePurchases, resetPremium } = usePremium();
  const { price, oldPrice } = usePremiumPrice();
  const [isLoading, setIsLoading] = useState(false);

  const freeRecipesCount = mockData.recipes.filter(r => r.isFree).length;
  const premiumRecipesCount = mockData.recipes.filter(r => !r.isFree).length;
  const totalRecipes = mockData.recipes.length;

  const handlePurchase = async () => {
  setIsLoading(true);
  
  const result = await purchasePremium();
  setIsLoading(false);

      if (result.success) {
        Alert.alert(
          t('congratulations', language),
          t('premiumActivated', language),
          [
            {
              text: t('startCooking', language),
              onPress: () => navigation.goBack(),
            },
          ]
        );
      } else {
        Alert.alert(t('error', language), t('purchaseError', language));
      }
  };

const handleRestore = async () => {
  setIsLoading(true);
  
  const result = await restorePurchases();
  setIsLoading(false);

   if (result.success) {
        Alert.alert(t('successTitle', language), result.message);
      } else {
        Alert.alert(t('notFoundTitle', language), t('noPurchasesFound', language));
      }
  };

  const handleReset = async () => {
      Alert.alert(
        t('resetPremiumTitle', language),
        t('resetPremiumMessage', language),
        [
          { text: t('cancel', language), style: 'cancel' },
          {
            text: t('reset', language),
            style: 'destructive',
            onPress: async () => {
              await resetPremium();
              Alert.alert(t('done', language), t('premiumReset', language));
            },
          },
        ]
      );
    };

  if (hasPremium) {
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
          <Text style={styles.headerTitle}>Premium</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Уже есть Premium */}
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.successContainer}>
            <EmojiText style={styles.successIcon}>👑</EmojiText>
            <Text style={styles.successTitle}>
              {t('youHavePremium', language)}
            </Text>
            <Text style={styles.successText}>
              {t('allRecipesAvailable', language).replace('{total}', totalRecipes)}
            </Text>

            <View style={styles.statsContainer}>
              <View style={styles.statCard}>
                <Text style={styles.statNumber}>{totalRecipes}</Text>
                <Text style={styles.statLabel}>
                  {t('recipesLabel', language)}
                </Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statNumber}>∞</Text>
                <Text style={styles.statLabel}>
                  {t('noLimits', language)}
                </Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.continueButton}
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.continueButtonText}>
                {t('continueCooking', language)}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.resetButton}
              onPress={handleReset}
            >
              <Text style={styles.resetButtonText}>
                {t('resetPremiumTest', language)}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    );
  }

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
            {t('unlockPremiumTitle', language)}
          </Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero секция */}
        <View style={styles.heroSection}>
          <EmojiText style={styles.heroIcon}>🔓</EmojiText>
          <Text style={styles.heroTitle}>
            {t('unlockAllRecipes', language).replace('{total}', totalRecipes)}
          </Text>
          <Text style={styles.heroSubtitle}>
            {t('freeRecipesAvailable', language).replace('{count}', freeRecipesCount)}{'\n'}
            {t('premiumRecipes', language).replace('{count}', premiumRecipesCount)}
          </Text>
        </View>

        {/* Что входит в Premium */}
        <View style={styles.featuresSection}>
          <Text style={styles.sectionTitle}>
            {t('premiumFeatures', language)}
          </Text>

          <View style={styles.featureCard}>
            <Text style={styles.featureIcon}>✓</Text>
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>
                {t('feature1', language)}
              </Text>
              <Text style={styles.featureDescription}>
                {t('feature1Description', language)}
              </Text>
            </View>
          </View>

          <View style={styles.featureCard}>
            <Text style={styles.featureIcon}>✓</Text>
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>
                {t('feature2', language)}
              </Text>
              <Text style={styles.featureDescription}>
                {t('feature2Description', language)}
              </Text>
            </View>
          </View>

          <View style={styles.featureCard}>
            <Text style={styles.featureIcon}>✓</Text>
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>
                {t('feature3', language)}
              </Text>
              <Text style={styles.featureDescription}>
                {t('feature3Description', language)}
              </Text>
            </View>
          </View>

          <View style={styles.featureCard}>
            <Text style={styles.featureIcon}>✓</Text>
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>
                {t('feature4', language)}
              </Text>
              <Text style={styles.featureDescription}>
                {t('feature4Description', language)}
              </Text>
            </View>
          </View>

          <View style={styles.featureCard}>
            <Text style={styles.featureIcon}>✓</Text>
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>
                {t('feature5', language)}
              </Text>
              <Text style={styles.featureDescription}>
                {t('feature5Description', language)}
              </Text>
            </View>
          </View>
        </View>

        {/* Цена */}
        <View style={styles.priceSection}>
          <View style={styles.priceCard}>
            <Text style={styles.priceLabel}>{t('oneTimePayment', language)}</Text>
            <View style={styles.priceRow}>
          <Text style={styles.priceOld}>{oldPrice}</Text>
          <Text style={styles.priceNew}>{price}</Text>
        </View>
            <Text style={styles.priceSaving}>{t('savePercent', language)}</Text>
          </View>
        </View>

        {/* Кнопка покупки */}
        <TouchableOpacity
          style={[styles.purchaseButton, isLoading && styles.purchaseButtonDisabled]}
          onPress={handlePurchase}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color={COLORS.textWhite} />
          ) : (
            <>
              <EmojiText style={styles.purchaseButtonIcon}>🔓</EmojiText>
              <Text style={styles.purchaseButtonText}>
                {t('buyPremiumFor', language)} {price}
              </Text>
            </>
          )}
        </TouchableOpacity>

        {/* Кнопка восстановления */}
        <TouchableOpacity
          style={styles.restoreButton}
          onPress={handleRestore}
          disabled={isLoading}
        >
          <Text style={styles.restoreButtonText}>
            {t('restorePurchases', language)}
          </Text>
        </TouchableOpacity>

        {/* Гарантии */}
        <View style={styles.guaranteeSection}>
          <Text style={styles.guaranteeText}>
            {t('guarantees', language)}
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
    fontSize: SIZES.body,
    fontWeight: '600',
    color: COLORS.text,
  },
  scrollContent: {
    padding: SPACING.l,
  },
  heroSection: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  heroIcon: {
    fontSize: 80,
    marginBottom: SPACING.m,
  },
  heroTitle: {
    fontSize: SIZES.h2,
    fontWeight: 'bold',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: SPACING.s,
  },
  heroSubtitle: {
    fontSize: SIZES.body,
    color: COLORS.textLight,
    textAlign: 'center',
    lineHeight: 24,
  },
  featuresSection: {
    marginBottom: SPACING.xl,
  },
  sectionTitle: {
    fontSize: SIZES.h4,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.m,
  },
  featureCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.backgroundGray,
    padding: SPACING.m,
    borderRadius: SIZES.radius,
    marginBottom: SPACING.m,
    gap: SPACING.m,
  },
  featureIcon: {
    fontSize: 24,
    color: COLORS.success,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: SIZES.body,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: SIZES.bodySmall,
    color: COLORS.textLight,
    lineHeight: 20,
  },
  priceSection: {
    marginBottom: SPACING.l,
  },
  priceCard: {
    backgroundColor: COLORS.gold,
    padding: SPACING.l,
    borderRadius: SIZES.radiusLarge,
    alignItems: 'center',
  },
  priceLabel: {
    fontSize: SIZES.bodySmall,
    color: COLORS.text,
    marginBottom: SPACING.s,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.m,
    marginBottom: SPACING.xs,
  },
  priceOld: {
    fontSize: SIZES.h3,
    color: COLORS.text,
    textDecorationLine: 'line-through',
    opacity: 0.5,
  },
  priceNew: {
    fontSize: SIZES.h1,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  priceSaving: {
    fontSize: SIZES.bodySmall,
    color: COLORS.primary,
    fontWeight: '600',
  },
  purchaseButton: {
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.m,
    borderRadius: SIZES.radius,
    marginBottom: SPACING.m,
    gap: SPACING.s,
    ...SHADOWS.large,
  },
  purchaseButtonDisabled: {
    opacity: 0.6,
  },
  purchaseButtonIcon: {
    fontSize: 24,
  },
  purchaseButtonText: {
    fontSize: SIZES.body,
    fontWeight: 'bold',
    color: COLORS.textWhite,
  },
  restoreButton: {
    padding: SPACING.m,
    alignItems: 'center',
  },
  restoreButtonText: {
    fontSize: SIZES.bodySmall,
    color: COLORS.primary,
    fontWeight: '600',
  },
  guaranteeSection: {
    marginTop: SPACING.l,
    padding: SPACING.m,
    backgroundColor: COLORS.backgroundGray,
    borderRadius: SIZES.radius,
  },
  guaranteeText: {
    fontSize: SIZES.caption,
    color: COLORS.textLight,
    lineHeight: 20,
    textAlign: 'center',
  },
  successContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 60,
  },
  successIcon: {
    fontSize: 100,
    marginBottom: SPACING.l,
  },
  successTitle: {
    fontSize: SIZES.h2,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.s,
  },
  successText: {
    fontSize: SIZES.body,
    color: COLORS.textLight,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: SPACING.xl,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: SPACING.m,
    marginBottom: SPACING.xl,
  },
  statCard: {
    backgroundColor: COLORS.backgroundGray,
    padding: SPACING.l,
    borderRadius: SIZES.radius,
    alignItems: 'center',
    minWidth: 120,
  },
  statNumber: {
    fontSize: SIZES.h1,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: SPACING.xs,
  },
  statLabel: {
    fontSize: SIZES.bodySmall,
    color: COLORS.textLight,
  },
  continueButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.m,
    paddingHorizontal: SPACING.xl,
    borderRadius: SIZES.radius,
    marginBottom: SPACING.l,
  },
  continueButtonText: {
    fontSize: SIZES.body,
    fontWeight: 'bold',
    color: COLORS.textWhite,
  },
  resetButton: {
    paddingVertical: SPACING.s,
    paddingHorizontal: SPACING.m,
  },
  resetButtonText: {
    fontSize: SIZES.caption,
    color: COLORS.textLight,
  },
});

export default PremiumScreen;