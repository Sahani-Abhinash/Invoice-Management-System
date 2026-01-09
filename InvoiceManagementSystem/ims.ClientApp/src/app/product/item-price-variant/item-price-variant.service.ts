import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ItemPriceVariant, CreateItemPriceVariantDto, UpdateItemPriceVariantDto } from '../../models/product-property.model';

@Injectable({
    providedIn: 'root'
})
export class ItemPriceVariantService {
    private apiUrl = 'https://localhost:7276/api/itempricevariants';

    constructor(private http: HttpClient) { }

    /**
     * Get all item price variants
     */
    getAll(): Observable<ItemPriceVariant[]> {
        return this.http.get<ItemPriceVariant[]>(this.apiUrl);
    }

    /**
     * Get a specific variant by ID
     */
    getById(id: string): Observable<ItemPriceVariant> {
        return this.http.get<ItemPriceVariant>(`${this.apiUrl}/${id}`);
    }

    /**
     * Get all variants for a specific ItemPrice
     * Useful for displaying all variant options for a product
     * Example: Color: Red, White, Blue | Size: S, M, L
     */
    getByItemPriceId(itemPriceId: string): Observable<ItemPriceVariant[]> {
        return this.http.get<ItemPriceVariant[]>(`${this.apiUrl}/itemprice/${itemPriceId}`);
    }

    /**
     * Get all ItemPrices that use a specific property attribute
     * Useful for filtering products by variant value (e.g., all products with "Red" color)
     */
    getByPropertyAttributeId(propertyAttributeId: string): Observable<ItemPriceVariant[]> {
        return this.http.get<ItemPriceVariant[]>(`${this.apiUrl}/propertyattribute/${propertyAttributeId}`);
    }

    /**
     * Create a new variant for an ItemPrice
     */
    create(dto: CreateItemPriceVariantDto): Observable<ItemPriceVariant> {
        return this.http.post<ItemPriceVariant>(this.apiUrl, dto);
    }

    /**
     * Update an existing variant
     */
    update(id: string, dto: UpdateItemPriceVariantDto): Observable<ItemPriceVariant> {
        return this.http.put<ItemPriceVariant>(`${this.apiUrl}/${id}`, dto);
    }

    /**
     * Delete a specific variant
     */
    delete(id: string): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }

    /**
     * Delete all variants for a specific ItemPrice
     */
    deleteByItemPriceId(itemPriceId: string): Observable<boolean> {
        return this.http.delete<boolean>(`${this.apiUrl}/itemprice/${itemPriceId}`);
    }
}
