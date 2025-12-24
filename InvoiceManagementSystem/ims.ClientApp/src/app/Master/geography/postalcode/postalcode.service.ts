import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { City } from '../city/city.service';

export interface PostalCode {
  id: string;
  code: string;
  city?: City;
  cityId?: string;
}

@Injectable({ providedIn: 'root' })
export class PostalCodeService {
  private apiUrl = 'https://localhost:7276/api/postalcode';
  constructor(private http: HttpClient) {}

  getAll(): Observable<PostalCode[]> { return this.http.get<PostalCode[]>(this.apiUrl); }
  getById(id: string): Observable<PostalCode> { return this.http.get<PostalCode>(`${this.apiUrl}/${id}`); }
  create(pc: Partial<PostalCode>): Observable<PostalCode> { return this.http.post<PostalCode>(this.apiUrl, pc); }
  update(id: string, pc: Partial<PostalCode>): Observable<PostalCode> { return this.http.put<PostalCode>(`${this.apiUrl}/${id}`, pc); }
  delete(id: string): Observable<void> { return this.http.delete<void>(`${this.apiUrl}/${id}`); }
}
