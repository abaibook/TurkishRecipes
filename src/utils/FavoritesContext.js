// src/utils/FavoritesContext.js
import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const FavoritesContext = createContext();

export const FavoritesProvider = ({ children }) => {
  const [favorites, setFavorites] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Загружаем избранное при старте
  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    try {
      const favoritesData = await AsyncStorage.getItem('favorites');
      if (favoritesData) {
        setFavorites(JSON.parse(favoritesData));
      }
    } catch (error) {
      console.error('Error loading favorites:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveFavorites = async (newFavorites) => {
    try {
      await AsyncStorage.setItem('favorites', JSON.stringify(newFavorites));
    } catch (error) {
      console.error('Error saving favorites:', error);
    }
  };

  const isFavorite = (recipeId) => {
    return favorites.some(fav => fav.id === recipeId);
  };

  const addToFavorites = async (recipe) => {
    const newFavorites = [...favorites, recipe];
    setFavorites(newFavorites);
    await saveFavorites(newFavorites);
    return true;
  };

  const removeFromFavorites = async (recipeId) => {
    const newFavorites = favorites.filter(fav => fav.id !== recipeId);
    setFavorites(newFavorites);
    await saveFavorites(newFavorites);
    return true;
  };

  const toggleFavorite = async (recipe) => {
    if (isFavorite(recipe.id)) {
      await removeFromFavorites(recipe.id);
      return false; // Removed
    } else {
      await addToFavorites(recipe);
      return true; // Added
    }
  };

  const clearFavorites = async () => {
    try {
      await AsyncStorage.removeItem('favorites');
      setFavorites([]);
    } catch (error) {
      console.error('Error clearing favorites:', error);
    }
  };

  return (
    <FavoritesContext.Provider
      value={{
        favorites,
        isLoading,
        isFavorite,
        addToFavorites,
        removeFromFavorites,
        toggleFavorite,
        clearFavorites,
      }}
    >
      {children}
    </FavoritesContext.Provider>
  );
};

// Hook для использования в компонентах
export const useFavorites = () => {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error('useFavorites must be used within FavoritesProvider');
  }
  return context;
};