import React from 'react';
import { ActivityIndicator, Modal, StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { useAppTheme } from '../../hooks/SettingsContext';

interface Props {
  visible: boolean;
  message?: string;
}

export const LoadingOverlay: React.FC<Props> = ({ visible, message = 'Loading...' }) => {
  const { colors } = useAppTheme();

  return (
    <Modal transparent visible={visible} animationType="fade">
      <View style={styles.backdrop}>
        <View style={[styles.box, { backgroundColor: colors.surfaceElevated }]}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={{ color: colors.text, marginTop: 12 }}>{message}</Text>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  box: {
    padding: 28,
    borderRadius: 14,
    alignItems: 'center',
    minWidth: 160,
  },
});
