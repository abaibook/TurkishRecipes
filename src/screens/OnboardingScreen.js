// src/screens/OnboardingScreen.js
import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Dimensions,
  Animated,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS, SIZES, SPACING, SHADOWS } from '../constants/theme';
import { t } from '../constants/translations';

const { width, height } = Dimensions.get('window');

const OnboardingScreen = ({ route, navigation }) => {
  const { language } = route.params;
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userName, setUserName] = useState('');
  const scrollX = useRef(new Animated.Value(0)).current;
  const slidesRef = useRef(null);

  const slides = [
    {
      id: '1',
      icon: '🍽️',
      title: t('onboarding1Title', language),
      subtitle: t('onboarding1Subtitle', language),
      background: COLORS.primary,
      type: 'info',
    },
    {
      id: '2',
      icon: '👨‍🍳',
      title: t('onboarding2Title', language),
      subtitle: t('onboarding2Subtitle', language),
      background: COLORS.gold,
      type: 'info',
    },
    {
      id: '3',
      icon: '👋',
      title: t('onboarding3Title', language),
      subtitle: t('onboarding3Subtitle', language),
      background: COLORS.primary,
      type: 'input',
    },
  ];

  const handleNext = async () => {
    if (currentIndex < slides.length - 1) {
      slidesRef.current?.scrollToIndex({ index: currentIndex + 1 });
    } else {
      // Последний экран - сохраняем и переходим
      await handleGetStarted();
    }
  };

  const handleSkip = () => {
    handleGetStarted();
  };

  const handleGetStarted = async () => {
    try {
      await AsyncStorage.setItem('hasSeenOnboarding', 'true');
      
      // Сохраняем имя пользователя если оно введено
      if (userName.trim()) {
        await AsyncStorage.setItem('userName', userName.trim());
      }
      
      navigation.replace('Home');
    } catch (error) {
      console.error('Error saving onboarding status:', error);
    }
  };

  const viewableItemsChanged = useRef(({ viewableItems }) => {
    if (viewableItems.length > 0) {
      setCurrentIndex(viewableItems[0].index);
    }
  }).current;

  const viewConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;

  const renderItem = ({ item }) => {
    if (item.type === 'input') {
  return (
    <KeyboardAvoidingView
      style={[styles.slide, { width }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.nameSlideContainer}>
        {/* Верхняя часть - иконка и текст */}
        <View style={styles.nameTopSection}>
          <Text style={styles.nameIcon}>{item.icon}</Text>
          <Text style={styles.nameTitle}>{item.title}</Text>
          <Text style={styles.nameSubtitle}>{item.subtitle}</Text>
        </View>

        {/* Форма ввода */}
        <View style={styles.nameFormContainer}>
          <TextInput
            style={styles.nameInputMinimal}
            placeholder={t('enterYourName', language)}
            placeholderTextColor={COLORS.textLight}
            value={userName}
            onChangeText={setUserName}
            maxLength={20}
            autoCapitalize="words"
            returnKeyType="done"
            onSubmitEditing={handleGetStarted}
          />
          <Text style={styles.hintMinimal}>
            {t('nameOptional', language)}
          </Text>
        </View>

        {/* Пустое пространство для клавиатуры */}
        <View style={styles.nameBottomSpacer} />
      </View>
    </KeyboardAvoidingView>
  );
}

    // Обычные информационные экраны
    return (
      <View style={[styles.slide, { width }]}>
        <View
          style={[
            styles.gradientBackground,
            { backgroundColor: item.background },
          ]}
        >
          {/* Декоративный паттерн */}
          <View style={styles.patternContainer}>
            <Text style={styles.patternDot}>✦</Text>
            <Text style={styles.patternDot}>✦</Text>
            <Text style={styles.patternDot}>✦</Text>
          </View>

          {/* Иконка */}
          <View style={styles.iconContainer}>
            <Text style={styles.icon}>{item.icon}</Text>
          </View>

          {/* Текст */}
          <View style={styles.textContainer}>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.subtitle}>{item.subtitle}</Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Кнопка "Пропустить" */}
      {currentIndex < slides.length - 1 && (
        <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
          <Text style={styles.skipText}>{t('skip', language)}</Text>
        </TouchableOpacity>
      )}

      {/* Слайды */}
      <FlatList
        data={slides}
        renderItem={renderItem}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        bounces={false}
        keyExtractor={(item) => item.id}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: false }
        )}
        onViewableItemsChanged={viewableItemsChanged}
        viewabilityConfig={viewConfig}
        ref={slidesRef}
        scrollEnabled={currentIndex !== 2} // Блокируем свайп на последнем экране
      />

      {/* Индикаторы и кнопка */}
      <View style={styles.footer}>
        {/* Pagination dots */}
        <View style={styles.pagination}>
          {slides.map((_, index) => {
            const inputRange = [
              (index - 1) * width,
              index * width,
              (index + 1) * width,
            ];

            const dotWidth = scrollX.interpolate({
              inputRange,
              outputRange: [10, 24, 10],
              extrapolate: 'clamp',
            });

            const opacity = scrollX.interpolate({
              inputRange,
              outputRange: [0.3, 1, 0.3],
              extrapolate: 'clamp',
            });

            return (
              <Animated.View
                key={index}
                style={[
                  styles.dot,
                  { width: dotWidth, opacity },
                ]}
              />
            );
          })}
        </View>

        {/* Кнопка "Далее" / "Начать" */}
        <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
          <Text style={styles.nextButtonText}>
            {currentIndex === slides.length - 1
              ? t('getStarted', language)
              : t('next', language)}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  skipButton: {
    position: 'absolute',
    top: 50,
    right: SPACING.l,
    zIndex: 10,
    paddingVertical: SPACING.s,
    paddingHorizontal: SPACING.m,
  },
  skipText: {
    fontSize: SIZES.bodySmall,
    color: COLORS.textWhite,
    fontWeight: '600',
  },
  slide: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gradientBackground: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
  },
  patternContainer: {
    position: 'absolute',
    top: 80,
    flexDirection: 'row',
    gap: 40,
  },
  patternDot: {
    fontSize: 40,
    color: COLORS.textWhite,
    opacity: 0.2,
  },
  iconContainer: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
  },
  icon: {
    fontSize: 80,
  },
  textContainer: {
    alignItems: 'center',
    paddingHorizontal: SPACING.l,
    width: '100%',
  },
  title: {
    fontSize: SIZES.h2,
    fontWeight: 'bold',
    color: COLORS.textWhite,
    textAlign: 'center',
    marginBottom: SPACING.m,
  },
  subtitle: {
    fontSize: SIZES.body,
    color: COLORS.textWhite,
    textAlign: 'center',
    lineHeight: 24,
    opacity: 0.9,
    marginBottom: SPACING.l,
  },
  // Убери старые стили: inputContainer, nameInput, hint
