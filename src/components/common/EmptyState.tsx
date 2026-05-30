import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAppTheme } from '../../hooks/SettingsContext';

interface Props {
  icon?: keyof typeof MaterialCommunityIcons.glyphMap;
  title: string;
  subtitle?: string;
}

export const EmptyState: React.FC<Props> = ({
  icon = 'code-braces',
  title,
  subtitle,
}) => {
  const { colors, fontSizes } = useAppTheme();

  return (
    <View style={styles.container}>
      <MaterialCommunityIcons name={icon} size={64} color={colors.textMuted} />
      <Text style={[styles.title, { color: colors.text, fontSize: fontSizes.title }]}>
        {title}
      </Text>
      {subtitle ? (
        <Text style={[styles.subtitle, { color: colors.textSecondary, fontSize: fontSizes.body }]}>
          {subtitle}
        </Text>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    gap: 12,
  },
  title: { fontWeight: '600', textAlign: 'center' },
  subtitle: { textAlign: 'center', lineHeight: 22 },
});
