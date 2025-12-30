import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';

export interface UnitOfMeasure {
    id: string;
    name: string;
    symbol: string;
}

export interface Item {
    id: string;
    name: string;
    sku: string;
    unitOfMeasureId: string;
    unitOfMeasure?: UnitOfMeasure;
    price?: number;
}

export interface CreateItemDto {
    name: string;
    sku: string;
    unitOfMeasureId: string;
}

@Injectable({
    providedIn: 'root'
})
export class ItemService {
    private apiUrl = '/api/item';
    private uomUrl = '/api/unitofmeasure';

    constructor(private http: HttpClient) { }

    getAll(): Observable<Item[]> {
        return this.http.get<any>(this.apiUrl).pipe(
            map(response => {
                const data = Array.isArray(response) ? response : (response?.$values || []);
                return data.map((i: any) => this.mapToCamelCase(i));
            })
        );
    }

    private mapToCamelCase(data: any): Item {
        return {
            id: (data.id || data.Id || '').toString().toLowerCase(),
            name: data.name || data.Name || '',
            sku: data.sku || data.SKU || '',
            unitOfMeasure: data.unitOfMeasure || data.UnitOfMeasure || null,
            unitOfMeasureId: (data.unitOfMeasureId || data.UnitOfMeasureId || '').toString().toLowerCase(),
            price: data.price || data.Price || 0
        };
    }

    getById(id: string): Observable<Item> {
        return this.http.get<Item>(`${this.apiUrl}/${id}`);
    }

    create(dto: CreateItemDto): Observable<Item> {
        return this.http.post<Item>(this.apiUrl, dto);
    }

    update(id: string, dto: CreateItemDto): Observable<Item> {
        return this.http.put<Item>(`${this.apiUrl}/${id}`, dto);
    }

    delete(id: string): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }

    getUnitOfMeasures(): Observable<UnitOfMeasure[]> {
        return this.http.get<UnitOfMeasure[]>(this.uomUrl);
    }
}
