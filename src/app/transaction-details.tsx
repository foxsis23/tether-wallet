import Header from '@/components/header';
import formatUSDValue from '@/utils/format-usd-value';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams } from 'expo-router';
import { colors } from '@/constants/colors';
import { useDebouncedNavigation } from '@/hooks/use-debounced-navigation';

export default function TransactionDetailsScreen() {
  const insets = useSafeAreaInsets();
  const router = useDebouncedNavigation();
  const params = useLocalSearchParams<{
    hash?: string;
    amount?: string;
    token?: string;
    blockchain?: string;
    type?: string;
    from?: string;
    to?: string;
    timestamp?: string;
    fiatAmount?: string;
  }>();

  const handleBack = () => {
    router.back();
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Header title="Transaction Details" />

      <View style={styles.card}>
        <View style={styles.row}>
          <Text style={styles.label}>Type</Text>
          <Text style={styles.value}>{params.type ?? 'Unknown'}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Network</Text>
          <Text style={styles.value}>{params.blockchain ?? 'Unknown'}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Token</Text>
          <Text style={styles.value}>{params.token ?? 'Unknown'}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Amount</Text>
          <Text style={styles.value}>{params.amount ?? '-'}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Fiat</Text>
          <Text style={styles.value}>
            {params.fiatAmount ? formatUSDValue(Number(params.fiatAmount)) : '-'}
          </Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>From</Text>
          <Text style={styles.value} numberOfLines={1} ellipsizeMode="middle">
            {params.from ?? '-'}
          </Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>To</Text>
          <Text style={styles.value} numberOfLines={1} ellipsizeMode="middle">
            {params.to ?? '-'}
          </Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Tx Hash</Text>
          <Text style={styles.value} numberOfLines={1} ellipsizeMode="middle">
            {params.hash ?? '-'}
          </Text>
        </View>
      </View>

      <TouchableOpacity style={styles.backButton} onPress={handleBack}>
        <Text style={styles.backText}>Back</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: 20,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginTop: 12,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  label: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  value: {
    fontSize: 14,
    color: colors.text,
    flex: 1,
    textAlign: 'right',
    marginLeft: 12,
  },
  backButton: {
    marginTop: 24,
    alignSelf: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 10,
    backgroundColor: colors.card,
  },
  backText: {
    color: colors.primary,
    fontWeight: '600',
  },
});
