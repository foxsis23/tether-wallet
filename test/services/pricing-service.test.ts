jest.mock('@tetherto/wdk-react-native-provider', () => ({
  AssetTicker: {
    BTC: 'btc',
    USDT: 'usdt',
    XAUT: 'xaut',
  },
}));

const mockGetLastPrice = jest.fn();

jest.mock('@tetherto/wdk-pricing-provider', () => ({
  PricingProvider: jest.fn().mockImplementation(() => ({
    getLastPrice: mockGetLastPrice,
  })),
}));

jest.mock('@tetherto/wdk-pricing-bitfinex-http', () => ({
  BitfinexPricingClient: jest.fn(),
}));

describe('pricing-service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const getFreshService = () => {
    let service: any;
    jest.isolateModules(() => {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      service = require('@/services/pricing-service').pricingService;
    });
    return service;
  };

  it('throws when not initialized', async () => {
    const service = getFreshService();
    await expect(service.getFiatValue(1, 'btc' as any, 'USD' as any)).rejects.toThrow(
      'Pricing service not initialized'
    );
  });

  it('initializes and returns fiat value', async () => {
    mockGetLastPrice.mockResolvedValueOnce(20000).mockResolvedValueOnce(1900);
    const service = getFreshService();
    await service.initialize();
    const value = await service.getFiatValue(2, 'btc' as any, 'USD' as any);
    expect(value).toBe(40000);
    expect(service.isReady()).toBe(true);
  });

  it('refreshes exchange rates', async () => {
    mockGetLastPrice.mockResolvedValueOnce(20000).mockResolvedValueOnce(1900);
    const service = getFreshService();
    await service.initialize();

    mockGetLastPrice.mockResolvedValueOnce(25000).mockResolvedValueOnce(2100);
    await service.refreshExchangeRates();

    expect(service.getExchangeRate('btc' as any, 'USD' as any)).toBe(25000);
  });
});
