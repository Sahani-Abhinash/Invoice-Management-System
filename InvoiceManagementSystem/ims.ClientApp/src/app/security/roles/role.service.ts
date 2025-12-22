import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Role {
  id: string;
  name: string;
  description?: string;
}

export interface CreateRoleDto {
  name: string;
  description?: string;
}

@Injectable({ providedIn: 'root' })
export class RoleService {
  private apiUrl = 'https://localhost:7276/api/Role';

  constructor(private http: HttpClient) {}

  // Safely pick a value from an object using case-insensitive key matching
  private pickCaseInsensitive(obj: any, keys: string[]): unknown {
    if (!obj || typeof obj !== 'object') return undefined;
    const map = new Map<string, string>();
    for (const k of Object.keys(obj)) map.set(k.toLowerCase(), k);
    for (const key of keys) {
      const actual = map.get(key.toLowerCase());
      if (actual !== undefined) {
        const val = (obj as any)[actual];
        if (val !== undefined && val !== null) return val;
      }
    }
    return undefined;
  }

  private normalizeRole(raw: any): Role {
    const idVal = this.pickCaseInsensitive(raw, [
      'id', '_id', 'Id', 'ID',
      'roleid', 'role_id', 'roleId', 'RoleId', 'RoleID'
    ]);
    const nameVal = this.pickCaseInsensitive(raw, [
      'name', 'Name', 'roleName', 'RoleName'
    ]);
    const descVal = this.pickCaseInsensitive(raw, [
      'description', 'Description', 'desc', 'Desc'
    ]);

    return {
      id: idVal !== undefined && idVal !== null ? String(idVal) : '',
      name: (nameVal as string) ?? '',
      description: (descVal as string) ?? undefined,
    };
  }

  getAll(): Observable<Role[]> {
    return this.http.get<any>(this.apiUrl).pipe(
      map(res => {
        let arr: any = [];
        if (Array.isArray(res)) arr = res;
        else if (Array.isArray(res?.data)) arr = res.data;
        else if (Array.isArray(res?.items)) arr = res.items;
        else if (Array.isArray(res?.value)) arr = res.value;
        else if (Array.isArray(res?.result)) arr = res.result;
        else if (Array.isArray(res?.results)) arr = res.results;
        else if (Array.isArray(res?.roles)) arr = res.roles;
        else if (Array.isArray(res?.Roles)) arr = res.Roles;
        else if (Array.isArray(res?.data?.items)) arr = res.data.items;
        else if (Array.isArray(res?.payload)) arr = res.payload;
        return Array.isArray(arr) ? arr.map(x => this.normalizeRole(x)) : [];
      })
    );
  }

  getById(id: string): Observable<Role> {
    return this.http.get<any>(`${this.apiUrl}/${id}`).pipe(
      map(res => {
        // Unwrap common API response shapes
        const raw = res?.data ?? res?.value ?? res?.result ?? res?.role ?? res?.Role ?? res;
        return this.normalizeRole(raw);
      })
    );
  }

  create(dto: CreateRoleDto): Observable<Role> {
    return this.http.post<Role>(this.apiUrl, dto);
  }

  update(id: string, dto: CreateRoleDto): Observable<Role> {
    return this.http.put<Role>(`${this.apiUrl}/${id}`, dto);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
