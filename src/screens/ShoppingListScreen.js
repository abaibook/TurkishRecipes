// src/screens/ShoppingListScreen.js
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { useLanguage } from '../utils/LanguageContext';
import { useShoppingList } from '../utils/ShoppingListContext';
import { COLORS, SIZES, SPACING, SHADOWS } from '../constants/theme';
import { t } from '../constants/translations';

const ShoppingListScreen = ({ navigation }) => {
  const { language } = useLanguage();
  const { items, toggleItem, removeItem, clearAll, clearChecked, getItemsByRecipe, addItem } = useShoppingList();
  const [isAddingCustom, setIsAddingCustom] = useState(false);
  const [customName, setCustomName] = useState('');
  const [customAmount, setCustomAmount] = useState('');

  const groupedItems = getItemsByRecipe();

  const handleAddCustomItem = async () => {
    if (customName.trim()) {
      await addItem(customName.trim(), customAmount.trim() || '1 шт');
      setCustomName('');
      setCustomAmount('');
      setIsAddingCustom(false);
    }
  };

  // Показать меню действий
  const handleShowMenu = () => {
    Alert.alert(
      t('actions', language),
      t('chooseAction', language),
      [
        { text: t('cancel', language), style: 'cancel' },
        { 
          text: t('deletePurchased', language), 
          onPress: handleClearChecked 
        },
        { 
          text: t('clearAll', language), 
          onPress: handleConfirmClearAll, 
          style: 'destructive' 
        },
      ]
    );
  };

  // Подтверждение очистки всего
  const handleConfirmClearAll = () => {
    Alert.alert(
      t('clearAllTitle', language),
      t('clearAllMessage', language),
      [
        { text: t('cancel', language), style: 'cancel' },
        {
          text: t('clear', language),
          style: 'destructive',
          onPress: clearAll,
        },
      ]
    );
  };

  // Подтверждение удаления купленных
  const handleClearChecked = () => {
    const checkedCount = items.filter(i => i.checked).length;
    
    if (checkedCount === 0) {
      Alert.alert(
        t('info', language),
        t('noPurchased', language)
      );
      return;
    }

    Alert.alert(
      t('clearCheckedTitle', language),
      t('clearCheckedMessage', language).replace('{count}', checkedCount),
      [
        { text: t('cancel', language), style: 'cancel' },
        {
          text: t('delete', language),
          style: 'destructive',
          onPress: clearChecked,
        },
      ]
    );
  };

  const renderItem = (item) => (
    <View key={item.id} style={styles.itemRow}>
      <TouchableOpacity
        style={styles.checkbox}
        onPress={() => toggleItem(item.id)}
      >
        <Text style={styles.checkboxIcon}>
          {item.checked ? '☑' : '☐'}
        </Text>
      </TouchableOpacity>

      <View style={styles.itemContent}>
        <Text
          style={[
            styles.itemName,
            item.checked && styles.itemNameChecked,
          ]}
        >
          {item.name}
        </Text>
        <Text style={styles.itemAmount}>{item.amount}</Text>
      </View>

      <TouchableOpacity
        style={styles.removeButton}
        onPress={() => removeItem(item.id)}
      >
        <Text style={styles.removeIcon}>✕</Text>
      </TouchableOpacity>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyIcon}>📋</Text>
      <Text style={styles.emptyTitle}>
        {t('shoppingListEmpty', language)}
      </Text>
      <Text style={styles.emptyText}>
        {t('shoppingListEmptyDesc', language)}
      </Text>
      <TouchableOpacity
        style={styles.goToRecipesButton}
        onPress={() => navigation.navigate('Home')}
      >
        <Text style={styles.goToRecipesText}>
          {t('goToRecipes', language)}
        </Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>

        <Text style={styles.headerTitle}>
          {t('shoppingList', language)}
        </Text>

        <View style={styles.headerRight}>
          {items.length > 0 && (
            <TouchableOpacity
              style={styles.menuButton}
              onPress={handleShowMenu}
            >
              <Text style={styles.menuIcon}>⋮</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Список */}
      {items.length > 0 ? (
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Статистика */}
          <View style={styles.statsBar}>
            <Text style={styles.statsText}>
              {t('total', language)}: {items.length} • {t('purchased', language)}: {items.filter(i => i.checked).length}
            </Text>
          </View>

          {/* Сгруппированные по рецептам */}
          {Object.entries(groupedItems).map(([recipeId, group]) => (
            <View key={recipeId} style={styles.recipeGroup}>
              <Text style={styles.recipeGroupTitle}>
                {group.recipeName}
              </Text>
              <View style={styles.recipeGroupItems}>
                {group.items.map(renderItem)}
              </View>
            </View>
          ))}

          {/* Кнопка добавить свой ингредиент */}
          {!isAddingCustom ? (
            <TouchableOpacity
              style={styles.addCustomButton}
              onPress={() => setIsAddingCustom(true)}
            >
              <Text style={styles.addCustomIcon}>➕</Text>
              <Text style={styles.addCustomText}>
                {t('addIngredient', language)}
              </Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.addCustomForm}>
              <TextInput
                style={styles.customInput}
                placeholder={t('ingredientName', language)}
                placeholderTextColor={COLORS.textLight}
                value={customName}
                onChangeText={setCustomName}
                autoFocus
              />
              <TextInput
                style={styles.customInput}
                placeholder={t('amountOptional', language)}
                placeholderTextColor={COLORS.textLight}
                value={customAmount}
                onChangeText={setCustomAmount}
              />
              <View style={styles.customFormButtons}>
                <TouchableOpacity
                  style={[styles.customFormButton, styles.cancelButton]}
                  onPress={() => {
                    setCustomName('');
                    setCustomAmount('');
                    setIsAddingCustom(false);
                  }}
                >
                  <Text style={styles.cancelButtonText}>
                    {t('cancel', language)}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.customFormButton, styles.saveButton]}
                  onPress={handleAddCustomItem}
                >
                  <Text style={styles.saveButtonText}>
                    {t('add', language)}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          <View style={{ height: SPACING.xl }} />
        </ScrollView>
      ) : (
        renderEmptyState()
      )}
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
  headerRight: {
    width: 40,
    alignItems: 'flex-end',
  },
  menuButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuIcon: {
    fontSize: 24,
    color: COLORS.text,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.m,
  },
  statsBar: {
    backgroundColor: COLORS.backgroundGray,
    padding: SPACING.m,
    borderRadius: SIZES.radius,
    marginBottom: SPACING.m,
  },
  statsText: {
    fontSize: SIZES.bodySmall,
    color: COLORS.textLight,
    textAlign: 'center',
  },
  recipeGroup: {
    marginBottom: SPACING.l,
  },
  recipeGroupTitle: {
    fontSize: SIZES.body,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.s,
  },
  recipeGroupItems: {
    backgroundColor: COLORS.background,
    borderRadius: SIZES.radius,
    ...SHADOWS.small,
    overflow: 'hidden',
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.m,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider,
  },
  checkbox: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.m,
  },
  checkboxIcon: {
    fontSize: 24,
    color: COLORS.primary,
  },
  itemContent: {
    flex: 1,
  },
  itemName: {
    fontSize: SIZES.body,
    color: COLORS.text,
    marginBottom: 2,
  },
  itemNameChecked: {
    textDecorationLine: 'line-through',
    color: COLORS.textLight,
  },
  itemAmount: {
    fontSize: SIZES.caption,
    color: COLORS.textLight,
  },
  removeButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeIcon: {
    fontSize: 20,
    color: COLORS.textLight,
  },
  addCustomButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.backgroundGray,
    padding: SPACING.m,
    borderRadius: SIZES.radius,
    borderWidth: 2,
    borderColor: COLORS.border,
    borderStyle: 'dashed',
    gap: SPACING.s,
  },
  addCustomIcon: {
    fontSize: 20,
  },
  addCustomText: {
    fontSize: SIZES.body,
    color: COLORS.text,
    fontWeight: '600',
  },
  addCustomForm: {
    backgroundColor: COLORS.backgroundGray,
    padding: SPACING.m,
    borderRadius: SIZES.radius,
    gap: SPACING.m,
  },
  customInput: {
    backgroundColor: COLORS.background,
    padding: SPACING.m,
    borderRadius: SIZES.radiusSmall,
    fontSize: SIZES.body,
    color: COLORS.text,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  customFormButtons: {
    flexDirection: 'row',
    gap: SPACING.m,
  },
  customFormButton: {
    flex: 1,
    padding: SPACING.m,
    borderRadius: SIZES.radiusSmall,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cancelButtonText: {
    fontSize: SIZES.body,
    color: COLORS.text,
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: COLORS.primary,
  },
  saveButtonText: {
    fontSize: SIZES.body,
    color: COLORS.textWhite,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  emptyIcon: {
    fontSize: 80,
    marginBottom: SPACING.l,
    opacity: 0.3,
  },
  emptyTitle: {
    fontSize: SIZES.h3,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.s,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: SIZES.body,
    color: COLORS.textLight,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: SPACING.xl,
  },
  goToRecipesButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.m,
    paddingHorizontal: SPACING.xl,
    borderRadius: SIZES.radius,
  },
  goToRecipesText: {
    fontSize: SIZES.body,
    fontWeight: '600',
    color: COLORS.textWhite,
  },
});

export default ShoppingListScreen;