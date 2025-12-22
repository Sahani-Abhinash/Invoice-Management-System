import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface RolePermissionDto {
  roleId: string;
  permissionId: string;
}

export interface AssignPermissionDto {
  roleId: string;
  permissionId: string;
}

@Injectable({ providedIn: 'root' })
export class RolePermissionService {
  private apiUrl = 'https://localhost:7276/api/RolePermission';

  constructor(private http: HttpClient) {}

  getAll(): Observable<RolePermissionDto[]> {
    return this.http.get<any>(this.apiUrl).pipe(
      map(res => {
        let arr: any = [];
        if (Array.isArray(res)) arr = res;
        else if (Array.isArray(res?.data)) arr = res.data;
        else if (Array.isArray(res?.items)) arr = res.items;
        else if (Array.isArray(res?.value)) arr = res.value;
        return Array.isArray(arr) ? arr : [];
      })
    );
  }

  getPermissionsForRole(roleId: string): Observable<any[]> {
    return this.http.get<any>(`${this.apiUrl}/role/${roleId}`).pipe(
      map(res => {
        let arr: any = [];
        if (Array.isArray(res)) arr = res;
        else if (Array.isArray(res?.data)) arr = res.data;
        else if (Array.isArray(res?.items)) arr = res.items;
        else if (Array.isArray(res?.value)) arr = res.value;
        else if (Array.isArray(res?.permissions)) arr = res.permissions;
        return Array.isArray(arr) ? arr : [];
      })
    );
  }

  assignPermission(dto: AssignPermissionDto): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/assign`, dto);
  }

  removePermission(dto: AssignPermissionDto): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/remove`, dto);
  }
}
