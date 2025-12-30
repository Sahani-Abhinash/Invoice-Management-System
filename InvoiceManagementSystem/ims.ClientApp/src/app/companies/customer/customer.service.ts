import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Branch } from '../branch/branch.service';
import { Address } from '../../Master/geography/address/address.service';

export interface Customer {
  id: string;
  name: string;
  contactName: string;
  email: string;
  phone: string;
  taxNumber: string;
  branchId?: string;
  branch?: Branch;
  addresses?: Address[];
}

export interface CreateCustomerDto {
  name: string;
  contactName: string;
  email: string;
  phone: string;
  taxNumber: string;
  branchId?: string;
}

@Injectable({ providedIn: 'root' })
export class CustomerService {
  private apiUrl = 'https://localhost:7276/api/customer';

  constructor(private http: HttpClient) {}

  getAll(): Observable<Customer[]> {
    return this.http.get<any>(this.apiUrl).pipe(
      map(response => {
        const data = Array.isArray(response) ? response : (response?.$values || []);
        return data.map((c: any) => this.mapToCamelCase(c));
      })
    );
  }

  getById(id: string): Observable<Customer> {
    return this.http.get<any>(`${this.apiUrl}/${id}`).pipe(
      map(c => this.mapToCamelCase(c))
    );
  }

  getByBranchId(branchId: string): Observable<Customer[]> {
    return this.http.get<any>(`${this.apiUrl}/branch/${branchId}`).pipe(
      map(response => {
        const data = Array.isArray(response) ? response : (response?.$values || []);
        return data.map((c: any) => this.mapToCamelCase(c));
      })
    );
  }

  create(dto: CreateCustomerDto): Observable<Customer> {
    return this.http.post<any>(this.apiUrl, dto).pipe(
      map(c => this.mapToCamelCase(c))
    );
  }

  update(id: string, dto: CreateCustomerDto): Observable<Customer> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, dto).pipe(
      map(c => this.mapToCamelCase(c))
    );
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  private mapToCamelCase(data: any): Customer {
    const id = data.id || data.Id;
    const branchId = data.branchId || data.BranchId;
    return {
      id: id ? id.toString().toLowerCase() : '',
      name: data.name || data.Name || '',
      contactName: data.contactName || data.ContactName || '',
      email: data.email || data.Email || '',
      phone: data.phone || data.Phone || '',
      taxNumber: data.taxNumber || data.TaxNumber || '',
      branchId: branchId ? branchId.toString().toLowerCase() : undefined,
      branch: data.branch || data.Branch
    };
  }
}
