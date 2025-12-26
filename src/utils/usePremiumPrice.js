// src/utils/usePremiumPrice.js
import { usePremium } from './PremiumContext';

export const usePremiumPrice = () => {
  const { products } = usePremium();
  
  // Цена ТОЛЬКО из магазина, без запасного варианта
  const price = products[0]?.localizedPrice || '...'; // Если нет - покажет "..."
  const oldPrice = products[0]?.localizedPrice ? 
    (parseFloat(products[0].price) * 1.67).toFixed(2) + ' ' + products[0].currencyCode : 
    '...';
  
  return {
    price,
    oldPrice,
    hasPrice: !!products[0]?.localizedPrice, // true если цена загрузилась
  };
};