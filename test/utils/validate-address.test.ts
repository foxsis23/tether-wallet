import { isValidAddressForNetwork } from '@/utils/validate-address';

const NetworkType = {
  SEGWIT: 'bitcoin',
  ETHEREUM: 'ethereum',
  POLYGON: 'polygon',
  ARBITRUM: 'arbitrum',
  TON: 'ton',
  TRON: 'tron',
} as const;

describe('isValidAddressForNetwork', () => {
  it('validates EVM addresses', () => {
    expect(isValidAddressForNetwork('0x0000000000000000000000000000000000000000', NetworkType.ETHEREUM)).toBe(
      true
    );
    expect(isValidAddressForNetwork('0x123', NetworkType.ETHEREUM)).toBe(false);
  });

  it('validates BTC addresses', () => {
    expect(
      isValidAddressForNetwork('bc1qw4e6q9f9y6a7h9s8d7f6g5h4j3k2l1m0n9p8q7', NetworkType.SEGWIT)
    ).toBe(true);
    expect(isValidAddressForNetwork('1BoatSLRHtKNngkdXEeobR76b53LETtpyT', NetworkType.SEGWIT)).toBe(
      true
    );
    expect(isValidAddressForNetwork('0x0000000000000000000000000000000000000000', NetworkType.SEGWIT)).toBe(
      false
    );
  });

  it('validates TON addresses', () => {
    expect(
      isValidAddressForNetwork('UQBRdEVZJ5ZyZVLo0ppS1_xG1D4IfqQ23uepOcs0By9Sr7Rm', NetworkType.TON)
    ).toBe(true);
    expect(isValidAddressForNetwork('EQInvalidTonAddress', NetworkType.TON)).toBe(false);
  });

  it('validates TRON addresses', () => {
    expect(isValidAddressForNetwork('TXYZopYRdj2D9XRtbG411XZZ3kM5VkAeBf', NetworkType.TRON)).toBe(
      true
    );
    expect(isValidAddressForNetwork('0x0000000000000000000000000000000000000000', NetworkType.TRON)).toBe(
      false
    );
  });
});
