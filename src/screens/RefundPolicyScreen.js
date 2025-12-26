// src/screens/RefundPolicyScreen.js
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { COLORS, SIZES, SPACING, SHADOWS } from '../constants/theme';
import { useLanguage } from '../utils/LanguageContext';
import { refundPolicyTexts as t } from '../constants/policyTexts';

const RefundPolicyScreen = ({ navigation }) => {
  const { language } = useLanguage();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t.title[language]}</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.lastUpdated}>{t.lastUpdated[language]}</Text>

        <Text style={styles.sectionTitle}>{t.section1Title[language]}</Text>
        <Text style={styles.text}>{t.section1Text[language]}</Text>

        <Text style={styles.sectionTitle}>{t.section2Title[language]}</Text>
        <Text style={styles.text}>{t.section2Text[language]}</Text>
        <Text style={styles.bulletPoint}>{t.section2Bullet1[language]}</Text>
        <Text style={styles.bulletPoint}>{t.section2Bullet2[language]}</Text>

        <Text style={styles.sectionTitle}>{t.section3Title[language]}</Text>
        <Text style={styles.text}>{t.section3Text[language]}</Text>
        <Text style={styles.bulletPoint}>{t.section3Bullet1[language]}</Text>
        <Text style={styles.bulletPoint}>{t.section3Bullet2[language]}</Text>
        <Text style={styles.bulletPoint}>{t.section3Bullet3[language]}</Text>
        <Text style={styles.bulletPoint}>{t.section3Bullet4[language]}</Text>
        <Text style={styles.bulletPoint}>{t.section3Bullet5[language]}</Text>
        <Text style={styles.text}>{t.section3Contact[language]}</Text>

        <Text style={styles.sectionTitle}>{t.section4Title[language]}</Text>
        <Text style={styles.text}>{t.section4Text[language]}</Text>
        <Text style={styles.bulletPoint}>{t.section4Bullet1[language]}</Text>
        <Text style={styles.bulletPoint}>{t.section4Bullet2[language]}</Text>
        <Text style={styles.bulletPoint}>{t.section4Bullet3[language]}</Text>
        <Text style={styles.bulletPoint}>{t.section4Bullet4[language]}</Text>
        <Text style={styles.text}>{t.section4Contact[language]}</Text>

        <Text style={styles.sectionTitle}>{t.section5Title[language]}</Text>
        <Text style={styles.text}>{t.section5iOS[language]}</Text>
        <Text style={styles.text}>{t.section5Android[language]}</Text>

        <Text style={styles.sectionTitle}>{t.section6Title[language]}</Text>
        <Text style={styles.text}>{t.section6Text[language]}</Text>
        
        <Text style={styles.subSectionTitle}>{t.section6iOSTitle[language]}</Text>
        <Text style={styles.bulletPoint}>{t.section6iOSBullet1[language]}</Text>
        <Text style={styles.bulletPoint}>{t.section6iOSBullet2[language]}</Text>
        <Text style={styles.bulletPoint}>{t.section6iOSBullet3[language]}</Text>
        <Text style={styles.bulletPoint}>{t.section6iOSBullet4[language]}</Text>

        <Text style={styles.subSectionTitle}>{t.section6AndroidTitle[language]}</Text>
        <Text style={styles.bulletPoint}>{t.section6AndroidBullet1[language]}</Text>
        <Text style={styles.bulletPoint}>{t.section6AndroidBullet2[language]}</Text>
        <Text style={styles.bulletPoint}>{t.section6AndroidBullet3[language]}</Text>
        <Text style={styles.bulletPoint}>{t.section6AndroidBullet4[language]}</Text>

        <Text style={styles.importantNote}>{t.importantNote[language]}</Text>

        <Text style={styles.sectionTitle}>{t.section7Title[language]}</Text>
        <Text style={styles.text}>{t.section7Text[language]}</Text>
        <Text style={styles.bulletPoint}>{t.section7Bullet1[language]}</Text>
        <Text style={styles.bulletPoint}>{t.section7Bullet2[language]}</Text>
        <Text style={styles.bulletPoint}>{t.section7Bullet3[language]}</Text>
        <Text style={styles.bulletPoint}>{t.section7Bullet4[language]}</Text>

        <Text style={styles.sectionTitle}>{t.section8Title[language]}</Text>
        <Text style={styles.text}>{t.section8Text[language]}</Text>
        <Text style={styles.text}>{t.section8Text2[language]}</Text>
        <Text style={styles.bulletPoint}>{t.section8Bullet1[language]}</Text>
        <Text style={styles.bulletPoint}>{t.section8Bullet2[language]}</Text>
        <Text style={styles.bulletPoint}>{t.section8Bullet3[language]}</Text>

        <Text style={styles.sectionTitle}>{t.section9Title[language]}</Text>
        <Text style={styles.text}>{t.section9Text[language]}</Text>
        <Text style={styles.bulletPoint}>{t.section9Email[language]}</Text>
        <Text style={styles.text}>{t.section9Text2[language]}</Text>

        <Text style={styles.sectionTitle}>{t.section10Title[language]}</Text>
        <Text style={styles.text}>{t.section10Text[language]}</Text>

        <View style={styles.footer}>
          <Text style={styles.footerText}>{t.footerText[language]}</Text>
          <Text style={styles.footerText}>{t.footerApple[language]}</Text>
          <Text style={styles.footerText}>{t.footerGoogle[language]}</Text>
        </View>

        <View style={{ height: SPACING.xl }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.m,
    paddingTop: 50,
    paddingBottom: SPACING.m,
    backgroundColor: COLORS.background,
    ...SHADOWS.small,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backIcon: {
    fontSize: 24,
    color: COLORS.text,
  },
  headerTitle: {
    flex: 1,
    fontSize: SIZES.h4,
    fontWeight: 'bold',
    color: COLORS.text,
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.l,
  },
  lastUpdated: {
    fontSize: SIZES.caption,
    color: COLORS.textLight,
    marginBottom: SPACING.l,
    fontStyle: 'italic',
  },
  sectionTitle: {
    fontSize: SIZES.h5,
    fontWeight: 'bold',
    color: COLORS.text,
    marginTop: SPACING.l,
    marginBottom: SPACING.s,
  },
  subSectionTitle: {
    fontSize: SIZES.body,
    fontWeight: '600',
    color: COLORS.text,
    marginTop: SPACING.m,
    marginBottom: SPACING.xs,
  },
  text: {
    fontSize: SIZES.body,
    color: COLORS.text,
    lineHeight: 24,
    marginBottom: SPACING.m,
  },
  bulletPoint: {
    fontSize: SIZES.body,
    color: COLORS.text,
    lineHeight: 24,
    paddingLeft: SPACING.m,
  },
  importantNote: {
    fontSize: SIZES.body,
    color: COLORS.primary,
    backgroundColor: COLORS.backgroundGray,
    padding: SPACING.m,
    borderRadius: SIZES.radius,
    marginVertical: SPACING.m,
    lineHeight: 22,
  },
  footer: {
    marginTop: SPACING.xl,
    paddingTop: SPACING.l,
    borderTopWidth: 1,
    borderTopColor: COLORS.divider,
    alignItems: 'center',
  },
  footerText: {
    fontSize: SIZES.caption,
    color: COLORS.textLight,
    textAlign: 'center',
    marginTop: SPACING.xs,
  },
});

export default RefundPolicyScreen;