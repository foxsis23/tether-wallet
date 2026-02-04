import { AssetTicker, useWallet } from '@tetherto/wdk-react-native-provider';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { assetConfig } from '../config/assets';
import { FiatCurrency, pricingService } from '../services/pricing-service';
import formatTokenAmount from '@/utils/format-token-amount';
import formatUSDValue from '@/utils/format-usd-value';
import Header from '@/components/header';
import { colors } from '@/constants/colors';
import { useDebouncedNavigation } from '@/hooks/use-debounced-navigation';

type ActivityTransaction = {
  id: string;
  type: 'sent' | 'received';
  token: string;
  amount: string;
  fiatAmount: string;
  network: string;
  hash: string;
  from: string;
  to: string;
};

export default function ActivityScreen() {
  const insets = useSafeAreaInsets();
  const router = useDebouncedNavigation();
  const { transactions: walletTransactions, addresses, error, clearError } = useWallet();
  const [transactions, setTransactions] = useState<ActivityTransaction[]>([]);
  const [mockTransactions, setMockTransactions] = useState<ActivityTransaction[]>([]);
  const allowMocks =
    __DEV__ && process.env.EXPO_PUBLIC_ENABLE_MOCK_TX === 'true';

  // Transform wallet transactions to display format with fiat values
  const getTransactionsWithFiatValues = async () => {
    if (!walletTransactions.list) return [];

    // Get the wallet's own addresses for comparison
    const walletAddresses = addresses
      ? Object.values(addresses).map(addr => addr.toLowerCase())
      : [];

    // Sort transactions by timestamp (newest first) and calculate fiat values
    const result = await Promise.all(
      walletTransactions.list
        .sort((a, b) => b.timestamp - a.timestamp)
        .map(async (tx, index) => {
          const fromAddress = tx.from?.toLowerCase();
          const isSent = walletAddresses.includes(fromAddress);
          const amount = parseFloat(tx.amount);
          const config = assetConfig[tx.token as keyof typeof assetConfig];

          // Calculate fiat amount using pricing service
          const fiatAmount = await pricingService.getFiatValue(
            amount,
            tx.token as AssetTicker,
            FiatCurrency.USD
          );

          return {
            id: `${tx.transactionHash}-${index}`,
            type: isSent ? ('sent' as const) : ('received' as const),
            token: config?.name || tx.token.toUpperCase(),
            amount: `${formatTokenAmount(amount, tx.token as AssetTicker)}`,
            fiatAmount: formatUSDValue(fiatAmount, false),
            fiatCurrency: FiatCurrency.USD,
            network: tx.blockchain,
            hash: tx.transactionHash,
            from: tx.from,
            to: tx.to,
          };
        })
    );

    return result;
  };

  useEffect(() => {
    getTransactionsWithFiatValues().then(setTransactions);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [walletTransactions.list, addresses]);

  useEffect(() => {
    if (walletTransactions.list?.length) {
      setMockTransactions([]);
    }
  }, [walletTransactions.list]);

  const createMockTransaction = (): ActivityTransaction => ({
    id: `mock-${Date.now()}`,
    type: 'received',
    token: 'USD₮',
    amount: '25.00',
    fiatAmount: formatUSDValue(25, false),
    network: 'ethereum',
    hash: `0xmock${Date.now().toString(16)}`.padEnd(66, '0'),
    from: '0x0000000000000000000000000000000000000000',
    to: '0x1111111111111111111111111111111111111111',
  });

  const handleAddMockTransaction = () => {
    setMockTransactions([createMockTransaction()]);
  };

  const displayTransactions =
    transactions.length > 0 ? transactions : allowMocks ? mockTransactions : [];

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Header isLoading={walletTransactions.isLoading} title="Activity" />
      {error && (
        <View style={styles.errorBanner}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity onPress={clearError}>
            <Text style={styles.errorAction}>Dismiss</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.listContainer}>
        {displayTransactions.length > 0 ? (
          displayTransactions.map(tx => (
            <TouchableOpacity
              key={tx.id}
              style={styles.transactionRow}
              onPress={() =>
                router.push({
                  pathname: '/transaction-details',
                  params: {
                    hash: tx.hash,
                    amount: tx.amount,
                    token: tx.token,
                    blockchain: tx.network,
                    type: tx.type,
                    from: tx.from,
                    to: tx.to,
                    fiatAmount: tx.fiatAmount,
                  },
                })
              }
            >
              <View>
                <Text style={styles.transactionToken}>{tx.token}</Text>
                <Text style={styles.transactionSubtitle}>
                  {tx.type === 'sent' ? 'Sent' : 'Received'} • {tx.network}
                </Text>
              </View>
              <View style={styles.transactionAmount}>
                <Text style={styles.transactionAmountText}>{tx.amount}</Text>
                <Text style={styles.transactionFiat}>{tx.fiatAmount}</Text>
              </View>
            </TouchableOpacity>
          ))
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No transactions yet</Text>
            {allowMocks && (
              <TouchableOpacity style={styles.mockButton} onPress={handleAddMockTransaction}>
                <Text style={styles.mockButtonText}>Add Mock Transaction</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  transactionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderDark,
  },
  transactionToken: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
  },
  transactionSubtitle: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  transactionAmount: {
    alignItems: 'flex-end',
  },
  transactionAmountText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  transactionFiat: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    color: colors.textSecondary,
    fontSize: 14,
  },
  mockButton: {
    marginTop: 12,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  mockButtonText: {
    color: colors.primary,
    fontWeight: '600',
  },
  errorBanner: {
    marginHorizontal: 20,
    marginTop: 12,
    padding: 12,
    borderRadius: 10,
    backgroundColor: colors.dangerBackground,
    borderWidth: 1,
    borderColor: colors.danger,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  errorText: {
    color: colors.danger,
    flex: 1,
  },
  errorAction: {
    color: colors.primary,
    fontWeight: '600',
  },
});
