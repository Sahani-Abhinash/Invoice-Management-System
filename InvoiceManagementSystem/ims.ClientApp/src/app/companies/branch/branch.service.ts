import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Address } from '../../Master/geography/address/address.service';

export interface Branch {
  id: string;
  name: string;
  addressId?: string;
  address?: Address;
}

@Injectable({
  providedIn: 'root'
})
export class BranchService {
  private apiUrl = '/api/branch';

  constructor(private http: HttpClient) { }

  getAll(): Observable<Branch[]> {
    return this.http.get<any>(this.apiUrl).pipe(
      map(response => {
        const data = Array.isArray(response) ? response : (response?.$values || []);
        return data.map((b: any) => this.mapToCamelCase(b));
      })
    );
  }

  private mapToCamelCase(data: any): Branch {
    const id = data.id || data.Id;
    const addressId = data.addressId || data.AddressId;
    return {
      id: id ? id.toString().toLowerCase() : '',
      name: data.name || data.Name || '',
      addressId: addressId ? addressId.toString().toLowerCase() : undefined,
      address: data.address || data.Address
    };
  }

  getById(id: string): Observable<Branch> {
    return this.http.get<Branch>(`${this.apiUrl}/${id}`);
  }

  create(branch: Partial<Branch>): Observable<Branch> {
    return this.http.post<Branch>(this.apiUrl, branch);
  }

  update(id: string, branch: Partial<Branch>): Observable<Branch> {
    return this.http.put<Branch>(`${this.apiUrl}/${id}`, branch);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
