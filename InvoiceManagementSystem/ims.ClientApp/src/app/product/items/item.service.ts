import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

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
    private apiUrl = 'https://localhost:7276/api/item';
    private uomUrl = 'https://localhost:7276/api/unitofmeasure';

    constructor(private http: HttpClient) { }

    getAll(): Observable<Item[]> {
        return this.http.get<Item[]>(this.apiUrl);
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
