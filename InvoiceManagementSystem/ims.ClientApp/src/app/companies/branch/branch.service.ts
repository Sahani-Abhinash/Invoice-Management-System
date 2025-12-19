import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Branch {
  id: string;
  name: string;
  companyId: string;
}

@Injectable({
  providedIn: 'root'
})
export class BranchService {
  private apiUrl = 'https://localhost:7276/api/branch';

  constructor(private http: HttpClient) { }

  getAll(): Observable<Branch[]> {
    return this.http.get<Branch[]>(this.apiUrl);
  }

  getById(id: string): Observable<Branch> {
    return this.http.get<Branch>(`${this.apiUrl}/${id}`);
  }

  create(branch: Partial<Branch>): Observable<Branch> {
    return this.http.post<Branch>(this.apiUrl, branch);
  }

  update(id: string, branch: Partial<Branch>): Observable<Branch> {
    return this.http.put<Branch>(`${this.apiUrl}/${id}`, branch);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
