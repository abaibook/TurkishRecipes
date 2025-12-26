// src/screens/RecipeDetailScreen.js
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Alert,
  Share,
} from 'react-native';
import { useLanguage } from '../utils/LanguageContext';
import { usePremium } from '../utils/PremiumContext';
import { useFavorites } from '../utils/FavoritesContext';
import { useShoppingList } from '../utils/ShoppingListContext';
import { COLORS, SIZES, SPACING, SHADOWS } from '../constants/theme';
import { t } from '../constants/translations';
import { getRecipeImage } from '../utils/recipeImages';
import { EmojiText } from '../components/EmojiText';
import { usePremiumPrice } from '../utils/usePremiumPrice';

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
          >
            {children}
          </Text>
        ))
      )}
      <Text style={[style, { color: color, opacity: 0.2 }]}>
        {children}
      </Text>
    </View>
  );
};



const RecipeDetailScreen = ({ route, navigation }) => {
  const { recipe } = route.params;
  const { language } = useLanguage();
  const { hasPremium } = usePremium();
  const { isFavorite, toggleFavorite } = useFavorites();
  const { addIngredientsFromRecipe } = useShoppingList();
  const [activeTab, setActiveTab] = useState('ingredients');
  const { price } = usePremiumPrice();

  const isLocked = !recipe.isFree && !hasPremium;

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'easy': return COLORS.difficultyEasy;
      case 'medium': return COLORS.difficultyMedium;
      case 'hard': return COLORS.difficultyHard;
      default: return COLORS.textLight;
    }
  };

  const renderStars = (rating) => {
    const fullStars = Math.floor(rating);
    const stars = [];
    for (let i = 0; i < 5; i++) {
      stars.push(
        <EmojiText key={i} style={styles.star}>
          {i < fullStars ? '⭐' : '☆'}
        </EmojiText>
      );
    }
    return stars;
  };

  // Функция для поделиться рецептом в сторис
  const handleShareToStory = async () => {
    try {
      const recipeName = recipe.name[language];
      const appName = 'Turkish Recipes';
      
      const messages = {
        ru: `Я готовлю "${recipeName}" в приложении ${appName}! 🍳`,
        kk: `Мен "${recipeName}" тағамын ${appName} қолданбасында дайындап жатырмын! 🍳`,
        en: `I'm cooking "${recipeName}" on ${appName} app! 🍳`,
      };

      const result = await Share.share({
        message: messages[language],
        title: recipeName,
      });

      if (result.action === Share.sharedAction) {
        if (result.activityType) {
          console.log('Shared via:', result.activityType);
        } else {
          console.log('Shared successfully');
        }
      }
    } catch (error) {
      Alert.alert(t('error', language), error.message);
    }
  };

  const renderIngredients = () => {
    const ingredients = recipe.ingredients[language] || recipe.ingredients.ru || [];

    return (
      <View style={styles.tabContent}>
        {ingredients.map((item, index) => (
          <View key={index} style={styles.ingredientItem}>
            <Text style={styles.ingredientBullet}>☐</Text>
            <Text style={styles.ingredientText}>
              {item.name} - {item.amount}
            </Text>
          </View>
        ))}
        
        <TouchableOpacity 
          style={styles.addToListButton}
          onPress={async () => {
            const ingredientsToAdd = recipe.ingredients[language] || recipe.ingredients.ru || [];
            const recipeName = recipe.name[language] || recipe.name.ru || '';
            
            const count = await addIngredientsFromRecipe(
              ingredientsToAdd,
              recipe.id,
              recipeName
            );
            Alert.alert(
              t('done', language),
              `${count} ${t('ingredientsAdded', language)}`,
              [
                { text: t('ok', language) },
                {
                  text: t('goToList', language),
                  onPress: () => navigation.navigate('ShoppingList'),
                },
              ]
            );
          }}
        >
          <Text style={styles.addToListIcon}>📋</Text>
          <Text style={styles.addToListText}>
            {t('addToShoppingList', language)}
          </Text>
        </TouchableOpacity>
      </View>
    );
    
  };

  const renderInstructions = () => {
    const instructions = recipe.instructions[language] || recipe.instructions.ru || [];

    return (
      <View style={styles.tabContent}>
        {instructions.map((step) => (
          <View key={step.step} style={styles.stepCard}>
            <View style={styles.stepHeader}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>{step.step}</Text>
              </View>
              <Text style={styles.stepTitle}>{step.title || ''}</Text>
            </View>
            <Text style={styles.stepDescription}>{step.description || ''}</Text>
            {step.time && (
              <View style={styles.stepTime}>
                <EmojiText style={styles.stepTimeIcon}>⏱️</EmojiText>
                <Text style={styles.stepTimeText}>
                  {step.time} {t('minutes', language)}
                </Text>
              </View>
            )}
          </View>
        ))}
      </View>
    );
  };

  const renderChefTips = () => {
    const tips = recipe.chefTips?.[language] || recipe.chefTips?.ru || [];

    if (tips.length === 0) {
      return (
        <View style={[styles.tabContent, styles.tipsContainer]}>
          <Text style={styles.noTipsText}>{t('noTips', language)}</Text>
        </View>
      );
    }

    return (
      <View style={[styles.tabContent, styles.tipsContainer]}>
        <View style={styles.tipsHeader}>
          <EmojiText style={styles.tipsHeaderIcon}>👨‍🍳</EmojiText>
          <Text style={styles.tipsHeaderText}>
            {t('chefTips', language)}
          </Text>
        </View>

        {tips.map((tip, index) => (
          <View key={index} style={styles.tipItem}>
            <EmojiText style={styles.tipIcon}>💡</EmojiText>
            <Text style={styles.tipText}>{tip}</Text>
          </View>
        ))}
      </View>
    );
  };

