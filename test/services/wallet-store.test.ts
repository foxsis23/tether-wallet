import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Keychain from 'react-native-keychain';
import {
  addWallet,
  getCurrentWalletId,
  getCurrentWalletMeta,
  getMnemonicForWallet,
  getWallets,
  removeWallet,
  setCurrentWallet,
} from '@/services/wallet-store';

const walletsKey = '@tetherWallet/wallets';
const currentKey = '@tetherWallet/currentWalletId';

const seedWallets = async (wallets: Array<any>) => {
  await AsyncStorage.setItem(walletsKey, JSON.stringify(wallets));
};

describe('wallet-store', () => {
  beforeEach(async () => {
    jest.clearAllMocks();
    // @ts-expect-error - async-storage-mock supports clear
    await AsyncStorage.clear();
  });

  it('returns empty wallets when storage is empty', async () => {
    await expect(getWallets()).resolves.toEqual([]);
  });

  it('adds wallet and sets current id', async () => {
    (Keychain.setGenericPassword as jest.Mock).mockResolvedValue(true);
    const wallet = await addWallet({
      name: 'Test Wallet',
      mnemonic: 'test mnemonic',
    });

    const storedWallets = await getWallets();
    const currentId = await getCurrentWalletId();

    expect(storedWallets).toHaveLength(1);
    expect(storedWallets[0].id).toBe(wallet.id);
    expect(currentId).toBe(wallet.id);
    expect(Keychain.setGenericPassword).toHaveBeenCalled();
  });

  it('returns current wallet meta', async () => {
    const wallets = [
      { id: 'w1', name: 'Wallet 1', createdAt: 't1', lastUsedAt: 't1' },
      { id: 'w2', name: 'Wallet 2', createdAt: 't2', lastUsedAt: 't2' },
    ];
    await seedWallets(wallets);
    await AsyncStorage.setItem(currentKey, 'w2');

    const current = await getCurrentWalletMeta();
    expect(current?.id).toBe('w2');
  });

  it('sets current wallet and updates lastUsedAt', async () => {
    const now = '2024-01-01T00:00:00.000Z';
    jest.spyOn(Date.prototype, 'toISOString').mockReturnValue(now);
    const wallets = [
      { id: 'w1', name: 'Wallet 1', createdAt: 't1', lastUsedAt: 't1' },
      { id: 'w2', name: 'Wallet 2', createdAt: 't2', lastUsedAt: 't2' },
    ];
    await seedWallets(wallets);

    await setCurrentWallet('w1');

    const stored = await getWallets();
    const updated = stored.find(w => w.id === 'w1');
    const currentId = await getCurrentWalletId();
    expect(updated?.lastUsedAt).toBe(now);
    expect(currentId).toBe('w1');
    jest.restoreAllMocks();
  });

  it('gets mnemonic from keychain', async () => {
    (Keychain.getGenericPassword as jest.Mock).mockResolvedValue({
      username: 'id',
      password: 'secret',
    });
    await expect(getMnemonicForWallet('id')).resolves.toBe('secret');
  });

  it('returns null when mnemonic missing', async () => {
    (Keychain.getGenericPassword as jest.Mock).mockResolvedValue(false);
    await expect(getMnemonicForWallet('id')).resolves.toBeNull();
  });

  it('removes wallet and updates current id', async () => {
    const wallets = [
      { id: 'w1', name: 'Wallet 1', createdAt: 't1', lastUsedAt: 't1' },
      { id: 'w2', name: 'Wallet 2', createdAt: 't2', lastUsedAt: 't2' },
    ];
    await seedWallets(wallets);
    await AsyncStorage.setItem(currentKey, 'w1');

    await removeWallet('w1');

    const stored = await getWallets();
    const currentId = await getCurrentWalletId();
    expect(stored).toHaveLength(1);
    expect(stored[0].id).toBe('w2');
    expect(currentId).toBe('w2');
    expect(Keychain.resetGenericPassword).toHaveBeenCalled();
  });
});
