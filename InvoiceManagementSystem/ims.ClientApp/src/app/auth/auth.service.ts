import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface LoginRequest {
  email: string;
  password: string;
  twoFactorCode?: string | null;
  twoFactorRecoveryCode?: string | null;
}

export interface LoginResponse {
  token?: string;
  requiresTwoFactor?: boolean;
  user?: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    fullName: string;
  };
  permissions?: string[];
  [key: string]: any;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = 'https://localhost:7276/api/auth';
  constructor(private http: HttpClient) {}

  login(payload: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, payload);
  }

  getMyPermissions(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/me/permissions`);
  }

  checkPermission(name: string): Observable<{ hasPermission: boolean }> {
    return this.http.get<{ hasPermission: boolean }>(`${this.apiUrl}/me/permissions/check?name=${encodeURIComponent(name)}`);
  }
}
