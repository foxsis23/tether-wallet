import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Keychain from 'react-native-keychain';

export type StoredWalletMeta = {
  id: string;
  name: string;
  avatar?: string;
  createdAt: string;
  lastUsedAt: string;
};

const WALLETS_KEY = '@tetherWallet/wallets';
const CURRENT_WALLET_ID_KEY = '@tetherWallet/currentWalletId';

const getKeychainService = (id: string) => `tetherWallet.mnemonic.${id}`;

const generateId = () => {
  try {
    // Prefer crypto.randomUUID when available (polyfilled in many React Native setups)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const cryptoImpl = (globalThis as any).crypto;
    if (cryptoImpl?.randomUUID) {
      return cryptoImpl.randomUUID();
    }
  } catch {
    // Fallback to timestamp + random
  }

  return `wallet-${Date.now()}-${Math.floor(Math.random() * 1_000_000)}`;
};

const parseWallets = (value: string | null): StoredWalletMeta[] => {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch {
    return [];
  }
};

export const getWallets = async (): Promise<StoredWalletMeta[]> => {
  const stored = await AsyncStorage.getItem(WALLETS_KEY);
  return parseWallets(stored);
};

export const getCurrentWalletId = async (): Promise<string | null> => {
  return AsyncStorage.getItem(CURRENT_WALLET_ID_KEY);
};

export const getCurrentWalletMeta = async (): Promise<StoredWalletMeta | null> => {
  const [wallets, currentId] = await Promise.all([getWallets(), getCurrentWalletId()]);
  if (!currentId) return null;
  return wallets.find(w => w.id === currentId) ?? null;
};

export const getMnemonicForWallet = async (id: string): Promise<string | null> => {
  try {
    const credentials = await Keychain.getGenericPassword({
      service: getKeychainService(id),
    });

    if (!credentials) return null;

    return credentials.password;
  } catch {
    return null;
  }
};

export const addWallet = async (params: {
  name: string;
  avatar?: string;
  mnemonic: string;
}): Promise<StoredWalletMeta> => {
  const id = generateId();
  const now = new Date().toISOString();

  // Store mnemonic in the device keychain/secure storage
  await Keychain.setGenericPassword(id, params.mnemonic, {
    service: getKeychainService(id),
    accessible: Keychain.ACCESSIBLE.AFTER_FIRST_UNLOCK_THIS_DEVICE_ONLY,
  });

  const walletMeta: StoredWalletMeta = {
    id,
    name: params.name,
    avatar: params.avatar,
    createdAt: now,
    lastUsedAt: now,
  };

  const wallets = await getWallets();
  const updatedWallets = [...wallets, walletMeta];

  await Promise.all([
    AsyncStorage.setItem(WALLETS_KEY, JSON.stringify(updatedWallets)),
    AsyncStorage.setItem(CURRENT_WALLET_ID_KEY, id),
  ]);

  return walletMeta;
};

export const setCurrentWallet = async (id: string): Promise<void> => {
  const wallets = await getWallets();
  const now = new Date().toISOString();

  const updatedWallets = wallets.map(wallet =>
    wallet.id === id ? { ...wallet, lastUsedAt: now } : wallet
  );

  await Promise.all([
    AsyncStorage.setItem(WALLETS_KEY, JSON.stringify(updatedWallets)),
    AsyncStorage.setItem(CURRENT_WALLET_ID_KEY, id),
  ]);
};

export const removeWallet = async (id: string): Promise<void> => {
  const wallets = await getWallets();
  const filtered = wallets.filter(wallet => wallet.id !== id);

  const tasks: Promise<unknown>[] = [
    AsyncStorage.setItem(WALLETS_KEY, JSON.stringify(filtered)),
    Keychain.resetGenericPassword({ service: getKeychainService(id) }),
  ];

  const currentId = await getCurrentWalletId();
  if (currentId === id) {
    const newCurrent = filtered[0]?.id ?? null;
    tasks.push(
      newCurrent
        ? AsyncStorage.setItem(CURRENT_WALLET_ID_KEY, newCurrent)
        : AsyncStorage.removeItem(CURRENT_WALLET_ID_KEY)
    );
  }

  await Promise.all(tasks);
};

