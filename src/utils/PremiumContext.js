// src/utils/PremiumContext.js
import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import Purchases, { LOG_LEVEL } from 'react-native-purchases';

const PremiumContext = createContext();

// API ключи из RevenueCat Dashboard
const REVENUE_CAT_API_KEY = Platform.select({
  ios: 'appl_yzDDiVxmnQiOsGQRPOyPHxWcUZJ',
  android: 'goog_DyzrRWypNOQmqsYqxbJJhDZKtht',
});

// Имя entitlement из RevenueCat Dashboard
const ENTITLEMENT_ID = 'Turkish Recipes Pro'; // Точно как в Dashboard!

export const PremiumProvider = ({ children }) => {
  const [hasPremium, setHasPremium] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [products, setProducts] = useState([]);

  useEffect(() => {
    initRevenueCat();
  }, []);

  const initRevenueCat = async () => {
    try {
      console.log('🔌 Initializing RevenueCat...');
      
      // Включить детальные логи (для разработки)
      Purchases.setLogLevel(LOG_LEVEL.VERBOSE);
      
      // Инициализация
      await Purchases.configure({ apiKey: REVENUE_CAT_API_KEY });
      console.log('✅ RevenueCat initialized');

      // Проверить статус premium
      await checkPremiumStatus();

      // Загрузить продукты
      await loadProducts();

    } catch (error) {
      console.error('❌ RevenueCat init error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const checkPremiumStatus = async () => {
    try {
      const customerInfo = await Purchases.getCustomerInfo();
      console.log('📊 Customer info:', customerInfo);
      
      // Проверяем entitlement "Turkish Recipes Pro"
      const isPremium = typeof customerInfo.entitlements.active[ENTITLEMENT_ID] !== 'undefined';
      
      setHasPremium(isPremium);
      
      if (isPremium) {
        await AsyncStorage.setItem('hasPremium', 'true');
        console.log('✅ User has premium access');
      } else {
        console.log('ℹ️ User does not have premium');
      }
    } catch (error) {
      console.error('❌ Error checking premium status:', error);
    }
  };

  const loadProducts = async () => {
    try {
      console.log('🔍 Loading products...');
      
      const offerings = await Purchases.getOfferings();
      console.log('📦 Offerings:', offerings);
      
      if (offerings.current && offerings.current.availablePackages.length > 0) {
        const packages = offerings.current.availablePackages;
        console.log('✅ Available packages:', packages.length);
        
        // Конвертируем в формат для UI
        const productsForUI = packages.map(pkg => {
          console.log('💰 Package:', {
            identifier: pkg.identifier,
            product: pkg.product.identifier,
            title: pkg.product.title,
            price: pkg.product.priceString,
          });
          
          return {
            productId: pkg.product.identifier,
            title: pkg.product.title,
            description: pkg.product.description,
            price: pkg.product.price,
            localizedPrice: pkg.product.priceString,
            currency: pkg.product.currencyCode,
            packageIdentifier: pkg.identifier, // Сохраняем для покупки
          };
        });
        
        setProducts(productsForUI);
        console.log('✅ Products loaded for UI');
      } else {
        console.warn('⚠️ No offerings found. Check RevenueCat Dashboard.');
      }
    } catch (error) {
      console.error('❌ Error loading products:', error);
    }
  };

  const purchasePremium = async () => {
    try {
      console.log('🛒 Starting purchase...');
      
      if (!products || products.length === 0) {
        throw new Error('No products available');
      }
      
      // Получаем offerings заново для актуального packageToPurchase
      const offerings = await Purchases.getOfferings();
      
      if (!offerings.current || offerings.current.availablePackages.length === 0) {
        throw new Error('No offerings available');
      }
      
      const packageToPurchase = offerings.current.availablePackages[0];
      console.log('💳 Purchasing package:', packageToPurchase.identifier);
      
      // Покупка
      const { customerInfo } = await Purchases.purchasePackage(packageToPurchase);
      console.log('📊 Purchase result:', customerInfo);
      
      // Проверяем результат
      const isPremium = typeof customerInfo.entitlements.active[ENTITLEMENT_ID] !== 'undefined';
      
      if (isPremium) {
        setHasPremium(true);
        await AsyncStorage.setItem('hasPremium', 'true');
        console.log('✅ Purchase successful! Premium activated.');
        return { success: true };
      } else {
        console.warn('⚠️ Purchase completed but premium not active');
        return { success: false, error: 'Premium not activated' };
      }
      
    } catch (error) {
      console.error('❌ Purchase error:', error);
      
      if (error.userCancelled) {
        console.log('ℹ️ User cancelled purchase');
        return { success: false, cancelled: true };
      }
      
      return { success: false, error: error.message };
    }
  };

  const restorePurchases = async () => {
    try {
      console.log('🔄 Restoring purchases...');
      
      const customerInfo = await Purchases.restorePurchases();
      const isPremium = typeof customerInfo.entitlements.active[ENTITLEMENT_ID] !== 'undefined';
      
      if (isPremium) {
        setHasPremium(true);
        await AsyncStorage.setItem('hasPremium', 'true');
        console.log('✅ Purchases restored');
        return { success: true, message: 'Покупка восстановлена' };
      } else {
        console.log('ℹ️ No purchases to restore');
        return { success: false, message: 'Покупки не найдены' };
      }
    } catch (error) {
      console.error('❌ Restore error:', error);
      return { success: false, error: error.message };
    }
  };

  const resetPremium = async () => {
    try {
      await AsyncStorage.removeItem('hasPremium');
      setHasPremium(false);
      console.log('🔄 Premium reset (local only)');
    } catch (error) {
      console.error('Error resetting premium:', error);
    }
  };

  return (
    <PremiumContext.Provider
      value={{
        hasPremium,
        isLoading,
        products,
        purchasePremium,
        restorePurchases,
        resetPremium,
      }}
    >
      {children}
    </PremiumContext.Provider>
  );
};

export const usePremium = () => {
  const context = useContext(PremiumContext);
  if (!context) {
    throw new Error('usePremium must be used within PremiumProvider');
  }
  return context;
};