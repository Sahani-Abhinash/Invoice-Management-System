import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

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
  mobile?: string;
  gender?: string;
  profilePictureUrl?: string;
  status?: UserStatus | number;
}

// Frontend DTO aligned loosely with backend CreateUserDto
export enum UserStatus {
  Active = 0,
  Inactive = 1,
}

export interface CreateUserDto {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  status: UserStatus | number;
  mobile?: string;
  gender?: string;
  profilePictureUrl?: string;
}

@Injectable({ providedIn: 'root' })
export class UserService {
  // Use absolute API URL for fixed backend port
  private apiUrl = 'https://localhost:7276/api/users';
  constructor(private http: HttpClient) {}

  private normalizeUser(raw: any): UserProfile {
    const firstName = raw?.firstName ?? raw?.FirstName ?? raw?.given_name;
    const lastName = raw?.lastName ?? raw?.LastName ?? raw?.family_name;
    const name = raw?.name ?? raw?.Name ?? raw?.fullName ?? raw?.FullName ?? [firstName, lastName].filter(Boolean).join(' ');
    return {
      id: raw?.id ?? raw?.Id ?? raw?.userId ?? raw?.UserId ?? '',
      email: raw?.email ?? raw?.Email ?? undefined,
      name,
      fullName: raw?.fullName ?? raw?.FullName ?? undefined,
      fullname: raw?.fullname ?? undefined,
      firstName: firstName ?? undefined,
      lastName: lastName ?? undefined,
      given_name: raw?.given_name ?? undefined,
      family_name: raw?.family_name ?? undefined,
      mobile: raw?.mobile ?? raw?.Mobile ?? raw?.phoneNumber ?? raw?.PhoneNumber ?? raw?.phone ?? raw?.Phone ?? undefined,
      gender: raw?.gender ?? raw?.Gender ?? undefined,
      profilePictureUrl: raw?.profilePictureUrl ?? raw?.ProfilePictureUrl ?? raw?.profilePicture ?? raw?.ProfilePicture ?? undefined,
      status: raw?.status ?? raw?.Status ?? UserStatus.Active,
    };
  }

  getById(id: string): Observable<UserProfile> {
    return this.http.get<any>(`${this.apiUrl}/${id}`).pipe(
      map(res => {
        // Unwrap common API response shapes
        const raw = res?.data ?? res?.value ?? res?.result ?? res?.user ?? res?.User ?? res;
        return this.normalizeUser(raw);
      })
    );
  }

  getAll(): Observable<UserProfile[]> {
    return this.http.get<any>(this.apiUrl).pipe(
      map(res => {
        let arr: any = [];
        if (Array.isArray(res)) arr = res;
        else if (Array.isArray(res?.data)) arr = res.data;
        else if (Array.isArray(res?.items)) arr = res.items;
        else if (Array.isArray(res?.value)) arr = res.value;
        else if (Array.isArray(res?.result)) arr = res.result;
        else if (Array.isArray(res?.results)) arr = res.results;
        else if (Array.isArray(res?.users)) arr = res.users;
        else if (Array.isArray(res?.Users)) arr = res.Users;
        else if (Array.isArray(res?.data?.items)) arr = res.data.items;
        else if (Array.isArray(res?.payload)) arr = res.payload;
        return Array.isArray(arr) ? arr.map(x => this.normalizeUser(x)) : [];
      })
    );
  }

  // create/update/delete remain unchanged

  create(dto: CreateUserDto): Observable<UserProfile> {
    return this.http.post<UserProfile>(this.apiUrl, dto);
  }

  update(id: string, dto: CreateUserDto): Observable<UserProfile> {
    return this.http.put<UserProfile>(`${this.apiUrl}/${id}`, dto);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  uploadProfilePicture(id: string, formData: FormData): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/${id}/upload-profile-picture`, formData);
  }
}
