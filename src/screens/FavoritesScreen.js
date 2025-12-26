// src/screens/FavoritesScreen.js
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  Dimensions,
} from 'react-native';
import { useLanguage } from '../utils/LanguageContext';
import { useFavorites } from '../utils/FavoritesContext';
import { usePremium } from '../utils/PremiumContext';
import { COLORS, SIZES, SPACING, SHADOWS } from '../constants/theme';
import { t } from '../constants/translations';
import { getRecipeImage } from '../utils/recipeImages';
import { EmojiText } from '../components/EmojiText';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - SPACING.m * 3) / 2;

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

const FavoritesScreen = ({ navigation }) => {
  const { language } = useLanguage();
  const { favorites, removeFromFavorites } = useFavorites();
  const { hasPremium } = usePremium();

  const handleRemoveFavorite = async (recipeId) => {
    await removeFromFavorites(recipeId);
  };

  const renderRecipeItem = ({ item: recipe }) => {
    const isLocked = !recipe.isFree && !hasPremium;

    // Рендер названия с блюром если заблокировано
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
        style={styles.recipeCard}
        activeOpacity={0.8}
        onPress={() => navigation.navigate('RecipeDetail', { recipe })}
      >
        <Image
          source={getRecipeImage(recipe.id)}
          style={styles.cardImage}
          resizeMode="cover"
        />

        {/* Замок для премиум рецептов */}
        {isLocked && (
          <View style={styles.lockBadge}>
            <EmojiText style={styles.lockIcon}>🔒</EmojiText>
          </View>
        )}

        {/* Кнопка удаления из избранного */}
        <TouchableOpacity 
          style={styles.removeButton}
          onPress={(e) => {
            e.stopPropagation();
            handleRemoveFavorite(recipe.id);
          }}
        >
          <EmojiText style={styles.removeIcon}>❤️</EmojiText>
        </TouchableOpacity>

        <View style={styles.recipeInfo}>
          {renderRecipeName()}

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
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <EmojiText style={styles.emptyIcon}>❤️</EmojiText>
      <Text style={styles.emptyTitle}>
        {t('favoritesEmpty', language)}
      </Text>
      <Text style={styles.emptyText}>
        {t('favoritesEmptyHint', language)}
      </Text>
      <TouchableOpacity
        style={styles.goToRecipesButton}
        onPress={() => navigation.navigate('Home')}
      >
        <Text style={styles.goToRecipesText}>
          {t('goToRecipes', language)}
        </Text>
      </TouchableOpacity>
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

        <Text style={styles.headerTitle}>
          {t('favorites', language)}
        </Text>

        <View style={styles.headerRight}>
          {favorites.length > 0 && (
            <Text style={styles.countBadge}>{favorites.length}</Text>
          )}
        </View>
      </View>

      {/* Сетка избранных рецептов */}
      {favorites.length > 0 ? (
        <FlatList
          data={favorites}
          renderItem={renderRecipeItem}
          keyExtractor={(item) => item.id}
          numColumns={2}
          contentContainerStyle={styles.listContent}
          columnWrapperStyle={styles.columnWrapper}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        renderEmptyState()
      )}
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
  headerRight: {
    width: 40,
    alignItems: 'flex-end',
  },
  countBadge: {
    backgroundColor: COLORS.primary,
    color: COLORS.textWhite,
    fontSize: SIZES.caption,
    fontWeight: 'bold',
    paddingHorizontal: SPACING.s,
    paddingVertical: 2,
    borderRadius: 10,
    overflow: 'hidden',
    minWidth: 24,
    textAlign: 'center',
  },
  listContent: {
    padding: SPACING.m,
  },
  columnWrapper: {
    justifyContent: 'space-between',
    marginBottom: SPACING.m,
  },
  recipeCard: {
    width: CARD_WIDTH,
    backgroundColor: COLORS.background,
    borderRadius: SIZES.radiusLarge,
    overflow: 'hidden',
    ...SHADOWS.medium,
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
  removeButton: {
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
  removeIcon: {
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
  metaRow: {
    flexDirection: 'row',
    gap: SPACING.m,
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  emptyIcon: {
    fontSize: 80,
    marginBottom: SPACING.l,
  },
  emptyTitle: {
    fontSize: SIZES.h3,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.s,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: SIZES.body,
    color: COLORS.textLight,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: SPACING.xl,
  },
  goToRecipesButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.m,
    paddingHorizontal: SPACING.xl,
    borderRadius: SIZES.radius,
  },
  goToRecipesText: {
    fontSize: SIZES.body,
    fontWeight: '600',
    color: COLORS.textWhite,
  },
});

export default FavoritesScreen;