// Добавь новые:

nameSlideContainer: {
  flex: 1,
  width: '100%',
  backgroundColor: COLORS.background,
  justifyContent: 'flex-start',
  paddingTop: 60,
  paddingBottom: 40,
},
nameTopSection: {
  alignItems: 'center',
  paddingHorizontal: SPACING.xl,
},
nameIcon: {
  fontSize: 56,
  marginBottom: SPACING.l,
},
nameTitle: {
  fontSize: SIZES.h2,
  fontWeight: 'bold',
  color: COLORS.text,
  textAlign: 'center',
  marginBottom: SPACING.s,
},
nameSubtitle: {
  fontSize: SIZES.body,
  color: COLORS.textLight,
  textAlign: 'center',
  lineHeight: 24,
  marginBottom: SPACING.l,
},
nameFormContainer: {
  paddingHorizontal: SPACING.xl,
  marginTop: SPACING.m,
},
nameInputMinimal: {
  backgroundColor: COLORS.background,
  borderRadius: SIZES.radius,
  paddingHorizontal: SPACING.l,
  paddingVertical: SPACING.m + 2,
  fontSize: SIZES.body,
  color: COLORS.text,
  borderWidth: 1,
  borderColor: COLORS.border,
},
hintMinimal: {
  fontSize: SIZES.caption,
  color: COLORS.textLight,
  marginTop: SPACING.s,
  textAlign: 'center',
  fontStyle: 'italic',
},
nameBottomSpacer: {
  height: 40,
},
  footer: {
    position: 'absolute',
    bottom: 60,
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
  },
  pagination: {
    flexDirection: 'row',
    marginBottom: SPACING.l,
    gap: 8,
  },
  dot: {
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.textWhite,
  },
  nextButton: {
    width: '100%',
    backgroundColor: COLORS.textWhite,
    paddingVertical: SPACING.m,
    borderRadius: SIZES.radius,
    alignItems: 'center',
    ...SHADOWS.medium,
  },
  nextButtonText: {
    fontSize: SIZES.body,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
});

export default OnboardingScreen;