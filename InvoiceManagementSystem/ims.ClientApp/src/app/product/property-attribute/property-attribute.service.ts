import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { PropertyAttribute, CreatePropertyAttributeDto } from '../../models/product-property.model';

@Injectable({
    providedIn: 'root'
})
export class PropertyAttributeService {
    private apiUrl = '/api/propertyattribute';

    constructor(private http: HttpClient) { }

    getAll(): Observable<PropertyAttribute[]> {
        return this.http.get<any>(this.apiUrl).pipe(
            map(response => {
                const data = Array.isArray(response) ? response : (response?.$values || []);
                return data.map((a: any) => this.mapToCamelCase(a));
            })
        );
    }

    getByPropertyId(propertyId: string): Observable<PropertyAttribute[]> {
        return this.http.get<any>(`${this.apiUrl}/property/${propertyId}`).pipe(
            map(response => {
                const data = Array.isArray(response) ? response : (response?.$values || []);
                return data.map((a: any) => this.mapToCamelCase(a));
            })
        );
    }

    getById(id: string): Observable<PropertyAttribute> {
        return this.http.get<any>(`${this.apiUrl}/${id}`).pipe(
            map(response => this.mapToCamelCase(response))
        );
    }

    create(dto: CreatePropertyAttributeDto): Observable<PropertyAttribute> {
        return this.http.post<any>(this.apiUrl, dto).pipe(
            map(response => this.mapToCamelCase(response))
        );
    }

    update(id: string, dto: CreatePropertyAttributeDto): Observable<PropertyAttribute> {
        return this.http.put<any>(`${this.apiUrl}/${id}`, dto).pipe(
            map(response => this.mapToCamelCase(response))
        );
    }

    delete(id: string): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }

    private mapToCamelCase(data: any): PropertyAttribute {
        return {
            id: (data.id || data.Id || '').toString().toLowerCase(),
            productPropertyId: (data.productPropertyId || data.ProductPropertyId || '').toString().toLowerCase(),
            productPropertyName: data.productPropertyName || data.ProductPropertyName || '',
            value: data.value || data.Value || '',
            description: data.description || data.Description,
            displayOrder: data.displayOrder || data.DisplayOrder || 0,
            metadata: data.metadata || data.Metadata
        };
    }
}
