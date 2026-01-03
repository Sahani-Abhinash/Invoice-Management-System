import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Category, CreateCategoryDto } from '../models/category.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  private apiUrl = `${environment.apiUrl}/category`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<Category[]> {
    return this.http.get<Category[]>(this.apiUrl);
  }

  getById(id: string): Observable<Category> {
    return this.http.get<Category>(`${this.apiUrl}/${id}`);
  }

  getByName(name: string): Observable<Category> {
    return this.http.get<Category>(`${this.apiUrl}/name/${name}`);
  }

  create(dto: CreateCategoryDto): Observable<Category> {
    return this.http.post<Category>(this.apiUrl, dto);
  }

  update(id: string, dto: CreateCategoryDto): Observable<Category> {
    return this.http.put<Category>(`${this.apiUrl}/${id}`, dto);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
