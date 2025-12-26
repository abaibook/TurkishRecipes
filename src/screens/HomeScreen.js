// src/screens/HomeScreen.js
import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
} from 'react-native';
import { useLanguage } from '../utils/LanguageContext';
import { usePremium } from '../utils/PremiumContext';
import { useFavorites } from '../utils/FavoritesContext';
import { COLORS, SIZES, SPACING, SHADOWS } from '../constants/theme';
import { t } from '../constants/translations';
import mockData from '../data/mockRecipes.json';
import { getRecipeImage } from '../utils/recipeImages';
import { EmojiText } from '../components/EmojiText';
import { usePremiumPrice } from '../utils/usePremiumPrice';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - SPACING.m * 3) / 2;
const CATEGORY_SIZE = 70;

// Компонент для имитации блюра текста
const HeavyFakeBlurText = ({ children, style, blurColor }) => {
  const offsets = [-7, -3, -1, 1, 2, 4, 6];
  const color = blurColor || style?.color || COLORS.text;

  return (
    <View style={{ position: 'relative' }}>
      {offsets.flatMap((dx) =>
        offsets.map((dy) => (
          <Text
            key={`${dx},${dy}`}
            style={[
              style,
              {
                position: 'absolute',
                left: dx,
                top: dy,
                color: color,
                opacity: 0.08,
              },
            ]}
            numberOfLines={2}
          >
            {children}
          </Text>
        ))
      )}
      <Text style={[style, { color: color, opacity: 0.2 }]} numberOfLines={2}>
        {children}
      </Text>
    </View>
  );
};

