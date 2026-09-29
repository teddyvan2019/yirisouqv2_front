import { TestBed } from '@angular/core/testing';
import { CurrencyService } from './currency.service';

describe('CurrencyService - Multi-Currency Conversion', () => {
  let service: CurrencyService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({});
    service = TestBed.inject(CurrencyService);
  });

  it('should be created with USD default', () => {
    expect(service).toBeTruthy();
    expect(service.currentCurrency).toBe('USD');
  });

  it('should format USD amounts correctly', () => {
    service.setCurrency('USD');
    expect(service.format(100)).toBe('$100.00');
  });

  it('should convert USD to EUR at rate 0.92', () => {
    service.setCurrency('EUR');
    expect(service.convert(100)).toBe(92);
    expect(service.format(100)).toBe('€92.00');
  });

  it('should convert USD to XOF (FCFA) at parity 600', () => {
    service.setCurrency('XOF');
    expect(service.convert(100)).toBe(60000);
    expect(service.format(100)).toContain('60,000 FCFA');
  });

  it('should convert USD to CNY at rate 7.23', () => {
    service.setCurrency('CNY');
    expect(service.convert(100)).toBe(723);
    expect(service.format(100)).toBe('¥723.00');
  });
});