const renderRecipeName = () => {
  const name = recipe.name[language] || recipe.name.ru || '';

  if (!isLocked) {
    // Открытый рецепт — обычный цвет текста
    return <Text style={styles.recipeName}>{name}</Text>;
  }

  // Заблокированный рецепт — размытый с другим цветом (например серый)
  return (
    <HeavyFakeBlurText style={styles.recipeName} blurColor="#dfdfdfff">
      {name}
    </HeavyFakeBlurText>
  );
};


  // Рендер описания с блюром для платных рецептов
  const renderDescription = () => {
    const description = recipe.description?.[language] || recipe.description?.ru || '';

    if (!isLocked) {
      return <Text style={styles.description}>{description}</Text>;
    }

    return (
        <HeavyFakeBlurText
          style={styles.description}
          blurColor="#dfdfdfff"> // здесь указываешь нужный цвет для заблокированного текста
          {description}
        </HeavyFakeBlurText>
      )
  };

  return (
    <View style={styles.container}>
      {/* Hero Image */}
      <View style={styles.heroContainer}>
        <Image
          source={getRecipeImage(recipe.id)}
          style={styles.recipeImage}
          resizeMode="cover"
        />
        
        {/* Header buttons */}
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>

        <View style={styles.headerButtons}>
          <TouchableOpacity 
            style={styles.headerButton}
            onPress={async () => {
              await toggleFavorite(recipe);
            }}
          >
            <EmojiText style={styles.headerButtonIcon}>
              {isFavorite(recipe.id) ? '❤️' : '🤍'}
            </EmojiText>
          </TouchableOpacity>
          
          {/* Кнопка поделиться в сторис */}
          <TouchableOpacity 
            style={styles.headerButton}
            onPress={handleShareToStory}
          >
            <Text style={styles.headerButtonIcon}>📤</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Recipe Info */}
        <View style={styles.infoSection}>
          {/* Название с блюром если заблокировано */}
          {renderRecipeName()}
          
          <View style={styles.ratingRow}>
            <View style={styles.starsContainer}>
              {renderStars(recipe.rating)}
            </View>
            <Text style={styles.ratingText}>{recipe.rating}</Text>
          </View>

          {/* Описание с блюром если заблокировано */}
          {renderDescription()}

          {/* Meta info */}
          <View style={styles.metaContainer}>
            <View style={styles.metaItem}>
              <Text style={styles.metaIcon}>🕐</Text>
              <Text style={styles.metaLabel}>{recipe.cookTime} {t('minutes', language)}</Text>
            </View>
            <View style={styles.metaItem}>
              <Text style={styles.metaIcon}>👤</Text>
              <Text style={styles.metaLabel}>{recipe.servings} {t('servings', language)}</Text>
            </View>
            <View style={styles.metaItem}>
              <View style={[
                styles.difficultyBadge,
                { backgroundColor: getDifficultyColor(recipe.difficulty) }
              ]}>
                <Text style={styles.difficultyText}>
                  {t(recipe.difficulty, language)}
                </Text>
              </View>
            </View>
          </View>

          {/* Карточка Premium если заблокировано - показываем после описания */}
          {isLocked && (
            <View style={styles.premiumCardInline}>
              <EmojiText style={styles.lockIcon}>🔒</EmojiText>
              <Text style={styles.lockTitle}>
                {t('unlockPremium', language)}
              </Text>
              <Text style={styles.lockSubtitle}>
                {t('unlockAllRecipes', language).replace('{total}', '116')}
              </Text>
              
              <TouchableOpacity 
                style={styles.premiumButton}
                onPress={() => navigation.navigate('Premium')}
              >
                <Text style={styles.premiumButtonText}>
                  {t('buyPremium', language)} - {price}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.restoreButton}
                onPress={() => {
                  Alert.alert(
                    t('restorePurchases', language),
                    t('noPurchasesFound', language)
                  );
                }}
              >
                <Text style={styles.restoreButtonText}>
                  {t('restorePurchases', language)}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Content Area - показываем только если не заблокировано */}
        {!isLocked && (
          <View style={styles.contentArea}>
            {/* Tabs */}
            <View style={styles.tabs}>
              <TouchableOpacity
                style={[styles.tab, activeTab === 'ingredients' && styles.tabActive]}
                onPress={() => setActiveTab('ingredients')}
              >
                <Text style={[
                  styles.tabText,
                  activeTab === 'ingredients' && styles.tabTextActive
                ]}>
                  {t('ingredients', language)}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.tab, activeTab === 'instructions' && styles.tabActive]}
                onPress={() => setActiveTab('instructions')}
              >
                <Text style={[
                  styles.tabText,
                  activeTab === 'instructions' && styles.tabTextActive
                ]}>
                  {t('instructions', language)}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.tab, activeTab === 'tips' && styles.tabActive]}
                onPress={() => setActiveTab('tips')}
              >
                <Text style={[
                  styles.tabText,
                  activeTab === 'tips' && styles.tabTextActive
                ]}>
                  {t('chefTips', language)}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Tab Content */}
            {activeTab === 'ingredients' && renderIngredients()}
            {activeTab === 'instructions' && renderInstructions()}
            {activeTab === 'tips' && renderChefTips()}
          </View>
        )}

        {/* Nutrition Info */}
        {!isLocked && recipe.nutrition && (
          <View style={styles.nutritionSection}>
            <Text style={styles.nutritionTitle}>
              📊 {t('nutrition', language)} ({t('perServing', language)})
            </Text>
            <View style={styles.nutritionGrid}>
              <View style={styles.nutritionItem}>
                <Text style={styles.nutritionValue}>{recipe.nutrition.calories}</Text>
                <Text style={styles.nutritionLabel}>{t('kcal', language)}</Text>
              </View>
              <View style={styles.nutritionItem}>
                <Text style={styles.nutritionValue}>{recipe.nutrition.protein}{t('grams', language)}</Text>
                <Text style={styles.nutritionLabel}>{t('protein', language)}</Text>
              </View>
              <View style={styles.nutritionItem}>
                <Text style={styles.nutritionValue}>{recipe.nutrition.fat}{t('grams', language)}</Text>
                <Text style={styles.nutritionLabel}>{t('fat', language)}</Text>
              </View>
              <View style={styles.nutritionItem}>
                <Text style={styles.nutritionValue}>{recipe.nutrition.carbs}{t('grams', language)}</Text>
                <Text style={styles.nutritionLabel}>{t('carbs', language)}</Text>
              </View>
            </View>
          </View>
        )}

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
  heroContainer: {
    height: 300,
    position: 'relative',
  },
  recipeImage: {
    width: '100%',
    height: '100%',
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: SPACING.m,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backIcon: {
    fontSize: 24,
    color: COLORS.textWhite,
  },
  headerButtons: {
    position: 'absolute',
    top: 50,
    right: SPACING.m,
    flexDirection: 'row',
    gap: SPACING.s,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerButtonIcon: {
    fontSize: 20,
  },
  content: {
    flex: 1,
  },
  infoSection: {
    padding: SPACING.l,
    backgroundColor: COLORS.background,
  },
  recipeNameContainer: {
    flexDirection: 'row',
    marginBottom: SPACING.s,
    flexWrap: 'wrap',
  },
  recipeName: {
    fontSize: SIZES.h2,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.m,
  },
  starsContainer: {
    flexDirection: 'row',
    marginRight: SPACING.s,
  },
  star: {
    fontSize: 16,
  },
  ratingText: {
    fontSize: SIZES.body,
    color: COLORS.text,
    fontWeight: '600',
  },
  description: {
    fontSize: SIZES.body,
    color: COLORS.textLight,
    lineHeight: 24,
    marginBottom: SPACING.l,
  },
  metaContainer: {
    flexDirection: 'row',
    gap: SPACING.l,
    marginBottom: SPACING.l,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  metaIcon: {
    fontSize: 20,
  },
  metaLabel: {
    fontSize: SIZES.bodySmall,
    color: COLORS.text,
  },
  difficultyBadge: {
    paddingHorizontal: SPACING.m,
    paddingVertical: SPACING.xs,
    borderRadius: SIZES.radiusSmall,
  },
  difficultyText: {
    fontSize: SIZES.caption,
    color: COLORS.textWhite,
    fontWeight: '600',
  },
  premiumCardInline: {
    backgroundColor: COLORS.backgroundGray,
    borderRadius: SIZES.radiusLarge,
    padding: SPACING.xl,
    alignItems: 'center',
    ...SHADOWS.medium,
  },
  lockIcon: {
    fontSize: 48,
    marginBottom: SPACING.m,
  },
  lockTitle: {
    fontSize: SIZES.h3,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.s,
    textAlign: 'center',
  },
  lockSubtitle: {
    fontSize: SIZES.body,
    color: COLORS.textLight,
    marginBottom: SPACING.l,
    textAlign: 'center',
  },
  premiumButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.m,
    paddingHorizontal: SPACING.xl,
    borderRadius: SIZES.radius,
    width: '100%',
    marginBottom: SPACING.m,
  },
  premiumButtonText: {
    fontSize: SIZES.body,
    fontWeight: 'bold',
    color: COLORS.textWhite,
    textAlign: 'center',
  },
  restoreButton: {
    paddingVertical: SPACING.s,
  },
  restoreButtonText: {
    fontSize: SIZES.bodySmall,
    color: COLORS.primary,
    textAlign: 'center',
  },
  contentArea: {
    minHeight: 400,
  },
  tabs: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    backgroundColor: COLORS.background,
  },
  tab: {
    flex: 1,
    paddingVertical: SPACING.m,
    alignItems: 'center',
  },
  tabActive: {
    borderBottomWidth: 3,
    borderBottomColor: COLORS.primary,
  },
  tabText: {
    fontSize: SIZES.bodySmall,
    color: COLORS.textLight,
    fontWeight: '500',
  },
  tabTextActive: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  tabContent: {
    padding: SPACING.l,
  },
  ingredientItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.s,
    gap: SPACING.m,
  },
  ingredientBullet: {
    fontSize: 18,
    color: COLORS.textLight,
  },
  ingredientText: {
    fontSize: SIZES.body,
    color: COLORS.text,
    flex: 1,
  },
  addToListButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    padding: SPACING.m,
    borderRadius: SIZES.radius,
    marginTop: SPACING.m,
    gap: SPACING.s,
  },
  addToListIcon: {
    fontSize: 20,
  },
  addToListText: {
    fontSize: SIZES.body,
    color: COLORS.textWhite,
    fontWeight: '600',
  },
  stepCard: {
    backgroundColor: COLORS.backgroundGray,
    padding: SPACING.m,
    borderRadius: SIZES.radius,
    marginBottom: SPACING.m,
  },
  stepHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.s,
    gap: SPACING.m,
  },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepNumberText: {
    fontSize: SIZES.body,
    fontWeight: 'bold',
    color: COLORS.textWhite,
  },
  stepTitle: {
    fontSize: SIZES.body,
    fontWeight: '600',
    color: COLORS.text,
    flex: 1,
  },
  stepDescription: {
    fontSize: SIZES.body,
    color: COLORS.text,
    lineHeight: 22,
    marginBottom: SPACING.s,
  },
  stepTime: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  stepTimeIcon: {
    fontSize: 14,
  },
  stepTimeText: {
    fontSize: SIZES.caption,
    color: COLORS.textLight,
  },
  tipsContainer: {
    backgroundColor: COLORS.cream,
  },
  tipsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.s,
    marginBottom: SPACING.l,
    paddingBottom: SPACING.m,
    borderBottomWidth: 2,
    borderBottomColor: COLORS.gold,
  },
  tipsHeaderIcon: {
    fontSize: 28,
  },
  tipsHeaderText: {
    fontSize: SIZES.h4,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  tipItem: {
    flexDirection: 'row',
    gap: SPACING.m,
    marginBottom: SPACING.m,
  },
  tipIcon: {
    fontSize: 20,
  },
  tipText: {
    flex: 1,
    fontSize: SIZES.body,
    color: COLORS.text,
    lineHeight: 22,
  },
  noTipsText: {
    fontSize: SIZES.body,
    color: COLORS.textLight,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  nutritionSection: {
    backgroundColor: COLORS.backgroundGray,
    padding: SPACING.l,
    marginHorizontal: SPACING.m,
    marginTop: SPACING.l,
    borderRadius: SIZES.radius,
  },
  nutritionTitle: {
    fontSize: SIZES.body,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.m,
  },
  nutritionGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  nutritionItem: {
    alignItems: 'center',
  },
  nutritionValue: {
    fontSize: SIZES.h4,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 4,
  },
  nutritionLabel: {
    fontSize: SIZES.caption,
    color: COLORS.textLight,
  },
  bottomSpacer: {
    height: SPACING.xl,
  },
});

export default RecipeDetailScreen;