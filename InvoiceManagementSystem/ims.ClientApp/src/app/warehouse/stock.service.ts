import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';

export interface Stock {
    id: string;
    item: {
        id: string;
        name: string;
        code: string;
    };
    warehouse: {
        id: string;
        name: string;
        branchId?: string;
    };
    quantity: number;
}

@Injectable({
    providedIn: 'root'
})
export class StockService {
    private apiUrl = '/api/stock';

    constructor(private http: HttpClient) { }

    getAll(): Observable<Stock[]> {
        return this.http.get<any>(this.apiUrl).pipe(
            map(response => {
                const data = Array.isArray(response) ? response : (response?.$values || []);
                console.log('Raw stock data from API:', data);
                return data.map((s: any) => this.mapToCamelCase(s));
            })
        );
    }

    getById(id: string): Observable<Stock> {
        return this.http.get<any>(`${this.apiUrl}/${id}`).pipe(
            map(s => {
                console.log('Raw single stock data:', s);
                return this.mapToCamelCase(s);
            })
        );
    }

    getByWarehouseId(warehouseId: string): Observable<Stock[]> {
        return this.http.get<any>(`${this.apiUrl}/warehouse/${warehouseId}`).pipe(
            map(response => {
                const data = Array.isArray(response) ? response : (response?.$values || []);
                return data.map((s: any) => this.mapToCamelCase(s));
            })
        );
    }

    private mapToCamelCase(data: any): Stock {
        const safeLower = (val: any) => val ? val.toString().toLowerCase() : '';

        // Handle nested Branch/Item which could be under property name variations
        const nestedWarehouse = data.warehouse || data.Warehouse;
        const nestedItem = data.item || data.Item;
        const nestedBranch = nestedWarehouse?.branch || nestedWarehouse?.Branch;

        return {
            id: safeLower(data.id || data.Id),
            item: {
                id: safeLower(nestedItem?.id || nestedItem?.Id),
                name: nestedItem?.name || nestedItem?.Name || '',
                code: nestedItem?.sku || nestedItem?.SKU || nestedItem?.code || nestedItem?.Code || ''
            },
            warehouse: {
                id: safeLower(nestedWarehouse?.id || nestedWarehouse?.Id),
                name: nestedWarehouse?.name || nestedWarehouse?.Name || '',
                branchId: safeLower(nestedBranch?.id || nestedBranch?.Id || nestedWarehouse?.branchId || nestedWarehouse?.BranchId)
            },
            quantity: data.quantity ?? data.Quantity ?? 0
        };
    }
}
