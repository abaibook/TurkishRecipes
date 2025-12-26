// src/utils/usePremiumPrice.js
import { usePremium } from './PremiumContext';

export const usePremiumPrice = () => {
  const { products } = usePremium();
  
  // В версии 14+ структура продукта:
  // - localizedPrice (строка с символом валюты, например "$4.99")
  // - price (число, например "4.99")
  // - currency (код валюты, например "USD")
  
  const product = products && products.length > 0 ? products[0] : null;
  
  // Цена из магазина
  const price = product?.localizedPrice || '...';
  
  // Старая цена (умножаем на 1.67)
  const oldPrice = product?.price && product?.currency
    ? `${(parseFloat(product.price) * 1.67).toFixed(2)} ${product.currency}`
    : '...';
  
  return {
    price,
    oldPrice,
    hasPrice: !!product?.localizedPrice,
  };
};