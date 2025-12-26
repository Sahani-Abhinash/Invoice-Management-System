import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Vendor } from '../../companies/vendor/vendor.service';
import { Warehouse } from '../../warehouse/warehouse.service';
import { Item } from '../../product/items/item.service';

export interface GrnLine {
    id: string;
    itemId: string;
    quantity: number;
    unitPrice: number;
}

export interface Grn {
    id: string;
    vendorId: string;
    warehouseId: string;
    receivedDate: string;
    reference: string;
    isReceived: boolean;
    purchaseOrderId?: string;
    lines: GrnLine[];
}

export interface CreateGrnLineDto {
    itemId: string;
    quantity: number;
    unitPrice: number;
}

export interface CreateGrnDto {
    vendorId: string;
    warehouseId: string;
    purchaseOrderId?: string;
    reference: string;
    lines: CreateGrnLineDto[];
}

@Injectable({
    providedIn: 'root'
})
export class GrnService {
    private apiUrl = 'https://localhost:7276/api/grn';
    private vendorUrl = 'https://localhost:7276/api/vendor';
    private warehouseUrl = 'https://localhost:7276/api/warehouse';
    private itemUrl = 'https://localhost:7276/api/item';

    constructor(private http: HttpClient) { }

    getAll(): Observable<Grn[]> {
        return this.http.get<any[]>(this.apiUrl).pipe(
            map((data: any[]) => data.map((grn: any) => this.mapToCamelCase(grn)))
        );
    }

    getById(id: string): Observable<Grn> {
        return this.http.get<any>(`${this.apiUrl}/${id}`).pipe(
            map((grn: any) => this.mapToCamelCase(grn))
        );
    }

    create(dto: CreateGrnDto): Observable<Grn> {
        return this.http.post<Grn>(this.apiUrl, dto);
    }

    update(id: string, dto: CreateGrnDto): Observable<Grn> {
        return this.http.put<Grn>(`${this.apiUrl}/${id}`, dto);
    }

    receive(id: string): Observable<void> {
        return this.http.post<void>(`${this.apiUrl}/receive/${id}`, {});
    }

    // Helpers
    getVendors(): Observable<Vendor[]> {
        return this.http.get<any[]>(this.vendorUrl).pipe(
            map((data: any[]) => data.map((v: any) => ({
                id: v.id || v.Id,
                name: v.name || v.Name,
                address: v.address || v.Address,
                email: v.email || v.Email,
                phone: v.phone || v.Phone,
                contactName: v.contactName || v.ContactName || '',
                taxNumber: v.taxNumber || v.TaxNumber || ''
            })))
        );
    }

    getWarehouses(): Observable<Warehouse[]> {
        return this.http.get<any[]>(this.warehouseUrl).pipe(
            map((data: any[]) => data.map((w: any) => ({
                id: w.id || w.Id,
                name: w.name || w.Name,
                branch: w.branch || w.Branch
            })))
        );
    }

    getItems(): Observable<Item[]> {
        return this.http.get<any[]>(this.itemUrl).pipe(
            map((data: any[]) => data.map((i: any) => ({
                id: i.id || i.Id,
                name: i.name || i.Name,
                sku: i.sku || i.SKU || i.Sku,
                description: i.description || i.Description,
                price: i.price || i.Price,
                unitOfMeasureId: i.unitOfMeasureId || i.UnitOfMeasureId
            })))
        );
    }

    private mapToCamelCase(grn: any): Grn {
        const id = grn.id || grn.Id || grn.ID || '';
        const vendorId = grn.vendorId || grn.VendorId || grn.VendorID || '';
        const warehouseId = grn.warehouseId || grn.WarehouseId || grn.WarehouseID || '';
        const poId = grn.purchaseOrderId || grn.PurchaseOrderId || grn.PurchaseOrderID || null;

        return {
            id: id.toString().toLowerCase(),
            vendorId: vendorId.toString().toLowerCase(),
            warehouseId: warehouseId.toString().toLowerCase(),
            reference: grn.reference || grn.Reference || '',
            receivedDate: grn.receivedDate || grn.ReceivedDate || '',
            isReceived: grn.isReceived !== undefined ? grn.isReceived : (grn.IsReceived !== undefined ? grn.IsReceived : false),
            purchaseOrderId: poId ? poId.toString().toLowerCase() : undefined,
            lines: (grn.lines || grn.Lines || []).map((l: any) => ({
                id: (l.id || l.Id || l.ID || '').toString().toLowerCase(),
                itemId: (l.itemId || l.ItemId || l.ItemID || l.itemID || '').toString().toLowerCase(),
                quantity: l.quantity || l.Quantity || 0,
                unitPrice: l.unitPrice || l.UnitPrice || 0
            }))
        };
    }
}
