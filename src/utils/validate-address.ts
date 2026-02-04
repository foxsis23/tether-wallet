import { isAddress as isEvmAddress } from 'viem';

export const NetworkType = {
  SEGWIT: 'bitcoin',
  LIGHTNING: 'lightning',
  ETHEREUM: 'ethereum',
  SOLANA: 'solana',
  TRON: 'tron',
  TON: 'ton',
  POLYGON: 'polygon',
  ARBITRUM: 'arbitrum',
} as const;

export type NetworkTypeValue = (typeof NetworkType)[keyof typeof NetworkType];

const TRON_ADDRESS_REGEX = /^T[1-9A-HJ-NP-Za-km-z]{33}$/;
const BITCOIN_BECH32_REGEX = /^(bc1)[0-9a-z]{25,87}$/;
const BITCOIN_LEGACY_REGEX = /^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$/;
const TON_ADDRESS_REGEX = /^[EU]Q[a-zA-Z0-9_-]{46,48}$/;

export const isValidAddressForNetwork = (
  address: string,
  networkType?: NetworkTypeValue | string
): boolean => {
  const value = address.trim();
  if (!value) return false;

  switch (networkType) {
    case NetworkType.ETHEREUM:
    case NetworkType.POLYGON:
    case NetworkType.ARBITRUM:
      return isEvmAddress(value);
    case NetworkType.TON:
      return TON_ADDRESS_REGEX.test(value);
    case NetworkType.TRON:
      return TRON_ADDRESS_REGEX.test(value);
    case NetworkType.SEGWIT:
      return BITCOIN_BECH32_REGEX.test(value) || BITCOIN_LEGACY_REGEX.test(value);
    default:
      // Fallback: allow EVM format for unknown networks
      return isEvmAddress(value);
  }
};

export const normalizeScannedValue = (value: string) => value.trim();
