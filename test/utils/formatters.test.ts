import formatAmount from '@/utils/format-amount';
import formatTokenAmount from '@/utils/format-token-amount';
import formatUSDValue from '@/utils/format-usd-value';

jest.mock('@/utils/get-display-symbol', () => ({
  __esModule: true,
  default: () => 'USD₮',
}));

describe('formatters', () => {
  it('formats amount with defaults', () => {
    expect(formatAmount(1234.5)).toBe('1,234.50');
  });

  it('formats amount with custom decimals', () => {
    expect(formatAmount(1.2345, { minimumFractionDigits: 0, maximumFractionDigits: 3 })).toBe(
      '1.235'
    );
  });

  it('formats token amount with symbol', () => {
    expect(formatTokenAmount(0, 'usdt' as any)).toBe('0.00 USD₮');
    expect(formatTokenAmount(1.2, 'usdt' as any)).toContain('USD₮');
  });

  it('formats USD value thresholds', () => {
    expect(formatUSDValue(0)).toBe('0.00 USD');
    expect(formatUSDValue(0.005)).toBe('< 0.01 USD');
    expect(formatUSDValue(10)).toBe('10.00 USD');
  });
});
