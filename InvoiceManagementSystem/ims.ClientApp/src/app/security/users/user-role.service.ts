import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface UserRoleDto {
  userId: string;
  roleId: string;
}

export interface AssignRoleDto {
  userId: string;
  roleId: string;
}

@Injectable({ providedIn: 'root' })
export class UserRoleService {
  private apiUrl = 'https://localhost:7276/api/UserRole';

  constructor(private http: HttpClient) {}

  getAll(): Observable<UserRoleDto[]> {
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

  getRolesForUser(userId: string): Observable<any[]> {
    return this.http.get<any>(`${this.apiUrl}/user/${userId}`).pipe(
      map(res => {
        let arr: any = [];
        if (Array.isArray(res)) arr = res;
        else if (Array.isArray(res?.data)) arr = res.data;
        else if (Array.isArray(res?.items)) arr = res.items;
        else if (Array.isArray(res?.value)) arr = res.value;
        else if (Array.isArray(res?.roles)) arr = res.roles;
        return Array.isArray(arr) ? arr : [];
      })
    );
  }

  assignRole(dto: AssignRoleDto): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/assign`, dto);
  }

  removeRole(dto: AssignRoleDto): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/remove`, dto);
  }
}
