import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type CurrencyCode = 'USD' | 'EUR' | 'XOF' | 'CNY';

@Injectable({
  providedIn: 'root'
})
export class CurrencyService {
  private currentCurrencySubject = new BehaviorSubject<CurrencyCode>('USD');
  public currentCurrency$ = this.currentCurrencySubject.asObservable();

  private rates: Record<CurrencyCode, { rate: number; symbol: string; decimals: number }> = {
    USD: { rate: 1.0, symbol: '$', decimals: 2 },
    EUR: { rate: 0.92, symbol: '€', decimals: 2 },
    XOF: { rate: 600.0, symbol: 'FCFA', decimals: 0 },
    CNY: { rate: 7.23, symbol: '¥', decimals: 2 },
  };

  constructor() {
    const saved = localStorage.getItem('yiri_currency') as CurrencyCode;
    if (saved && this.rates[saved]) {
      this.currentCurrencySubject.next(saved);
    }
  }

  public get currentCurrency(): CurrencyCode {
    return this.currentCurrencySubject.value;
  }

  public setCurrency(currency: CurrencyCode): void {
    if (this.rates[currency]) {
      this.currentCurrencySubject.next(currency);
      localStorage.setItem('yiri_currency', currency);
    }
  }

  public convert(usdAmount: number): number {
    const config = this.rates[this.currentCurrency];
    const converted = usdAmount * config.rate;
    return config.decimals === 0 ? Math.round(converted) : Math.round(converted * 100) / 100;
  }

  public format(usdAmount: number): string {
    const config = this.rates[this.currentCurrency];
    const converted = this.convert(usdAmount);

    if (this.currentCurrency === 'XOF') {
      return `${converted.toLocaleString('en-US')} ${config.symbol}`;
    } else {
      return `${config.symbol}${converted.toLocaleString('en-US', {
        minimumFractionDigits: config.decimals,
        maximumFractionDigits: config.decimals
      })}`;
    }
  }
}
