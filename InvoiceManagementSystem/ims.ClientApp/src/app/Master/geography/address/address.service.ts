import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export enum AddressType {
  Other = 0,
  Billing = 1,
  Shipping = 2,
  HeadOffice = 3,
  Branch = 4,
  Residence = 5,
  Office = 6
}

export type OwnerType = 'User' | 'Branch' | 'Customer' | 'Company';

export interface Address {
  id: string;
  line1: string;
  line2?: string;
  countryId?: string | null;
  stateId?: string | null;
  cityId?: string | null;
  postalCodeId?: string | null;
  country?: { id: string; name: string } | null;
  state?: { id: string; name: string } | null;
  city?: { id: string; name: string } | null;
  postalCode?: { id: string; code: string } | null;
  latitude?: number;
  longitude?: number;
  type?: AddressType | null;
}

export interface CreateAddress {
  line1: string;
  line2?: string;
  countryId?: string | null;
  stateId?: string | null;
  cityId?: string | null;
  postalCodeId?: string | null;
  latitude?: number;
  longitude?: number;
  type?: AddressType | null;
}

@Injectable({ providedIn: 'root' })
export class AddressService {
  private apiUrl = 'https://localhost:7276/api/address';
  constructor(private http: HttpClient) {}

  getAll(): Observable<Address[]> { return this.http.get<Address[]>(this.apiUrl); }
  getById(id: string): Observable<Address> { return this.http.get<Address>(`${this.apiUrl}/${id}`); }
  create(dto: CreateAddress): Observable<Address> { return this.http.post<Address>(this.apiUrl, dto); }
  update(id: string, dto: CreateAddress): Observable<Address> { return this.http.put<Address>(`${this.apiUrl}/${id}`, dto); }
  delete(id: string): Observable<void> { return this.http.delete<void>(`${this.apiUrl}/${id}`); }

  link(addressId: string, ownerType: OwnerType, ownerId: string, primary = false): Observable<void> {
    const params = new HttpParams()
      .set('addressId', addressId)
      .set('ownerType', ownerType)
      .set('ownerId', ownerId)
      .set('primary', String(primary));
    return this.http.post<void>(`${this.apiUrl}/link`, null, { params });
  }

  unlink(addressId: string, ownerType: OwnerType, ownerId: string): Observable<void> {
    const params = new HttpParams()
      .set('addressId', addressId)
      .set('ownerType', ownerType)
      .set('ownerId', ownerId);
    return this.http.post<void>(`${this.apiUrl}/unlink`, null, { params });
  }

  getForOwner(ownerType: OwnerType, ownerId: string): Observable<Address[]> {
    return this.http.get<Address[]>(`${this.apiUrl}/owner/${ownerType}/${ownerId}`);
  }
}
