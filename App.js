// App.js
import 'react-native-gesture-handler'; // ЭТО ДОЛЖНО БЫТЬ САМОЙ ПЕРВОЙ СТРОКОЙ!
import React from 'react';
import { StatusBar } from 'react-native';
import { LanguageProvider } from './src/utils/LanguageContext';
import { PremiumProvider } from './src/utils/PremiumContext';
import { FavoritesProvider } from './src/utils/FavoritesContext';
import { ShoppingListProvider } from './src/utils/ShoppingListContext';
import AppNavigator from './src/navigation/AppNavigator';

export default function App() {
  return (
    <LanguageProvider>
      <PremiumProvider>
        <FavoritesProvider>
          <ShoppingListProvider>
            <StatusBar barStyle="light-content" backgroundColor="#C1272D" />
            <AppNavigator />
          </ShoppingListProvider>
        </FavoritesProvider>
      </PremiumProvider>
    </LanguageProvider>
  );
}