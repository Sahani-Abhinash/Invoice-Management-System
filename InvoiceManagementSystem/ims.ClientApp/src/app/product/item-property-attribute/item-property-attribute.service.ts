import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ItemPropertyAttribute, CreateItemPropertyAttributeDto, UpdateItemPropertyAttributeDto } from '../../models/product-property.model';

@Injectable({
    providedIn: 'root'
})
export class ItemPropertyAttributeService {
    private readonly apiUrl = '/api/itempropertyattribute';

    constructor(private http: HttpClient) { }

    getAll(): Observable<ItemPropertyAttribute[]> {
        return this.http.get<ItemPropertyAttribute[]>(this.apiUrl);
    }

    getById(id: string): Observable<ItemPropertyAttribute> {
        return this.http.get<ItemPropertyAttribute>(`${this.apiUrl}/${id}`);
    }

    getByItemId(itemId: string): Observable<ItemPropertyAttribute[]> {
        return this.http.get<ItemPropertyAttribute[]>(`${this.apiUrl}/item/${itemId}`);
    }

    getByPropertyAttributeId(propertyAttributeId: string): Observable<ItemPropertyAttribute[]> {
        return this.http.get<ItemPropertyAttribute[]>(`${this.apiUrl}/attribute/${propertyAttributeId}`);
    }

    create(dto: CreateItemPropertyAttributeDto): Observable<ItemPropertyAttribute> {
        return this.http.post<ItemPropertyAttribute>(this.apiUrl, dto);
    }

    update(id: string, dto: UpdateItemPropertyAttributeDto): Observable<ItemPropertyAttribute> {
        return this.http.put<ItemPropertyAttribute>(`${this.apiUrl}/${id}`, dto);
    }

    delete(id: string): Observable<any> {
        return this.http.delete<any>(`${this.apiUrl}/${id}`);
    }

    deleteByItemId(itemId: string): Observable<any> {
        return this.http.delete<any>(`${this.apiUrl}/item/${itemId}`);
    }
}
