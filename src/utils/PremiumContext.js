// src/utils/PremiumContext.js
import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import * as RNIap from 'react-native-iap';

const PremiumContext = createContext();

// ID продуктов
const PRODUCT_IDS = Platform.select({
  ios: ['premium-access'],
  android: ['premium-access'],
});

export const PremiumProvider = ({ children }) => {
  const [hasPremium, setHasPremium] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [products, setProducts] = useState([]);

  useEffect(() => {
    initIAP();
    
    return () => {
      // Очистка при размонтировании
      RNIap.endConnection();
    };
  }, []);

  const initIAP = async () => {
    try {
      // Подключаемся к магазину
      const isConnected = await RNIap.initConnection();
      console.log('✅ IAP Connected:', isConnected);

      // Загружаем статус премиума
      await loadPremiumStatus();

      // Загружаем продукты
      await loadProducts();

      // Проверяем существующие покупки
      await checkPurchases();

      // Слушаем обновления покупок
      const purchaseUpdateSubscription = RNIap.purchaseUpdatedListener(
        async (purchase) => {
          console.log('🔔 Purchase updated:', purchase);
          const receipt = purchase.transactionReceipt || purchase.purchaseToken;

          if (receipt) {
            try {
              // Завершаем покупку
              await RNIap.finishTransaction({ purchase, isConsumable: false });

              // Активируем премиум
              await AsyncStorage.setItem('hasPremium', 'true');
              setHasPremium(true);

              console.log('✅ Purchase completed!');
            } catch (error) {
              console.error('❌ Error finishing transaction:', error);
            }
          }
        }
      );

      const purchaseErrorSubscription = RNIap.purchaseErrorListener((error) => {
        console.warn('⚠️ Purchase error:', error);
      });

    } catch (error) {
      console.error('❌ IAP Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadPremiumStatus = async () => {
    try {
      const premiumStatus = await AsyncStorage.getItem('hasPremium');
      if (premiumStatus === 'true') {
        setHasPremium(true);
      }
    } catch (error) {
      console.error('Error loading premium status:', error);
    }
  };

const loadProducts = async () => {
  try {
    console.log('🔍 Step 1: Checking connection...');
    const isConnected = await RNIap.initConnection();
    console.log('🔌 Connection status:', isConnected);
    
    if (!isConnected) {
      console.error('❌ IAP not connected!');
      return;
    }
    
    console.log('🔍 Step 2: Loading products...');
    console.log('📦 Product IDs to load:', PRODUCT_IDS);
    
    const products = await RNIap.getProducts({ skus: PRODUCT_IDS });
    
    console.log('📦 Step 3: Products received:', products);
    console.log('📦 Number of products:', products ? products.length : 0);
    
    if (products && products.length > 0) {
      products.forEach((product, index) => {
        console.log(`💰 Product ${index + 1}:`, {
          productId: product.productId,
          title: product.title,
          price: product.localizedPrice,
          currency: product.currency,
        });
      });
      setProducts(products);
    } else {
      console.warn('⚠️ No products found!');
      console.warn('Check:');
      console.warn('1. Product ID in Google Play Console: premium-access');
      console.warn('2. App published to internal testing');
      console.warn('3. Test account added');
    }
    
  } catch (error) {
    console.error('❌ Error loading products:', error);
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);
  }
};

  const checkPurchases = async () => {
    try {
      const purchases = await RNIap.getAvailablePurchases();
      console.log('🔍 Available purchases:', purchases);

      if (purchases && purchases.length > 0) {
        const hasPurchased = purchases.some((purchase) =>
          PRODUCT_IDS.includes(purchase.productId)
        );

        if (hasPurchased) {
          await AsyncStorage.setItem('hasPremium', 'true');
          setHasPremium(true);
          console.log('✅ Premium restored from history');
        }
      }
    } catch (error) {
      console.error('Error checking purchases:', error);
    }
  };

const purchasePremium = async () => {
  try {
    console.log('🛒 Step 1: Starting purchase...');
    
    // Проверяем, что продукты загружены
    if (!products || products.length === 0) {
      console.warn('⚠️ Products not loaded, loading now...');
      await loadProducts();
      
      // Ждем 2 секунды для загрузки
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
    
    console.log('📦 Step 2: Current products:', products);
    
    if (!products || products.length === 0) {
      throw new Error('No products available. Check Google Play Console.');
    }
    
    const productId = products[0].productId;
    console.log('💳 Step 3: Purchasing product:', productId);
    console.log('💰 Product details:', products[0]);

    await RNIap.requestPurchase({ 
      sku: productId,
    });

    console.log('✅ Purchase request sent successfully');
    return { success: true };

  } catch (error) {
    console.error('❌ Error purchasing:', error);
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);

    if (error.code === 'E_USER_CANCELLED') {
      return { success: false, cancelled: true };
    }

    return { success: false, error: error.message || 'Unknown error' };
  }
};

  const restorePurchases = async () => {
    try {
      console.log('🔄 Restoring purchases...');

      const purchases = await RNIap.getAvailablePurchases();
      console.log('📋 Found purchases:', purchases);

      if (purchases && purchases.length > 0) {
        const hasPurchased = purchases.some((purchase) =>
          PRODUCT_IDS.includes(purchase.productId)
        );

        if (hasPurchased) {
          await AsyncStorage.setItem('hasPremium', 'true');
          setHasPremium(true);
          return { success: true, message: 'Покупка восстановлена' };
        }
      }

      return { success: false, message: 'Покупки не найдены' };

    } catch (error) {
      console.error('❌ Error restoring:', error);
      return { success: false, error };
    }
  };

  const resetPremium = async () => {
    try {
      await AsyncStorage.removeItem('hasPremium');
      setHasPremium(false);
      console.log('🔄 Premium reset');
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