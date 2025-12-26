// src/constants/theme.js

export const COLORS = {
  // Основные цвета
  primary: '#C1272D',        // Турецкий красный
  primaryLight: '#E63946',   // Светло-красный
  primaryDark: '#9D0208',    // Темно-красный
  
  // Акцентные цвета
  gold: '#D4AF37',           // Золотой
  goldLight: '#FFD700',      // Светло-золотой
  
  // Фоновые цвета
  background: '#FFFFFF',     // Белый
  backgroundGray: '#F8F9FA', // Светло-серый
  cream: '#FFF8DC',          // Кремовый (для советов шефа)
  
  // Текст
  text: '#2C3E50',           // Темно-серый
  textLight: '#7F8C8D',      // Серый
  textWhite: '#FFFFFF',      // Белый
  
  // Состояния
  success: '#27AE60',        // Зеленый
  warning: '#F39C12',        // Желтый
  error: '#E74C3C',          // Красный
  info: '#3498DB',           // Синий
  
  // Сложность
  difficultyEasy: '#27AE60',   // Зеленый
  difficultyMedium: '#F39C12', // Желтый
  difficultyHard: '#E74C3C',   // Красный
  
  // Границы и разделители
  border: '#E0E0E0',
  divider: '#ECEFF1',
  
  // Overlay
  overlay: 'rgba(0, 0, 0, 0.5)',
  overlayLight: 'rgba(0, 0, 0, 0.3)',
};

export const SIZES = {
  // Размеры шрифтов
  h1: 32,
  h2: 28,
  h3: 24,
  h4: 20,
  body: 16,
  bodySmall: 14,
  caption: 12,
  
  // Отступы
  padding: 16,
  paddingSmall: 12,
  paddingLarge: 24,
  
  // Радиусы скругления
  radius: 12,
  radiusSmall: 8,
  radiusLarge: 16,
  
  // Размеры элементов
  buttonHeight: 48,
  inputHeight: 48,
  iconSize: 24,
  iconSizeSmall: 20,
  iconSizeLarge: 32,
  
  // Размеры карточек
  recipeCardWidth: 160,
  recipeCardHeight: 220,
  recipeImageHeight: 120,
  
  // Размеры экрана (примерные)
  screenWidth: 375,
  screenHeight: 812,
};

export const FONTS = {
  regular: 'System',
  medium: 'System',
  bold: 'System',
  semibold: 'System',
};

export const SHADOWS = {
  small: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 2,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 5.46,
    elevation: 4,
  },
  large: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.2,
    shadowRadius: 7.49,
    elevation: 6,
  },
};

export const SPACING = {
  xs: 4,
  s: 8,
  m: 16,
  l: 24,
  xl: 32,
  xxl: 40,
};

// Градиенты для категорий
export const GRADIENTS = {
  soups: ['#3498DB', '#2980B9'],      // Синий
  meat: ['#E74C3C', '#C0392B'],       // Красный
  sides: ['#F39C12', '#E67E22'],      // Оранжевый
  desserts: ['#9B59B6', '#8E44AD'],   // Фиолетовый
  breakfast: ['#F1C40F', '#F39C12'],  // Желтый
  appetizers: ['#1ABC9C', '#16A085'], // Бирюзовый
  pastry: ['#E67E22', '#D35400'],     // Темно-оранжевый
};

export default {
  COLORS,
  SIZES,
  FONTS,
  SHADOWS,
  SPACING,
  GRADIENTS,
};