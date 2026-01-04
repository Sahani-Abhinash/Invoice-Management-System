import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Item } from '../../product/items/item.service';

export interface PriceList {
    id: string;
    name: string;
    isDefault: boolean;
}

export interface ItemPrice {
    id: string;
    item?: Item | null;
    priceList?: PriceList | null;
    price: number;
    effectiveFrom: string;
    effectiveTo?: string;
}

export interface CreateItemPriceDto {
    itemId: string;
    priceListId: string;
    price: number;
    effectiveFrom: string;
    effectiveTo?: string;
}

@Injectable({
    providedIn: 'root'
})
export class ItemPriceService {
    private apiUrl = 'https://localhost:7276/api/itemprice';
    private priceListUrl = 'https://localhost:7276/api/pricelist';
    private itemUrl = 'https://localhost:7276/api/item';

    constructor(private http: HttpClient) { }

    getAll(): Observable<ItemPrice[]> {
        return this.http.get<any[]>(this.apiUrl).pipe(
            map(data => data.map(ip => ({
                id: ip.id || ip.Id,
                price: ip.price || ip.Price,
                effectiveFrom: ip.effectiveFrom || ip.EffectiveFrom,
                effectiveTo: ip.effectiveTo || ip.EffectiveTo,
                item: ip.item || ip.Item ? {
                    id: (ip.item || ip.Item).id || (ip.item || ip.Item).Id,
                    name: (ip.item || ip.Item).name || (ip.item || ip.Item).Name,
                    sku: (ip.item || ip.Item).sku || (ip.item || ip.Item).SKU,
                    unitOfMeasureId: (ip.item || ip.Item).unitOfMeasureId || (ip.item || ip.Item).UnitOfMeasureId
                } : null,
                priceList: ip.priceList || ip.PriceList ? {
                    id: (ip.priceList || ip.PriceList).id || (ip.priceList || ip.PriceList).Id,
                    name: (ip.priceList || ip.PriceList).name || (ip.priceList || ip.PriceList).Name,
                    isDefault: (ip.priceList || ip.PriceList).isDefault || (ip.priceList || ip.PriceList).IsDefault
                } : null
            } as unknown as ItemPrice)))
        );
    }

    getById(id: string): Observable<ItemPrice> {
        return this.http.get<ItemPrice>(`${this.apiUrl}/${id}`);
    }

    create(dto: CreateItemPriceDto): Observable<ItemPrice> {
        return this.http.post<ItemPrice>(this.apiUrl, dto);
    }

    update(id: string, dto: CreateItemPriceDto): Observable<ItemPrice> {
        return this.http.put<ItemPrice>(`${this.apiUrl}/${id}`, dto);
    }

    delete(id: string): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }

    getItems(): Observable<Item[]> {
        return this.http.get<Item[]>(this.itemUrl);
    }

    getItemsWithPricesForPriceList(priceListId: string): Observable<any[]> {
        return this.http.get<any[]>(`${this.apiUrl}/pricelist/${priceListId}/items`);
    }

    getPriceLists(): Observable<PriceList[]> {
        return this.http.get<PriceList[]>(this.priceListUrl);
    }
}
