// src/navigation/AppNavigator.js
import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Импортируем экраны
import SplashScreen from '../screens/SplashScreen';
import LanguageSelectionScreen from '../screens/LanguageSelectionScreen';
import OnboardingScreen from '../screens/OnboardingScreen';
import HomeScreen from '../screens/HomeScreen';
import RecipeDetailScreen from '../screens/RecipeDetailScreen';
import RecipeListScreen from '../screens/RecipeListScreen';
import SearchScreen from '../screens/SearchScreen';
import FavoritesScreen from '../screens/FavoritesScreen';
import PremiumScreen from '../screens/PremiumScreen';
import ShoppingListScreen from '../screens/ShoppingListScreen';
import SettingsScreen from '../screens/SettingsScreen';
import PrivacyPolicyScreen from '../screens/PrivacyPolicyScreen';
import RefundPolicyScreen from '../screens/RefundPolicyScreen';

const Stack = createStackNavigator();

const AppNavigator = () => {
  const [initialRoute, setInitialRoute] = useState('Splash');
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    checkOnboardingStatus();
  }, []);

  const checkOnboardingStatus = async () => {
    try {
      // ВРЕМЕННО - для тестирования onboarding
      // Раскомментируйте эти 2 строки, чтобы сбросить и увидеть splash/onboarding
        // await AsyncStorage.removeItem('hasSeenOnboarding');
        // await AsyncStorage.removeItem('selectedLanguage');
      
      const hasSeenOnboarding = await AsyncStorage.getItem('hasSeenOnboarding');
      const selectedLanguage = await AsyncStorage.getItem('selectedLanguage');
      
      console.log('Onboarding status:', hasSeenOnboarding);
      console.log('Selected language:', selectedLanguage);
      
      if (hasSeenOnboarding === 'true' && selectedLanguage) {
        setInitialRoute('Home');
      } else {
        setInitialRoute('Splash');
      }
    } catch (error) {
      console.error('Error checking onboarding status:', error);
    } finally {
      setIsReady(true);
    }
  };

  if (!isReady) {
    return null;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName={initialRoute}
        screenOptions={{
          headerShown: false,
          cardStyle: { backgroundColor: '#FFFFFF' },
        }}
      >
        <Stack.Screen name="Splash" component={SplashScreen} />
        <Stack.Screen name="LanguageSelection" component={LanguageSelectionScreen} />
        <Stack.Screen name="Onboarding" component={OnboardingScreen} />
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="RecipeDetail" component={RecipeDetailScreen} />
        <Stack.Screen name="RecipeList" component={RecipeListScreen} />
        <Stack.Screen name="Search" component={SearchScreen} />
        <Stack.Screen name="Favorites" component={FavoritesScreen} />
        <Stack.Screen name="Premium" component={PremiumScreen} />
        <Stack.Screen name="ShoppingList" component={ShoppingListScreen} />
        <Stack.Screen name="Settings" component={SettingsScreen} />
        <Stack.Screen 
              name="PrivacyPolicy" 
              component={PrivacyPolicyScreen} 
              options={{ headerShown: false }}
            />
            <Stack.Screen 
              name="RefundPolicy" 
              component={RefundPolicyScreen} 
              options={{ headerShown: false }}
            />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;