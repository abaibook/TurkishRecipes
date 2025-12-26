// src/utils/PremiumContext.js
import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform, Alert } from 'react-native';
import {
  setup,
  initConnection,
  endConnection,
  flushFailedPurchasesCachedAsPendingAndroid,
  purchaseUpdatedListener,
  purchaseErrorListener,
  finishTransaction,
  getProducts as getProductsV14,
  requestPurchase as requestPurchaseV14,
  getAvailablePurchases as getAvailablePurchasesV14,
  withIAPContext,
} from 'react-native-iap';

const PremiumContext = createContext();

// ID продуктов
const PRODUCT_IDS = Platform.select({
  ios: ['premium-access'],
  android: ['premium-access'],
});

const PremiumProviderBase = ({ children }) => {
  const [hasPremium, setHasPremium] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [purchaseUpdateSubscription, setPurchaseUpdateSubscription] = useState(null);
  const [purchaseErrorSubscription, setPurchaseErrorSubscription] = useState(null);

  useEffect(() => {
    initIAP();
    
    return () => {
      if (purchaseUpdateSubscription) {
        purchaseUpdateSubscription.remove();
      }
      if (purchaseErrorSubscription) {
        purchaseErrorSubscription.remove();
      }
      endConnection();
    };
  }, []);

  const initIAP = async () => {
    try {
      console.log('🔌 Step 1: Connecting to IAP...');
      
      // Инициализация
      await initConnection();
      console.log('✅ IAP Connected');

      // Для Android: очистить незавершенные покупки
      if (Platform.OS === 'android') {
        await flushFailedPurchasesCachedAsPendingAndroid();
      }

      // Загрузить статус
      await loadPremiumStatus();

      // Загрузить продукты
      await loadProducts();

      // Проверить существующие покупки
      await checkPurchases();

      // Подписаться на обновления покупок
      const updateSubscription = purchaseUpdatedListener(async (purchase) => {
        console.log('🔔 Purchase updated:', purchase);
        
        const receipt = purchase.transactionReceipt || purchase.purchaseToken;
        
        if (receipt) {
          try {
            // Завершить транзакцию
            await finishTransaction({ purchase, isConsumable: false });
            
            // Активировать премиум
            await AsyncStorage.setItem('hasPremium', 'true');
            setHasPremium(true);
            
            console.log('✅ Purchase completed successfully!');
            Alert.alert('Success!', 'Premium activated!');
          } catch (error) {
            console.error('❌ Error finishing transaction:', error);
          }
        }
      });
      
      const errorSubscription = purchaseErrorListener((error) => {
        console.warn('⚠️ Purchase error:', error);
        if (error.code !== 'E_USER_CANCELLED') {
          Alert.alert('Purchase Error', error.message);
        }
      });

      setPurchaseUpdateSubscription(updateSubscription);
      setPurchaseErrorSubscription(errorSubscription);

    } catch (error) {
      console.error('❌ IAP Init Error:', error);
      console.error('Error message:', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const loadPremiumStatus = async () => {
    try {
      const premiumStatus = await AsyncStorage.getItem('hasPremium');
      if (premiumStatus === 'true') {
        setHasPremium(true);
        console.log('✅ Premium status loaded from storage');
      }
    } catch (error) {
      console.error('Error loading premium status:', error);
    }
  };

  const loadProducts = async () => {
    try {
      console.log('🔍 Step 2: Loading products...');
      console.log('📦 Product IDs:', PRODUCT_IDS);
      
      // В версии 14+ используется getProducts напрямую
      const productList = await getProductsV14({ skus: PRODUCT_IDS });
      
      console.log('📦 Step 3: Products received:', productList);
      console.log('📦 Number of products:', productList ? productList.length : 0);
      
      if (productList && productList.length > 0) {
        productList.forEach((product, index) => {
          console.log(`💰 Product ${index + 1}:`, {
            productId: product.productId,
            title: product.title,
            description: product.description,
            price: product.price,
            currency: product.currency,
            localizedPrice: product.localizedPrice,
          });
        });
        
        setProducts(productList);
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
      console.log('🔍 Checking existing purchases...');
      
      const purchases = await getAvailablePurchasesV14();
      console.log('📋 Available purchases:', purchases);

      if (purchases && purchases.length > 0) {
        const hasPurchased = purchases.some((purchase) =>
          PRODUCT_IDS.includes(purchase.productId)
        );

        if (hasPurchased) {
          await AsyncStorage.setItem('hasPremium', 'true');
          setHasPremium(true);
          console.log('✅ Premium restored from purchase history');
        }
      }
    } catch (error) {
      console.error('Error checking purchases:', error);
    }
  };

  const purchasePremium = async () => {
    try {
      console.log('🛒 Step 1: Starting purchase...');
      
      // Проверить продукты
      if (!products || products.length === 0) {
        console.warn('⚠️ Products not loaded, loading now...');
        await loadProducts();
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
      
      console.log('📦 Step 2: Current products:', products);
      
      if (!products || products.length === 0) {
        throw new Error('No products available. Check Google Play Console.');
      }
      
      const product = products[0];
      console.log('💳 Step 3: Purchasing product:', product.productId);
      console.log('💰 Product details:', product);

      // В версии 14+ requestPurchase принимает объект с sku
      await requestPurchaseV14({ 
        sku: product.productId,
      });

      console.log('✅ Purchase request sent successfully');
      // purchaseUpdatedListener обработает результат
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

      const purchases = await getAvailablePurchasesV14();
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

// В версии 14+ нужно обернуть в withIAPContext
export const PremiumProvider = withIAPContext(PremiumProviderBase);

export const usePremium = () => {
  const context = useContext(PremiumContext);
  if (!context) {
    throw new Error('usePremium must be used within PremiumProvider');
  }
  return context;
};