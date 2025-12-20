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
  [key: string]: any;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = 'https://localhost:7276/api/auth';
  constructor(private http: HttpClient) {}

  login(payload: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, payload);
  }
}
