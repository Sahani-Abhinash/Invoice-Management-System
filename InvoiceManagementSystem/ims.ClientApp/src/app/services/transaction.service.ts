import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Transaction, CreateTransactionDto, TransactionSummary } from '../models/transaction.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TransactionService {
  private apiUrl = `${environment.apiUrl}/transaction`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<Transaction[]> {
    return this.http.get<Transaction[]>(this.apiUrl);
  }

  getById(id: string): Observable<Transaction> {
    return this.http.get<Transaction>(`${this.apiUrl}/${id}`);
  }

  getBySource(sourceType: string, sourceId: string): Observable<Transaction[]> {
    return this.http.get<Transaction[]>(`${this.apiUrl}/source/${sourceType}/${sourceId}`);
  }

  getByCategory(category: string): Observable<Transaction[]> {
    return this.http.get<Transaction[]>(`${this.apiUrl}/category/${category}`);
  }

  getSummary(): Observable<TransactionSummary> {
    return this.http.get<TransactionSummary>(`${this.apiUrl}/summary`);
  }

  create(dto: CreateTransactionDto): Observable<Transaction> {
    return this.http.post<Transaction>(this.apiUrl, dto);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
