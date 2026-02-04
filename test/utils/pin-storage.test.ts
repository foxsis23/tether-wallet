import * as Keychain from 'react-native-keychain';
import { getStoredPin, setStoredPin } from '@/utils/pin-storage';

describe('pin-storage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns null when no pin stored', async () => {
    (Keychain.getGenericPassword as jest.Mock).mockResolvedValue(false);
    await expect(getStoredPin()).resolves.toBeNull();
  });

  it('returns stored pin', async () => {
    (Keychain.getGenericPassword as jest.Mock).mockResolvedValue({
      username: 'pin',
      password: '1234',
    });
    await expect(getStoredPin()).resolves.toBe('1234');
  });

  it('stores pin using keychain', async () => {
    await setStoredPin('9876');
    expect(Keychain.setGenericPassword).toHaveBeenCalledWith('pin', '9876', {
      service: 'tetherWallet.pin',
      accessible: Keychain.ACCESSIBLE.AFTER_FIRST_UNLOCK_THIS_DEVICE_ONLY,
    });
  });
});
