// src/components/EmojiText.js
import React from 'react';
import { Text } from 'react-native';

export const EmojiText = ({ children, style }) => {
  return (
    <Text
      style={[
        style,
        {
          // Убираем все трансформации, которые могут влиять на рендеринг
          textShadowColor: 'transparent',
          textShadowOffset: { width: 0, height: 0 },
          textShadowRadius: 0,
        }
      ]}
      allowFontScaling={false}
    >
      {children}
    </Text>
  );
};

export default EmojiText;