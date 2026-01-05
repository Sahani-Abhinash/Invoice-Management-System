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
    images?: ItemImage[];
    mainImageUrl?: string;
}

export interface ItemImage {
    id: string;
    itemId: string;
    imageUrl: string;
    isMain: boolean;
}

export interface CreateItemImageDto {
    itemId: string;
    imageUrl: string;
    isMain: boolean;
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
        const images = this.normalizeImages(data.images || data.Images);
        const mainImage = images.find(i => i.isMain) || images[0];
        const serverMainImage = data.mainImageUrl || data.MainImageUrl || '';

        return {
            id: (data.id || data.Id || '').toString().toLowerCase(),
            name: data.name || data.Name || '',
            sku: data.sku || data.SKU || '',
            unitOfMeasure: data.unitOfMeasure || data.UnitOfMeasure || null,
            unitOfMeasureId: (data.unitOfMeasureId || data.UnitOfMeasureId || '').toString().toLowerCase(),
            price: data.price || data.Price || 0,
            images,
            mainImageUrl: this.resolveImageUrl(serverMainImage || mainImage?.imageUrl)
        };
    }

    private normalizeImages(raw: any): ItemImage[] {
        const collection = Array.isArray(raw) ? raw : (raw?.$values || []);
        return collection.map((img: any) => ({
            id: (img.id || img.Id || '').toString().toLowerCase(),
            itemId: (img.itemId || img.ItemId || '').toString().toLowerCase(),
            imageUrl: this.resolveImageUrl(img.imageUrl || img.ImageUrl || ''),
            isMain: Boolean(img.isMain ?? img.IsMain)
        }));
    }

    private resolveImageUrl(url: string | null | undefined): string {
        const trimmed = (url || '').trim();
        if (!trimmed) return '';
        if (/^https?:\/\//i.test(trimmed)) return trimmed;
        if (trimmed.startsWith('/')) return trimmed;
        return '/' + trimmed.replace(/^\/+/, '');
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

    // Image methods
    getItemImages(itemId: string): Observable<ItemImage[]> {
        return this.http.get<ItemImage[]>(`/api/itemimage/item/${itemId}`);
    }

    uploadImage(itemId: string, file: File, isMain: boolean = false): Observable<ItemImage> {
        const formData = new FormData();
        formData.append('file', file);
        return this.http.post<ItemImage>(`/api/itemimage/${itemId}/upload`, formData);
    }

    getImage(itemId: string, imageId: string): Observable<ItemImage> {
        return this.http.get<ItemImage>(`/api/itemimage/${imageId}`);
    }

    setMainImage(itemId: string, image: ItemImage): Observable<ItemImage> {
        const dto: CreateItemImageDto = {
            itemId: itemId,
            imageUrl: image.imageUrl,
            isMain: true
        };
        return this.http.put<ItemImage>(`/api/itemimage/${image.id}`, dto);
    }

    deleteImage(itemId: string, imageId: string): Observable<void> {
        return this.http.delete<void>(`/api/itemimage/${imageId}`);
    }
}
