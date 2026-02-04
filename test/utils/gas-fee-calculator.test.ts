jest.mock('@tetherto/wdk-react-native-provider', () => ({
  AssetTicker: {
    BTC: 'btc',
    USDT: 'usdt',
    XAUT: 'xaut',
  },
  NetworkType: {
    SEGWIT: 'bitcoin',
    LIGHTNING: 'lightning',
    ETHEREUM: 'ethereum',
    POLYGON: 'polygon',
    ARBITRUM: 'arbitrum',
    TON: 'ton',
    TRON: 'tron',
    SOLANA: 'solana',
  },
  WDKService: {
    quoteSendByNetwork: jest.fn(),
  },
}));

import { calculateGasFee, getAssetTicker, getNetworkType } from '@/utils/gas-fee-calculator';
import { WDKService } from '@tetherto/wdk-react-native-provider';

describe('gas-fee-calculator', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    (console.error as jest.Mock).mockRestore();
  });

  it('maps network type and asset ticker', () => {
    expect(getNetworkType('polygon')).toBe('polygon');
    expect(getNetworkType('unknown')).toBe('ethereum');
    expect(getAssetTicker('btc')).toBe('btc');
  });

  it('returns error for BTC without amount', async () => {
    const result = await calculateGasFee('bitcoin', 'btc');
    expect(result.error).toBe('Insufficient balance for fee calculation');
  });

  it('returns fee when quote succeeds', async () => {
    (WDKService.quoteSendByNetwork as jest.Mock).mockResolvedValueOnce(0.0001);
    const result = await calculateGasFee('ethereum', 'usdt');
    expect(result.fee).toBe(0.0001);
  });

  it('handles insufficient balance error for BTC', async () => {
    (WDKService.quoteSendByNetwork as jest.Mock).mockRejectedValueOnce(
      new Error('Insufficient balance')
    );
    const result = await calculateGasFee('bitcoin', 'btc', 0.0001);
    expect(result.error).toBe('Insufficient balance for fee calculation');
  });
});
