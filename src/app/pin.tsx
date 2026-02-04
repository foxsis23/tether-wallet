import Header from '@/components/header';
import { useDebouncedNavigation } from '@/hooks/use-debounced-navigation';
import { getStoredPin, setStoredPin } from '@/utils/pin-storage';
import { useWallet } from '@tetherto/wdk-react-native-provider';
import React, { useEffect, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '@/constants/colors';

type Mode = 'set' | 'confirm' | 'verify';

export default function PinScreen() {
  const insets = useSafeAreaInsets();
  const router = useDebouncedNavigation();
  const { unlockWallet } = useWallet();
  const [mode, setMode] = useState<Mode>('verify');
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [storedPin, setStoredPinState] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getStoredPin().then(existing => {
      setStoredPinState(existing);
      setMode(existing ? 'verify' : 'set');
    });
  }, []);

  const handleSubmit = async () => {
    setError(null);
    if (mode === 'set') {
      if (pin.length < 4) {
        setError('PIN must be at least 4 digits');
        return;
      }
      setMode('confirm');
      return;
    }

    if (mode === 'confirm') {
      if (pin !== confirmPin) {
        setError('PINs do not match');
        return;
      }
      await setStoredPin(pin);
      setStoredPinState(pin);
      setMode('verify');
      setPin('');
      setConfirmPin('');
      Alert.alert('PIN Set', 'Your PIN has been saved.');
      return;
    }

    if (mode === 'verify') {
      if (!storedPin) {
        setMode('set');
        return;
      }
      if (pin !== storedPin) {
        setError('Incorrect PIN');
        return;
      }
      const isDone = await unlockWallet();
      if (isDone) {
        router.replace('/wallet');
      }
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Header title="PIN Access" />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.content}>
        <Text style={styles.title}>
          {mode === 'set' && 'Set a PIN'}
          {mode === 'confirm' && 'Confirm PIN'}
          {mode === 'verify' && 'Enter PIN'}
        </Text>

        <TextInput
          value={mode === 'confirm' ? confirmPin : pin}
          onChangeText={mode === 'confirm' ? setConfirmPin : setPin}
          keyboardType="number-pad"
          secureTextEntry
          maxLength={6}
          style={styles.input}
          placeholder="••••"
          placeholderTextColor={colors.textTertiary}
        />

        {error && <Text style={styles.errorText}>{error}</Text>}

        <TouchableOpacity style={styles.primaryButton} onPress={handleSubmit}>
          <Text style={styles.primaryButtonText}>
            {mode === 'verify' ? 'Unlock' : 'Continue'}
          </Text>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 16,
  },
  input: {
    backgroundColor: colors.card,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 20,
    textAlign: 'center',
    color: colors.text,
    letterSpacing: 4,
  },
  primaryButton: {
    marginTop: 20,
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
  errorText: {
    color: colors.danger,
    marginTop: 8,
    textAlign: 'center',
  },
});
