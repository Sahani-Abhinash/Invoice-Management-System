import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Currency {
  id: string;
  code: string;
  name: string;
  symbol: string;
  isActive: boolean;
}

export interface CreateCurrency {
  code: string;
  name: string;
  symbol: string;
  isActive: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class CurrencyService {
  private baseUrl = '/api/Currency';

  constructor(private http: HttpClient) {}

  getCurrencies(): Observable<Currency[]> {
    return this.http.get<Currency[]>(this.baseUrl);
  }

  getActiveCurrencies(): Observable<Currency[]> {
    return this.http.get<Currency[]>(`${this.baseUrl}/active`);
  }

  getCurrencyById(id: string): Observable<Currency> {
    return this.http.get<Currency>(`${this.baseUrl}/${id}`);
  }

  createCurrency(currency: CreateCurrency): Observable<Currency> {
    return this.http.post<Currency>(this.baseUrl, currency);
  }

  updateCurrency(id: string, currency: CreateCurrency): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/${id}`, currency);
  }

  deleteCurrency(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