const HomeScreen = ({ navigation }) => {
  const { language } = useLanguage();
  const { hasPremium } = usePremium();
  const { isFavorite, toggleFavorite } = useFavorites();
  const [userName, setUserName] = useState('');
  const [displayCount, setDisplayCount] = useState(6);
  const { price } = usePremiumPrice();

  // Подсчет бесплатных рецептов
  const freeRecipesCount = mockData.recipes.filter(r => r.isFree).length;

  // Загружаем имя пользователя
  useEffect(() => {
    loadUserName();
  }, []);

  const loadUserName = async () => {
    try {
      const name = await AsyncStorage.getItem('userName');
      if (name) {
        setUserName(name);
      }
    } catch (error) {
      console.error('Error loading user name:', error);
    }
  };

  // Сортируем: сначала бесплатные, потом премиум
  const sortedRecipes = [...mockData.recipes].sort((a, b) => {
    if (a.isFree && !b.isFree) return -1;
    if (!a.isFree && b.isFree) return 1;
    return Math.random() - 0.5;
  });

  // Берем нужное количество рецептов
  const displayRecipes = sortedRecipes.slice(0, displayCount);
  const hasMore = displayCount < sortedRecipes.length;

  const loadMore = () => {
    setDisplayCount(prev => Math.min(prev + 6, sortedRecipes.length));
  };

  const renderRecipeCard = (recipe) => {
    const isLocked = !recipe.isFree && !hasPremium;

    const renderRecipeName = () => {
      const name = recipe.name[language] || recipe.name.ru || '';

      if (!isLocked) {
        return (
          <Text style={styles.recipeName} numberOfLines={2}>
            {name}
          </Text>
        );
      }

      return (
        <HeavyFakeBlurText style={styles.recipeName} blurColor="#DFDFDF">
          {name}
        </HeavyFakeBlurText>
      );
    };

    return (
      <TouchableOpacity
        key={recipe.id}
        style={styles.recipeCard}
        activeOpacity={0.8}
        onPress={() => navigation.navigate('RecipeDetail', { recipe })}
      >
        <Image
          source={getRecipeImage(recipe.id)}
          style={styles.cardImage}
          resizeMode="cover"
        />

        {isLocked && (
          <View style={styles.lockBadge}>
            <EmojiText style={styles.lockIcon}>🔒</EmojiText>
          </View>
        )}

        <TouchableOpacity 
          style={styles.favoriteButton}
          onPress={async (e) => {
            e.stopPropagation();
            await toggleFavorite(recipe);
          }}
        >
          <EmojiText style={styles.favoriteIcon}>
            {isFavorite(recipe.id) ? '❤️' : '🤍'}
          </EmojiText>
        </TouchableOpacity>

        <View style={styles.recipeInfo}>
          {renderRecipeName()}

          <View style={styles.recipeMetaRow}>
            <View style={styles.recipeMeta}>
              <EmojiText style={styles.metaIcon}>⭐</EmojiText>
              <Text style={styles.metaText}>{recipe.rating}</Text>
            </View>
            <View style={styles.recipeMeta}>
              <EmojiText style={styles.metaIcon}>🕐</EmojiText>
              <Text style={styles.metaText}>
                {recipe.cookTime} {t('min', language)}
              </Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderCategoryCircle = (category) => {
    return (
      <TouchableOpacity
        key={category.id}
        style={styles.categoryCircle}
        activeOpacity={0.7}
        onPress={() => navigation.navigate('RecipeList', { categoryId: category.id })}
      >
        <View style={styles.categoryIconContainer}>
          <EmojiText style={styles.categoryIcon}>{category.icon}</EmojiText>
        </View>
        <Text style={styles.categoryLabel} numberOfLines={1}>
          {category.name[language]}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity 
            style={styles.avatarButton}
            onPress={() => navigation.navigate('Settings')}
          >
            <EmojiText style={styles.avatarIcon}>⚙️</EmojiText>
          </TouchableOpacity>
          <View>
            <Text style={styles.greeting}>
              {t('hello', language)}{userName ? `, ${userName}` : ''}
            </Text>
            {!hasPremium ? (
              <TouchableOpacity onPress={() => navigation.navigate('Premium')}>
                <Text style={styles.freeRecipesText}>
                  {t('freeRecipes', language).replace('{count}', freeRecipesCount)} 🔓
                </Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.premiumBadgeHeader}>
                <EmojiText style={styles.premiumBadgeIcon}>👑</EmojiText>
                <Text style={styles.premiumBadgeText}>Premium</Text>
              </View>
            )}
          </View>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity 
            style={styles.notificationButton}
            onPress={() => navigation.navigate('ShoppingList')}
          >
            <EmojiText style={styles.notificationIcon}>📋</EmojiText>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.notificationButton}
            onPress={() => navigation.navigate('Favorites')}
          >
            <EmojiText style={styles.notificationIcon}>❤️</EmojiText>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <TouchableOpacity 
          style={styles.searchBar}
          activeOpacity={0.7}
          onPress={() => navigation.navigate('Search')}
        >
          <EmojiText style={styles.searchIcon}>🔍</EmojiText>
          <Text style={styles.searchPlaceholder}>
            {t('searchRecipes', language)}
          </Text>
        </TouchableOpacity>

        {!hasPremium && (
          <TouchableOpacity 
            style={styles.premiumBanner} 
            activeOpacity={0.9}
            onPress={() => navigation.navigate('Premium')}
          >
            <View style={styles.premiumLeft}>
              <Text style={styles.premiumBadge}>
                {t('getPro', language)}
              </Text>
              <Text style={styles.premiumTitle}>
                {t('unlockAllRecipes', language).replace('{total}', '116')}
              </Text>
              <Text style={styles.premiumSubtitle}>
                {t('premiumPrice', language)} {price}
              </Text>
              <View style={styles.upgradeButton}>
                <Text style={styles.upgradeButtonText}>
                  {t('upgradeNow', language)}
                </Text>
              </View>
            </View>
            <View style={styles.premiumRight}>
              <EmojiText style={styles.premiumEmoji}>👑</EmojiText>
            </View>
          </TouchableOpacity>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {t('categories', language)}
          </Text>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesScroll}
          >
            {mockData.categories.map(renderCategoryCircle)}
          </ScrollView>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {t('recentRecipes', language)}
          </Text>

          <View style={styles.recipesGrid}>
            {displayRecipes.map(renderRecipeCard)}
          </View>

          {hasMore && (
            <TouchableOpacity 
              style={styles.loadMoreButton}
              onPress={loadMore}
              activeOpacity={0.7}
            >
              <Text style={styles.loadMoreText}>
                {t('loadMore', language)}
              </Text>
              <Text style={styles.loadMoreIcon}>↓</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.bottomSpacer} />
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.m,
    paddingTop: 50,
    paddingBottom: SPACING.m,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.m,
  },
  avatarButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: COLORS.backgroundGray,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarIcon: {
    fontSize: 24,
  },
  greeting: {
    fontSize: SIZES.bodySmall,
    color: COLORS.textLight,
  },
  appName: {
    fontSize: SIZES.h4,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  notificationButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.backgroundGray,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationIcon: {
    fontSize: 20,
  },
  scrollContent: {
    paddingBottom: SPACING.xl,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.backgroundGray,
    marginHorizontal: SPACING.m,
    marginTop: SPACING.m,
    paddingHorizontal: SPACING.m,
    paddingVertical: SPACING.m + 2,
    borderRadius: SIZES.radius,
    gap: SPACING.s,
  },
  searchIcon: {
    fontSize: 18,
  },
  searchPlaceholder: {
    fontSize: SIZES.body,
    color: COLORS.textLight,
  },
  premiumBanner: {
    flexDirection: 'row',
    backgroundColor: COLORS.gold,
    marginHorizontal: SPACING.m,
    marginTop: SPACING.l,
    borderRadius: SIZES.radiusLarge,
    padding: SPACING.l,
    ...SHADOWS.medium,
    overflow: 'hidden',
  },
  premiumLeft: {
    flex: 1,
  },
  premiumBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#FFD700',
    paddingHorizontal: SPACING.m,
    paddingVertical: 4,
    borderRadius: SIZES.radiusSmall,
    fontSize: SIZES.caption,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.s,
  },
  premiumTitle: {
    fontSize: SIZES.h4,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 4,
  },
  premiumSubtitle: {
    fontSize: SIZES.bodySmall,
    color: COLORS.text,
    opacity: 0.8,
    marginBottom: SPACING.m,
  },
  upgradeButton: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.text,
    paddingHorizontal: SPACING.l,
    paddingVertical: SPACING.s,
    borderRadius: SIZES.radius,
  },
  upgradeButtonText: {
    fontSize: SIZES.bodySmall,
    fontWeight: '600',
    color: COLORS.background,
  },
  premiumRight: {
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: SPACING.m,
  },
  premiumEmoji: {
    fontSize: 80,
    opacity: 0.3,
  },
  section: {
    marginTop: SPACING.l,
  },
  sectionTitle: {
    fontSize: SIZES.h4,
    fontWeight: 'bold',
    color: COLORS.text,
    paddingHorizontal: SPACING.m,
    marginBottom: SPACING.m,
  },
  categoriesScroll: {
    paddingHorizontal: SPACING.m,
    gap: SPACING.m,
  },
  categoryCircle: {
    alignItems: 'center',
    width: CATEGORY_SIZE + 20,
  },
  categoryIconContainer: {
    width: CATEGORY_SIZE,
    height: CATEGORY_SIZE,
    borderRadius: CATEGORY_SIZE / 2,
    backgroundColor: COLORS.backgroundGray,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.xs,
    ...SHADOWS.small,
  },
  categoryIcon: {
    fontSize: 32,
  },
  categoryLabel: {
    fontSize: SIZES.caption,
    color: COLORS.text,
    textAlign: 'center',
  },
  recipesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: SPACING.m,
    gap: SPACING.m,
  },
  recipeCard: {
    width: CARD_WIDTH,
    backgroundColor: COLORS.background,
    borderRadius: SIZES.radiusLarge,
    ...SHADOWS.medium,
    overflow: 'hidden',
  },
  cardImage: {
    width: CARD_WIDTH,
    height: CARD_WIDTH,
    backgroundColor: COLORS.backgroundGray,
  },
  lockBadge: {
    position: 'absolute',
    top: SPACING.s,
    left: SPACING.s,
    backgroundColor: 'rgba(0,0,0,0.7)',
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  lockIcon: {
    fontSize: 14,
  },
  favoriteButton: {
    position: 'absolute',
    top: SPACING.s,
    right: SPACING.s,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  favoriteIcon: {
    fontSize: 18,
  },
  recipeInfo: {
    padding: SPACING.m,
  },
  recipeName: {
    fontSize: SIZES.body,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.s,
    height: 40,
  },
  recipeMetaRow: {
    flexDirection: 'row',
    gap: SPACING.m,
  },
  recipeMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaIcon: {
    fontSize: 12,
  },
  metaText: {
    fontSize: SIZES.caption,
    color: COLORS.textLight,
  },
  bottomSpacer: {
    height: SPACING.xl,
  },
  freeRecipesText: {
    fontSize: SIZES.bodySmall,
    fontWeight: '600',
    color: COLORS.primary,
  },
  premiumBadgeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.gold,
    paddingHorizontal: SPACING.m,
    paddingVertical: 4,
    borderRadius: SIZES.radiusSmall,
    gap: 4,
  },
  premiumBadgeIcon: {
    fontSize: 14,
  },
  premiumBadgeText: {
    fontSize: SIZES.bodySmall,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  headerActions: {
    flexDirection: 'row',
    gap: SPACING.s,
  },
  loadMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.backgroundGray,
    marginHorizontal: SPACING.m,
    marginTop: SPACING.m,
    paddingVertical: SPACING.m,
    borderRadius: SIZES.radius,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: SPACING.s,
  },
  loadMoreText: {
    fontSize: SIZES.body,
    color: COLORS.text,
    fontWeight: '600',
  },
  loadMoreIcon: {
    fontSize: 18,
    color: COLORS.text,
  },
});

export default HomeScreen;