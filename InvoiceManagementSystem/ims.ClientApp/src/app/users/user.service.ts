import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface UserProfile {
  id: string;
  email?: string;
  name?: string;
  fullName?: string;
  fullname?: string;
  firstName?: string;
  lastName?: string;
  given_name?: string;
  family_name?: string;
}

@Injectable({ providedIn: 'root' })
export class UserService {
  private apiUrl = 'https://localhost:7276/api/users';
  constructor(private http: HttpClient) {}

  getById(id: string): Observable<UserProfile> {
    return this.http.get<UserProfile>(`${this.apiUrl}/${id}`);
  }
}
