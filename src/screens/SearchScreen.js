// src/screens/SearchScreen.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  Image,
  ScrollView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLanguage } from '../utils/LanguageContext';
import { usePremium } from '../utils/PremiumContext';
import { COLORS, SIZES, SPACING, SHADOWS } from '../constants/theme';
import { t } from '../constants/translations';
import mockData from '../data/mockRecipes.json';
import { getRecipeImage } from '../utils/recipeImages';

const SearchScreen = ({ navigation }) => {
  const { language } = useLanguage();
  const { hasPremium } = usePremium();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [recentSearches, setRecentSearches] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  // Популярные запросы
  const popularSearches = [
    { ru: 'манты', kk: 'манты', en: 'manti' },
    { ru: 'кебаб', kk: 'кебаб', en: 'kebab' },
    { ru: 'пахлава', kk: 'пахлава', en: 'baklava' },
    { ru: 'гёзлеме', kk: 'гөзлеме', en: 'gözleme' },
  ];

  // Загружаем историю поиска
  useEffect(() => {
    loadRecentSearches();
  }, []);

  const loadRecentSearches = async () => {
    try {
      const searches = await AsyncStorage.getItem('recentSearches');
      if (searches) {
        setRecentSearches(JSON.parse(searches));
      }
    } catch (error) {
      console.error('Error loading recent searches:', error);
    }
  };

  const saveRecentSearch = async (query) => {
    try {
      const updated = [query, ...recentSearches.filter(s => s !== query)].slice(0, 5);
      await AsyncStorage.setItem('recentSearches', JSON.stringify(updated));
      setRecentSearches(updated);
    } catch (error) {
      console.error('Error saving search:', error);
    }
  };

  const clearRecentSearches = async () => {
    try {
      await AsyncStorage.removeItem('recentSearches');
      setRecentSearches([]);
    } catch (error) {
      console.error('Error clearing searches:', error);
    }
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
    
    if (query.trim().length === 0) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const lowerQuery = query.toLowerCase();

    // Поиск по рецептам
    const foundRecipes = mockData.recipes.filter(recipe => {
      // Поиск по названию
      const nameMatch = recipe.name[language].toLowerCase().includes(lowerQuery);
      
      // Поиск по описанию
      const descMatch = recipe.description[language].toLowerCase().includes(lowerQuery);
      
      // Поиск по ингредиентам
      const ingredientsMatch = recipe.ingredients[language].some(ing =>
        ing.name.toLowerCase().includes(lowerQuery)
      );

      return nameMatch || descMatch || ingredientsMatch;
    });

    setSearchResults(foundRecipes);
  };

  const handleSearchSubmit = () => {
    if (searchQuery.trim()) {
      saveRecentSearch(searchQuery.trim());
    }
  };

  const handlePopularSearch = (query) => {
    setSearchQuery(query);
    handleSearch(query);
    saveRecentSearch(query);
  };

  const renderRecipeResult = ({ item: recipe }) => {
    const isLocked = !recipe.isFree && !hasPremium;

    return (
      <TouchableOpacity
        style={styles.resultCard}
        activeOpacity={0.8}
        onPress={() => {
          navigation.navigate('RecipeDetail', { recipe });
        }}
      >
        <Image
          source={getRecipeImage(recipe.id)}
          style={styles.resultImage}
          resizeMode="cover"
        />

        {isLocked && (
          <View style={styles.lockBadge}>
            <Text style={styles.lockIcon}>🔒</Text>
          </View>
        )}

        <View style={styles.resultInfo}>
          <Text style={styles.resultName} numberOfLines={2}>
            {recipe.name[language]}
          </Text>
          
          <View style={styles.resultMeta}>
            <View style={styles.metaItem}>
              <Text style={styles.metaIcon}>⭐</Text>
              <Text style={styles.metaText}>{recipe.rating}</Text>
            </View>
            <View style={styles.metaItem}>
              <Text style={styles.metaIcon}>🕐</Text>
              <Text style={styles.metaText}>
                {recipe.cookTime} {t('minutes', language)}
              </Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => {
    if (!isSearching) {
      return (
        <View style={styles.emptyContainer}>
          {/* Популярные запросы */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              🔥 {t('popularSearches', language)}
            </Text>
            <View style={styles.chipsContainer}>
              {popularSearches.map((search, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.chip}
                  onPress={() => handlePopularSearch(search[language])}
                >
                  <Text style={styles.chipText}>{search[language]}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Недавние поиски */}
          {recentSearches.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>
                  🕐 {t('recent', language)}
                </Text>
                <TouchableOpacity onPress={clearRecentSearches}>
                  <Text style={styles.clearText}>{t('clear', language)}</Text>
                </TouchableOpacity>
              </View>
              {recentSearches.map((search, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.recentItem}
                  onPress={() => handlePopularSearch(search)}
                >
                  <Text style={styles.recentIcon}>🔍</Text>
                  <Text style={styles.recentText}>{search}</Text>
                  <TouchableOpacity
                    onPress={() => {
                      const updated = recentSearches.filter(s => s !== search);
                      setRecentSearches(updated);
                      AsyncStorage.setItem('recentSearches', JSON.stringify(updated));
                    }}
                  >
                    <Text style={styles.removeIcon}>✕</Text>
                  </TouchableOpacity>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      );
    }

    if (searchResults.length === 0) {
      return (
        <View style={styles.noResultsContainer}>
          <Text style={styles.noResultsIcon}>🔍</Text>
          <Text style={styles.noResultsTitle}>
            {t('noResultsFound', language)}
          </Text>
          <Text style={styles.noResultsText}>
            {t('noResultsDescription', language)}
          </Text>
        </View>
      );
    }

    return null;
  };

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

        <View style={styles.searchContainer}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder={t('searchRecipes', language)}
            placeholderTextColor={COLORS.textLight}
            value={searchQuery}
            onChangeText={handleSearch}
            onSubmitEditing={handleSearchSubmit}
            autoFocus={true}
            returnKeyType="search"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity
              onPress={() => {
                setSearchQuery('');
                setSearchResults([]);
                setIsSearching(false);
              }}
            >
              <Text style={styles.clearIcon}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Результаты или пустое состояние */}
      {searchResults.length > 0 ? (
        <View style={styles.resultsContainer}>
          <Text style={styles.resultsCount}>
            {t('recipesFound', language)}: {searchResults.length}
          </Text>
          <FlatList
            data={searchResults}
            renderItem={renderRecipeResult}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {renderEmptyState()}
        </ScrollView>
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
    paddingHorizontal: SPACING.m,
    paddingTop: 50,
    paddingBottom: SPACING.m,
    backgroundColor: COLORS.background,
    ...SHADOWS.small,
    gap: SPACING.s,
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
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.backgroundGray,
    borderRadius: SIZES.radius,
    paddingHorizontal: SPACING.m,
    height: 48,
    gap: SPACING.s,
  },
  searchIcon: {
    fontSize: 18,
  },
  searchInput: {
    flex: 1,
    fontSize: SIZES.body,
    color: COLORS.text,
    padding: 0,
  },
  clearIcon: {
    fontSize: 20,
    color: COLORS.textLight,
  },
  scrollContent: {
    flexGrow: 1,
  },
  emptyContainer: {
    padding: SPACING.l,
  },
  section: {
    marginBottom: SPACING.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.m,
  },
  sectionTitle: {
    fontSize: SIZES.h4,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.m,
  },
  clearText: {
    fontSize: SIZES.bodySmall,
    color: COLORS.primary,
    fontWeight: '600',
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.s,
  },
  chip: {
    backgroundColor: COLORS.backgroundGray,
    paddingHorizontal: SPACING.m,
    paddingVertical: SPACING.s,
    borderRadius: SIZES.radiusLarge,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  chipText: {
    fontSize: SIZES.bodySmall,
    color: COLORS.text,
  },
  recentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.m,
    gap: SPACING.m,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider,
  },
  recentIcon: {
    fontSize: 16,
  },
  recentText: {
    flex: 1,
    fontSize: SIZES.body,
    color: COLORS.text,
  },
  removeIcon: {
    fontSize: 18,
    color: COLORS.textLight,
    padding: SPACING.s,
  },
  noResultsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
    paddingTop: 100,
  },
  noResultsIcon: {
    fontSize: 80,
    marginBottom: SPACING.l,
    opacity: 0.3,
  },
  noResultsTitle: {
    fontSize: SIZES.h3,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.s,
    textAlign: 'center',
  },
  noResultsText: {
    fontSize: SIZES.body,
    color: COLORS.textLight,
    textAlign: 'center',
    lineHeight: 24,
  },
  resultsContainer: {
    flex: 1,
  },
  resultsCount: {
    fontSize: SIZES.bodySmall,
    color: COLORS.textLight,
    paddingHorizontal: SPACING.m,
    paddingVertical: SPACING.s,
  },
  listContent: {
    padding: SPACING.m,
  },
  resultCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.background,
    borderRadius: SIZES.radius,
    marginBottom: SPACING.m,
    overflow: 'hidden',
    ...SHADOWS.medium,
  },
  resultImage: {
    width: 100,
    height: 100,
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
  resultInfo: {
    flex: 1,
    padding: SPACING.m,
    justifyContent: 'center',
  },
  resultName: {
    fontSize: SIZES.body,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.s,
  },
  resultMeta: {
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
});

export default SearchScreen;