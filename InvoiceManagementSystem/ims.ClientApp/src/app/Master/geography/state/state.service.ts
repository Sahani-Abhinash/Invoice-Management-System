import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Country } from '../country/country.service';

export interface State {
  id: string;
  name: string;
  countryId: string;  // Required, not optional - matches StateDto
  country?: Country;
}

@Injectable({ providedIn: 'root' })
export class StateService {
  private apiUrl = 'https://localhost:7276/api/state';
  constructor(private http: HttpClient) {}

  getAll(): Observable<State[]> { return this.http.get<State[]>(this.apiUrl); }
  getById(id: string): Observable<State> { return this.http.get<State>(`${this.apiUrl}/${id}`); }
  create(state: Partial<State>): Observable<State> { return this.http.post<State>(this.apiUrl, state); }
  update(id: string, state: Partial<State>): Observable<State> { return this.http.put<State>(`${this.apiUrl}/${id}`, state); }
  delete(id: string): Observable<void> { return this.http.delete<void>(`${this.apiUrl}/${id}`); }
}
