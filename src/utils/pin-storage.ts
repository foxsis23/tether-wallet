import * as Keychain from 'react-native-keychain';

const PIN_SERVICE = 'tetherWallet.pin';

export const getStoredPin = async (): Promise<string | null> => {
  const credentials = await Keychain.getGenericPassword({ service: PIN_SERVICE });
  if (!credentials) return null;
  return credentials.password;
};

export const setStoredPin = async (pin: string): Promise<void> => {
  await Keychain.setGenericPassword('pin', pin, {
    service: PIN_SERVICE,
    accessible: Keychain.ACCESSIBLE.AFTER_FIRST_UNLOCK_THIS_DEVICE_ONLY,
  });
};
