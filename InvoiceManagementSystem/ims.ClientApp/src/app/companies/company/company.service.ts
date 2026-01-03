import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Company {
  id: string;
  name: string;
  taxNumber: string;
  email?: string;
  phone?: string;
  logoUrl?: string;
  defaultCurrencyId?: string;
}

@Injectable({
  providedIn: 'root'
})

export class CompanyService {
  private baseUrl = 'https://localhost:7276';
  private apiUrl = `${this.baseUrl}/api/company`;

  constructor(private http: HttpClient) { }

  getBaseUrl(): string {
    return this.baseUrl;
  }

  getAll(): Observable<Company[]> {
    return this.http.get<Company[]>(this.apiUrl);
  }

  getById(id: string): Observable<Company> {
    return this.http.get<Company>(`${this.apiUrl}/${id}`);
  }

  create(company: Partial<Company>): Observable<Company> {
    return this.http.post<Company>(this.apiUrl, company);
  }

  update(id: string, company: Partial<Company>): Observable<Company> {
    return this.http.put<Company>(`${this.apiUrl}/${id}`, company);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  uploadLogo(id: string, formData: FormData): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/${id}/upload-logo`, formData);
  }
}
