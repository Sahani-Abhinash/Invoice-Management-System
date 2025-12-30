import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
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
    return this.http.get<any>(this.apiUrl).pipe(
      map(response => {
        const data = Array.isArray(response) ? response : (response?.$values || []);
        return data.map((v: any) => this.mapToCamelCase(v));
      })
    );
  }

  private mapToCamelCase(data: any): Vendor {
    const id = data.id || data.Id;
    const addressId = data.addressId || data.AddressId;
    return {
      id: id ? id.toString().toLowerCase() : '',
      name: data.name || data.Name || '',
      contactName: data.contactName || data.ContactName || '',
      email: data.email || data.Email || '',
      phone: data.phone || data.Phone || '',
      taxNumber: data.taxNumber || data.TaxNumber || '',
      addressId: addressId ? addressId.toString().toLowerCase() : undefined,
      address: data.address || data.Address
    };
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
