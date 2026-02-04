import Header from '@/components/header';
import { useDebouncedNavigation } from '@/hooks/use-debounced-navigation';
import {
  getCurrentWalletId,
  getMnemonicForWallet,
  getWallets,
  setCurrentWallet,
  type StoredWalletMeta,
} from '@/services/wallet-store';
import { useWallet } from '@tetherto/wdk-react-native-provider';
import { useFocusEffect } from '@react-navigation/native';
import { Check, Plus, Wallet } from 'lucide-react-native';
import React, { useCallback, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { toast } from 'sonner-native';
import { colors } from '@/constants/colors';

export default function WalletsScreen() {
  const insets = useSafeAreaInsets();
  const router = useDebouncedNavigation();
  const { clearWallet, createWallet } = useWallet();

  const [wallets, setWallets] = useState<StoredWalletMeta[]>([]);
  const [currentWalletId, setCurrentWalletIdState] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [switchingWalletId, setSwitchingWalletId] = useState<string | null>(null);

  const loadWallets = useCallback(async () => {
    try {
      setIsLoading(true);
      const [storedWallets, currentId] = await Promise.all([getWallets(), getCurrentWalletId()]);
      setWallets(storedWallets);
      setCurrentWalletIdState(currentId);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadWallets();
    }, [loadWallets])
  );

  const handleCreateNewWallet = () => {
    router.push('/wallet-setup/name-wallet');
  };

  const performSwitch = async (walletMeta: StoredWalletMeta) => {
    setSwitchingWalletId(walletMeta.id);
    try {
      const mnemonic = await getMnemonicForWallet(walletMeta.id);

      if (!mnemonic) {
        Alert.alert(
          'Missing Recovery Phrase',
          'Could not find the recovery phrase for this wallet on this device.'
        );
        return;
      }

      // Reset current wallet in WDK and create the selected one
      await clearWallet();
      await createWallet({
        name: walletMeta.name,
        mnemonic,
      });

      await setCurrentWallet(walletMeta.id);
      setCurrentWalletIdState(walletMeta.id);

      toast.success(`Switched to wallet "${walletMeta.name}"`);
      // Close the wallets stack and let the root index redirect to the active wallet
      router.dismissAll();
    } catch (error) {
      console.error('Failed to switch wallet:', error);
      Alert.alert(
        'Switch Failed',
        'Unable to switch wallets. Please try again.',
        [{ text: 'OK' }],
        { cancelable: true }
      );
    } finally {
      setSwitchingWalletId(null);
    }
  };

  const handleSelectWallet = (walletMeta: StoredWalletMeta) => {
    if (walletMeta.id === currentWalletId) {
      return;
    }

    Alert.alert(
      'Switch Wallet',
      `You are about to switch to wallet "${walletMeta.name}".\n\nCurrent wallet will be locked and the selected wallet will be loaded on this device.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Switch',
          style: 'default',
          onPress: () => performSwitch(walletMeta),
        },
      ]
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Header title="Wallets" />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Wallet size={20} color={colors.primary} />
            <Text style={styles.sectionTitle}>Your Wallets</Text>
          </View>

          {wallets.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyTitle}>No wallets saved yet</Text>
              <Text style={styles.emptySubtitle}>
                Create a new wallet or import an existing one to get started.
              </Text>
            </View>
          ) : (
            <View style={styles.card}>
              {wallets.map((walletMeta, index) => {
                const isCurrent = walletMeta.id === currentWalletId;
                const isSwitching = walletMeta.id === switchingWalletId;

                return (
                  <TouchableOpacity
                    key={walletMeta.id}
                    style={[
                      styles.walletRow,
                      index === wallets.length - 1 && styles.walletRowLast,
                    ]}
                    onPress={() => handleSelectWallet(walletMeta)}
                    disabled={isSwitching || isCurrent || isLoading}
                    activeOpacity={0.7}
                  >
                    <View style={styles.walletInfo}>
                      <View style={styles.walletAvatar}>
                        <Text style={styles.walletAvatarText}>{walletMeta.avatar ?? '💼'}</Text>
                      </View>
                      <View style={styles.walletTextContainer}>
                        <Text style={[styles.walletName, isCurrent && styles.walletRowCurrent,]}>{walletMeta.name}</Text>
                        {isCurrent ? (
                          <Text style={styles.walletSubtitle}>Current wallet</Text>
                        ) : (
                          <Text style={styles.walletSubtitle}>Tap to switch</Text>
                        )}
                      </View>
                    </View>

                    {isCurrent ? (
                      <Check size={18} color={colors.primary} />
                    ) : isSwitching ? (
                      <Text style={styles.switchingText}>Switching...</Text>
                    ) : null}
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </View>

        <View style={styles.footerSection}>
          <TouchableOpacity style={styles.primaryButton} onPress={handleCreateNewWallet}>
            <Plus size={20} color={colors.black} />
            <Text style={styles.primaryButtonText}>Create New Wallet</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  section: {
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginLeft: 8,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 12,
    paddingHorizontal: 16,
  },
  walletRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderDark,
  },
  walletRowLast: {
    borderBottomWidth: 0,
  },
  walletRowCurrent: {
    color: colors.primary,
  },
  walletInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 12,
  },
  walletAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.cardDark,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  walletAvatarText: {
    fontSize: 18,
  },
  walletTextContainer: {
    flex: 1,
  },
  walletName: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
  },
  walletSubtitle: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  switchingText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  emptyState: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 20,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  emptySubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  footerSection: {
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    gap: 8,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.black,
  },
});

