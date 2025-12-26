// src/screens/RecipeListScreen.js
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
} from 'react-native';
import { useLanguage } from '../utils/LanguageContext';
import { usePremium } from '../utils/PremiumContext';
import { COLORS, SIZES, SPACING, SHADOWS } from '../constants/theme';
import { t } from '../constants/translations';
import mockData from '../data/mockRecipes.json';
import { useFavorites } from '../utils/FavoritesContext';
import { getRecipeImage } from '../utils/recipeImages';
import { EmojiText } from '../components/EmojiText';

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
            numberOfLines={1}
          >
            {children}
          </Text>
        ))
      )}
      <Text style={[style, { color: color, opacity: 0.2 }]} numberOfLines={1}>
        {children}
      </Text>
    </View>
  );
};

const RecipeListScreen = ({ route, navigation }) => {
  const { categoryId } = route.params;
  const { language } = useLanguage();
  const { hasPremium } = usePremium();
  const [sortBy, setSortBy] = useState('popular');
  const { isFavorite, toggleFavorite } = useFavorites();
  
  const category = mockData.categories.find(cat => cat.id === categoryId);
  let recipes = mockData.recipes.filter(recipe => recipe.categoryId === categoryId);

  // Сортировка
  switch (sortBy) {
    case 'popular':
      recipes = [...recipes].sort((a, b) => b.rating - a.rating);
      break;
    case 'time':
      recipes = [...recipes].sort((a, b) => a.cookTime - b.cookTime);
      break;
    case 'name':
      recipes = [...recipes].sort((a, b) => 
        a.name[language].localeCompare(b.name[language])
      );
      break;
  }

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'easy': return COLORS.difficultyEasy;
      case 'medium': return COLORS.difficultyMedium;
      case 'hard': return COLORS.difficultyHard;
      default: return COLORS.textLight;
    }
  };

  const renderRecipeItem = ({ item: recipe }) => {
    const isLocked = !recipe.isFree && !hasPremium;

    // Рендер названия с блюром
    const renderRecipeName = () => {
      const name = recipe.name[language] || recipe.name.ru || '';

      if (!isLocked) {
        return <Text style={styles.recipeName} numberOfLines={2}>{name}</Text>;
      }

      return (
        <HeavyFakeBlurText style={styles.recipeName} blurColor="#DFDFDF">
          {name}
        </HeavyFakeBlurText>
      );
    };

    return (
      <TouchableOpacity
        style={styles.recipeCard}
        activeOpacity={0.8}
        onPress={() => navigation.navigate('RecipeDetail', { recipe })}
      >
        {/* Фото */}
        <Image
          source={getRecipeImage(recipe.id)}
          style={styles.recipeImage}
          resizeMode="cover"
        />

        {/* Замок для премиум */}
        {isLocked && (
          <View style={styles.lockBadge}>
            <EmojiText style={styles.lockIcon}>🔒</EmojiText>
          </View>
        )}

        {/* Информация */}
        <View style={styles.recipeInfo}>
          {/* Название */}
          {renderRecipeName()}

          {/* Мета информация в одной строке */}
          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <EmojiText style={styles.metaIcon}>⭐</EmojiText>
              <Text style={styles.metaText}>{recipe.rating}</Text>
            </View>
            
            <View style={styles.metaItem}>
              <EmojiText style={styles.metaIcon}>🕐</EmojiText>
              <Text style={styles.metaText}>
                {recipe.cookTime} {t('min', language)}
              </Text>
            </View>

            <View style={[
              styles.difficultyBadge,
              { backgroundColor: getDifficultyColor(recipe.difficulty) }
            ]}>
              <Text style={styles.difficultyText}>
                {t(recipe.difficulty, language)}
              </Text>
            </View>
          </View>

          {/* Порции */}
          <View style={styles.servingsRow}>
            <EmojiText style={styles.metaIcon}>👤</EmojiText>
            <Text style={styles.metaText}>
              {recipe.servings} {t('servings', language)}
            </Text>
          </View>

          {/* Избранное */}
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
        </View>
      </TouchableOpacity>
    );
  };

  const renderHeader = () => (
    <View style={styles.headerSection}>
      {/* Сортировка */}
      <View style={styles.sortContainer}>
        <Text style={styles.sortLabel}>{t('sortBy', language)}:</Text>
        <View style={styles.sortButtons}>
          <TouchableOpacity
            style={[styles.sortButton, sortBy === 'popular' && styles.sortButtonActive]}
            onPress={() => setSortBy('popular')}
          >
            <Text style={[
              styles.sortButtonText,
              sortBy === 'popular' && styles.sortButtonTextActive
            ]}>
              {t('byPopularity', language)}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.sortButton, sortBy === 'time' && styles.sortButtonActive]}
            onPress={() => setSortBy('time')}
          >
            <Text style={[
              styles.sortButtonText,
              sortBy === 'time' && styles.sortButtonTextActive
            ]}>
              {t('byTime', language)}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.sortButton, sortBy === 'name' && styles.sortButtonActive]}
            onPress={() => setSortBy('name')}
          >
            <Text style={[
              styles.sortButtonText,
              sortBy === 'name' && styles.sortButtonTextActive
            ]}>
              {t('byName', language)}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Счетчик */}
      <Text style={styles.countText}>
        {t('found', language)}: {recipes.length}
      </Text>
    </View>
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

        <View style={styles.headerCenter}>
          <Text style={styles.headerIcon}>{category?.icon}</Text>
          <Text style={styles.headerTitle}>{category?.name[language]}</Text>
        </View>

        <TouchableOpacity 
          style={styles.iconButton}
          onPress={() => navigation.navigate('Search')}
        >
          <EmojiText style={styles.icon}>🔍</EmojiText>
        </TouchableOpacity>
      </View>

      {/* Список рецептов */}
      <FlatList
        data={recipes}
        renderItem={renderRecipeItem}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderHeader}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
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
  headerCenter: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.s,
  },
  headerIcon: {
    fontSize: 24,
  },
  headerTitle: {
    fontSize: SIZES.h4,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  iconButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    fontSize: 20,
  },
  listContent: {
    padding: SPACING.m,
  },
  headerSection: {
    marginBottom: SPACING.l,
  },
  sortContainer: {
    marginBottom: SPACING.m,
  },
  sortLabel: {
    fontSize: SIZES.bodySmall,
    color: COLORS.textLight,
    marginBottom: SPACING.s,
  },
  sortButtons: {
    flexDirection: 'row',
    gap: SPACING.s,
    flexWrap: 'wrap',
  },
  sortButton: {
    paddingHorizontal: SPACING.m,
    paddingVertical: SPACING.s,
    borderRadius: SIZES.radiusSmall,
    backgroundColor: COLORS.backgroundGray,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  sortButtonActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  sortButtonText: {
    fontSize: SIZES.caption,
    color: COLORS.textLight,
  },
  sortButtonTextActive: {
    color: COLORS.textWhite,
    fontWeight: '600',
  },
  countText: {
    fontSize: SIZES.bodySmall,
    color: COLORS.textLight,
  },
  recipeCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.background,
    borderRadius: SIZES.radius,
    marginBottom: SPACING.m,
    overflow: 'hidden',
    ...SHADOWS.medium,
    height: 110,
  },
  recipeImage: {
    width: 110,
    height: 110,
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
    zIndex: 1,
  },
  lockIcon: {
    fontSize: 14,
  },
  recipeInfo: {
    flex: 1,
    padding: SPACING.m,
    justifyContent: 'space-between',
  },
  recipeName: {
    fontSize: SIZES.body,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.m,
    marginBottom: SPACING.xs,
  },
  metaItem: {
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
  difficultyBadge: {
    paddingHorizontal: SPACING.s,
    paddingVertical: 2,
    borderRadius: SIZES.radiusSmall,
  },
  difficultyText: {
    fontSize: SIZES.caption - 2,
    color: COLORS.textWhite,
    fontWeight: '600',
  },
  servingsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  favoriteButton: {
    position: 'absolute',
    top: SPACING.s,
    right: SPACING.s,
  },
  favoriteIcon: {
    fontSize: 20,
  },
});

export default RecipeListScreen;