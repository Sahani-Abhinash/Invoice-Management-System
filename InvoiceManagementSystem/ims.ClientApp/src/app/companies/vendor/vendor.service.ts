import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Address } from '../../Master/geography/address/address.service';

export interface Vendor {
  id: string;
  name: string;
  contactName: string;
  email: string;
  phone: string;
  taxNumber: string;
  addressId?: string;
  address?: Address;
}

@Injectable({ providedIn: 'root' })
export class VendorService {
  private apiUrl = 'https://localhost:7276/api/vendor';

  constructor(private http: HttpClient) {}

  getAll(): Observable<Vendor[]> {
    return this.http.get<Vendor[]>(this.apiUrl);
  }

  getById(id: string): Observable<Vendor> {
    return this.http.get<Vendor>(`${this.apiUrl}/${id}`);
  }

  create(payload: Partial<Vendor>): Observable<Vendor> {
    return this.http.post<Vendor>(this.apiUrl, payload);
  }

  update(id: string, payload: Partial<Vendor>): Observable<Vendor> {
    return this.http.put<Vendor>(`${this.apiUrl}/${id}`, payload);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
