import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Permission {
  id: string;
  name: string;
  description?: string;
}

export interface CreatePermissionDto {
  name: string;
  description?: string;
}

@Injectable({ providedIn: 'root' })
export class PermissionService {
  private apiUrl = 'https://localhost:7276/api/permission';
  
  constructor(private http: HttpClient) {}

  private normalizePermission(raw: any): Permission {
    return {
      id: raw?.id ?? raw?.Id ?? '',
      name: raw?.name ?? raw?.Name ?? '',
      description: raw?.description ?? raw?.Description ?? undefined
    };
  }

  getById(id: string): Observable<Permission> {
    return this.http.get<any>(`${this.apiUrl}/${id}`).pipe(
      map(res => {
        const raw = res?.data ?? res?.value ?? res?.result ?? res;
        return this.normalizePermission(raw);
      })
    );
  }

  getAll(): Observable<Permission[]> {
    return this.http.get<any>(this.apiUrl).pipe(
      map(res => {
        let arr: any = [];
        if (Array.isArray(res)) arr = res;
        else if (Array.isArray(res?.data)) arr = res.data;
        else if (Array.isArray(res?.items)) arr = res.items;
        else if (Array.isArray(res?.value)) arr = res.value;
        else if (Array.isArray(res?.result)) arr = res.result;
        else if (Array.isArray(res?.permissions)) arr = res.permissions;
        return Array.isArray(arr) ? arr.map(x => this.normalizePermission(x)) : [];
      })
    );
  }

  create(dto: CreatePermissionDto): Observable<Permission> {
    return this.http.post<Permission>(this.apiUrl, dto);
  }

  update(id: string, dto: CreatePermissionDto): Observable<Permission> {
    return this.http.put<Permission>(`${this.apiUrl}/${id}`, dto);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
