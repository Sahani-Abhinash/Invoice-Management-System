import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Branch } from '../companies/branch/branch.service';

export interface Warehouse {
  id: string;
  name: string;
  branch?: Branch; // BranchDto
}

export interface CreateWarehouse {
  branchId: string;
  name: string;
}

@Injectable({
  providedIn: 'root'
})
export class WarehouseService {
  private apiUrl = '/api/warehouse';

  constructor(private http: HttpClient) { }

  getAll(): Observable<Warehouse[]> {
    return this.http.get<Warehouse[]>(this.apiUrl);
  }

  getById(id: string): Observable<Warehouse> {
    return this.http.get<Warehouse>(`${this.apiUrl}/${id}`);
  }

  getByBranchId(branchId: string): Observable<Warehouse[]> {
    return this.http.get<Warehouse[]>(`${this.apiUrl}/branch/${branchId}`);
  }

  create(dto: CreateWarehouse): Observable<Warehouse> {
    return this.http.post<Warehouse>(this.apiUrl, dto);
  }

  update(id: string, dto: CreateWarehouse): Observable<Warehouse> {
    return this.http.put<Warehouse>(`${this.apiUrl}/${id}`, dto);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
