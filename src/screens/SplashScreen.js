// src/screens/SplashScreen.js
import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
} from 'react-native';
import LottieView from 'lottie-react-native';
import { COLORS, SIZES, SPACING } from '../constants/theme';

const { width, height } = Dimensions.get('window');

const SplashScreen = ({ navigation }) => {
  const animationRef = useRef(null);

  useEffect(() => {
    // Запускаем анимацию
    if (animationRef.current) {
      animationRef.current.play();
    }

    // Переход к выбору языка через 3 секунды
    const timer = setTimeout(() => {
      navigation.replace('LanguageSelection');
    }, 3000);

    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <View style={styles.container}>
      {/* Верхняя часть - Название и слоган */}
      <View style={styles.topSection}>
        <Text style={styles.title}>TURKISH RECIPES</Text>
        <Text style={styles.subtitle}>Authentic Cuisine</Text>
      </View>

      {/* Средняя часть - Анимация */}
      <View style={styles.middleSection}>
        <LottieView
          ref={animationRef}
          source={require('../../assets/Cooking.json')}
          style={styles.animation}
          autoPlay
          loop
        />
      </View>

      {/* Нижняя часть - Описание */}
      <View style={styles.bottomSection}>
        <View style={styles.flagContainer}>
          <Text style={styles.flag}>🇹🇷</Text>
        </View>
        <Text style={styles.description}>
          116 authentic recipes{'\n'}from professional Turkish chefs
        </Text>
        <Text style={styles.version}>v1.0.0</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  topSection: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: SPACING.xl,
    alignItems: 'center',
  },
title: {
  fontSize: SIZES.h1 + 8,
  fontWeight: 'bold',
  color: COLORS.primary,
  letterSpacing: 2,
  marginBottom: 8,
  textAlign: 'center',
},

  subtitle: {
    fontSize: SIZES.h4,
    color: COLORS.text,
    letterSpacing: 3,
    textTransform: 'uppercase',
    fontWeight: '300',
  },
  middleSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
  },
  animation: {
    width: width * 0.7,
    height: width * 0.7,
    maxWidth: 300,
    maxHeight: 300,
  },
  bottomSection: {
    paddingBottom: 60,
    paddingHorizontal: SPACING.xl,
    alignItems: 'center',
  },
  flagContainer: {
    marginBottom: SPACING.m,
  },
  flag: {
    fontSize: 48,
  },
  description: {
    fontSize: SIZES.body,
    color: COLORS.textLight,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: SPACING.l,
  },
  version: {
    fontSize: SIZES.caption,
    color: COLORS.textLight,
    opacity: 0.5,
  },
});

export default SplashScreen;