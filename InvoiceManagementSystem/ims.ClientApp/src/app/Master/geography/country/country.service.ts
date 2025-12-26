import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Country {
  id: string;
  name: string;
  isoCode?: string;
}

@Injectable({ providedIn: 'root' })
export class CountryService {
  private apiUrl = 'https://localhost:7276/api/country';

  constructor(private http: HttpClient) {}

  getAll(): Observable<Country[]> { return this.http.get<Country[]>(this.apiUrl); }
  getById(id: string): Observable<Country> { return this.http.get<Country>(`${this.apiUrl}/${id}`); }
  create(country: Partial<Country>): Observable<Country> { return this.http.post<Country>(this.apiUrl, country); }
  update(id: string, country: Partial<Country>): Observable<Country> { return this.http.put<Country>(`${this.apiUrl}/${id}`, country); }
  delete(id: string): Observable<void> { return this.http.delete<void>(`${this.apiUrl}/${id}`); }
}
