import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';

export interface PriceList {
    id: string;
    name: string;
    isDefault: boolean;
}

export interface CreatePriceListDto {
    name: string;
    isDefault: boolean;
}

@Injectable({
    providedIn: 'root'
})
export class PriceListService {
    private apiUrl = 'https://localhost:7276/api/pricelist';

    constructor(private http: HttpClient) { }

    getAll(): Observable<PriceList[]> {
        return this.http.get<any[]>(this.apiUrl).pipe(
            map(data => data.map(item => ({
                id: item.id || item.Id,
                name: item.name || item.Name,
                isDefault: item.isDefault || item.IsDefault
            })))
        );
    }

    getById(id: string): Observable<PriceList> {
        return this.http.get<any>(`${this.apiUrl}/${id}`).pipe(
            map(item => ({
                id: item.id || item.Id,
                name: item.name || item.Name,
                isDefault: item.isDefault || item.IsDefault
            }))
        );
    }

    create(dto: CreatePriceListDto): Observable<PriceList> {
        return this.http.post<PriceList>(this.apiUrl, dto);
    }

    update(id: string, dto: CreatePriceListDto): Observable<PriceList> {
        return this.http.put<PriceList>(`${this.apiUrl}/${id}`, dto);
    }

    delete(id: string): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }
}
