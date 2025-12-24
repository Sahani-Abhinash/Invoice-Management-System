import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { State } from '../state/state.service';

export interface City {
  id: string;
  name: string;
  state?: State;
  stateId?: string;
}

@Injectable({ providedIn: 'root' })
export class CityService {
  private apiUrl = 'https://localhost:7276/api/city';
  constructor(private http: HttpClient) {}

  getAll(): Observable<City[]> { return this.http.get<City[]>(this.apiUrl); }
  getById(id: string): Observable<City> { return this.http.get<City>(`${this.apiUrl}/${id}`); }
  create(city: Partial<City>): Observable<City> { return this.http.post<City>(this.apiUrl, city); }
  update(id: string, city: Partial<City>): Observable<City> { return this.http.put<City>(`${this.apiUrl}/${id}`, city); }
  delete(id: string): Observable<void> { return this.http.delete<void>(`${this.apiUrl}/${id}`); }
}
