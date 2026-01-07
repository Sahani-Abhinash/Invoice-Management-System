import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { ProductProperty, CreateProductPropertyDto } from '../../models/product-property.model';

@Injectable({
    providedIn: 'root'
})
export class ProductPropertyService {
    private apiUrl = '/api/productproperty';

    constructor(private http: HttpClient) { }

    getAll(): Observable<ProductProperty[]> {
        return this.http.get<any>(this.apiUrl).pipe(
            map(response => {
                const data = Array.isArray(response) ? response : (response?.$values || []);
                return data.map((p: any) => this.mapToCamelCase(p));
            })
        );
    }

    getById(id: string): Observable<ProductProperty> {
        return this.http.get<any>(`${this.apiUrl}/${id}`).pipe(
            map(response => this.mapToCamelCase(response))
        );
    }

    create(dto: CreateProductPropertyDto): Observable<ProductProperty> {
        return this.http.post<any>(this.apiUrl, dto).pipe(
            map(response => this.mapToCamelCase(response))
        );
    }

    update(id: string, dto: CreateProductPropertyDto): Observable<ProductProperty> {
        return this.http.put<any>(`${this.apiUrl}/${id}`, dto).pipe(
            map(response => this.mapToCamelCase(response))
        );
    }

    delete(id: string): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }

    private mapToCamelCase(data: any): ProductProperty {
        return {
            id: (data.id || data.Id || '').toString().toLowerCase(),
            name: data.name || data.Name || '',
            description: data.description || data.Description,
            displayOrder: data.displayOrder || data.DisplayOrder || 0
        };
    }
}
