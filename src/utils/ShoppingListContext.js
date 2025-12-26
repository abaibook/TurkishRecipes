// src/utils/ShoppingListContext.js
import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ShoppingListContext = createContext();

export const ShoppingListProvider = ({ children }) => {
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadShoppingList();
  }, []);

  const loadShoppingList = async () => {
    try {
      const data = await AsyncStorage.getItem('shoppingList');
      if (data) {
        setItems(JSON.parse(data));
      }
    } catch (error) {
      console.error('Error loading shopping list:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveShoppingList = async (newItems) => {
    try {
      await AsyncStorage.setItem('shoppingList', JSON.stringify(newItems));
    } catch (error) {
      console.error('Error saving shopping list:', error);
    }
  };

  const addItem = async (name, amount, recipeId = null, recipeName = null) => {
    const newItem = {
      id: Date.now().toString(),
      name,
      amount,
      checked: false,
      recipeId,
      recipeName,
      addedAt: new Date().toISOString(),
    };
    const newItems = [...items, newItem];
    setItems(newItems);
    await saveShoppingList(newItems);
    return newItem;
  };

  const addIngredientsFromRecipe = async (ingredients, recipeId, recipeName) => {
    const newItems = ingredients.map(ing => ({
      id: `${Date.now()}_${Math.random()}`,
      name: ing.name,
      amount: ing.amount,
      checked: false,
      recipeId,
      recipeName,
      addedAt: new Date().toISOString(),
    }));
    const updatedItems = [...items, ...newItems];
    setItems(updatedItems);
    await saveShoppingList(updatedItems);
    return newItems.length;
  };

  const toggleItem = async (itemId) => {
    const newItems = items.map(item =>
      item.id === itemId ? { ...item, checked: !item.checked } : item
    );
    setItems(newItems);
    await saveShoppingList(newItems);
  };

  const removeItem = async (itemId) => {
    const newItems = items.filter(item => item.id !== itemId);
    setItems(newItems);
    await saveShoppingList(newItems);
  };

  const clearAll = async () => {
    setItems([]);
    await AsyncStorage.removeItem('shoppingList');
  };

  const clearChecked = async () => {
    const newItems = items.filter(item => !item.checked);
    setItems(newItems);
    await saveShoppingList(newItems);
  };

  const getItemsByRecipe = () => {
    const grouped = {};
    items.forEach(item => {
      if (item.recipeId) {
        if (!grouped[item.recipeId]) {
          grouped[item.recipeId] = {
            recipeName: item.recipeName,
            items: [],
          };
        }
        grouped[item.recipeId].items.push(item);
      } else {
        if (!grouped['custom']) {
          grouped['custom'] = {
            recipeName: 'Добавлено вручную',
            items: [],
          };
        }
        grouped['custom'].items.push(item);
      }
    });
    return grouped;
  };

  return (
    <ShoppingListContext.Provider
      value={{
        items,
        isLoading,
        addItem,
        addIngredientsFromRecipe,
        toggleItem,
        removeItem,
        clearAll,
        clearChecked,
        getItemsByRecipe,
      }}
    >
      {children}
    </ShoppingListContext.Provider>
  );
};

export const useShoppingList = () => {
  const context = useContext(ShoppingListContext);
  if (!context) {
    throw new Error('useShoppingList must be used within ShoppingListProvider');
  }
  return context;
};