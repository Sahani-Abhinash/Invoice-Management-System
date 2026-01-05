import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Vendor } from '../../companies/vendor/vendor.service';
import { Warehouse } from '../../warehouse/warehouse.service';
import { Item } from '../../product/items/item.service';

export interface PurchaseOrderLine {
    id: string;
    itemId: string;
    quantityOrdered: number;
    unitPrice: number;
    receivedQuantity?: number;
}

export interface PurchaseOrder {
    id: string;
    vendorId: string;
    warehouseId: string;
    orderDate: string;
    reference: string;
    isApproved: boolean;
    isClosed: boolean;
    accountId?: string;
    lines: PurchaseOrderLine[];
}

export interface CreatePurchaseOrderLineDto {
    itemId: string;
    quantityOrdered: number;
    unitPrice: number;
}

export interface CreatePurchaseOrderDto {
    vendorId: string;
    warehouseId: string;
    reference: string;
    accountId?: string;
    lines: CreatePurchaseOrderLineDto[];
}

@Injectable({
    providedIn: 'root'
})
export class PurchaseOrderService {
    private apiUrl = '/api/purchaseorder';
    private vendorUrl = '/api/vendor';
    private warehouseUrl = '/api/warehouse';
    private itemUrl = '/api/item';

    constructor(private http: HttpClient) { }

    getAll(): Observable<PurchaseOrder[]> {
        return this.http.get<any[]>(this.apiUrl).pipe(
            map((data: any[]) => data.map((po: any) => this.mapToCamelCase(po)))
        );
    }

    getById(id: string): Observable<PurchaseOrder> {
        return this.http.get<any>(`${this.apiUrl}/${id}`).pipe(
            map((po: any) => this.mapToCamelCase(po))
        );
    }

    create(dto: CreatePurchaseOrderDto): Observable<PurchaseOrder> {
        return this.http.post<PurchaseOrder>(this.apiUrl, dto);
    }

    update(id: string, dto: CreatePurchaseOrderDto): Observable<PurchaseOrder> {
        return this.http.put<PurchaseOrder>(`${this.apiUrl}/${id}`, dto);
    }

    approve(id: string): Observable<PurchaseOrder> {
        return this.http.post<PurchaseOrder>(`${this.apiUrl}/approve/${id}`, {});
    }

    close(id: string): Observable<void> {
        return this.http.post<void>(`${this.apiUrl}/close/${id}`, {});
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
                contactName: v.contactName || v.ContactName || '', // Handle missing fields defaulting to empty
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
            map((data: any[]) => data.map((i: any) => {
                const images = this.normalizeImages(i.images || i.Images) ?? [];
                const mainImage = images.length ? (images.find(img => img.isMain) || images[0]) : null;
                const serverMain = i.mainImageUrl || i.MainImageUrl || '';
                return {
                    id: (i.id || i.Id || '').toString().toLowerCase(),
                    name: i.name || i.Name,
                    sku: i.sku || i.SKU || i.Sku,
                    description: i.description || i.Description,
                    price: i.price || i.Price,
                    unitOfMeasureId: (i.unitOfMeasureId || i.UnitOfMeasureId || '').toString().toLowerCase(),
                    unitOfMeasure: i.unitOfMeasure || i.UnitOfMeasure,
                    images,
                    mainImageUrl: this.resolveImageUrl(serverMain || mainImage?.imageUrl)
                } as Item;
            }))
        );
    }

    private mapToCamelCase(po: any): PurchaseOrder {
        const id = po.id || po.Id || po.ID || '';
        const vendorId = po.vendorId || po.VendorId || po.VendorID || '';
        const warehouseId = po.warehouseId || po.WarehouseId || po.WarehouseID || '';

        return {
            id: id.toString().toLowerCase(),
            vendorId: vendorId.toString().toLowerCase(),
            warehouseId: warehouseId.toString().toLowerCase(),
            reference: po.reference || po.Reference || '',
            orderDate: po.orderDate || po.OrderDate || '',
            isApproved: po.isApproved !== undefined ? po.isApproved : (po.IsApproved !== undefined ? po.IsApproved : false),
            isClosed: po.isClosed !== undefined ? po.isClosed : (po.IsClosed !== undefined ? po.IsClosed : false),
            lines: (po.lines || po.Lines || []).map((l: any) => ({
                id: (l.id || l.Id || l.ID || '').toString().toLowerCase(),
                itemId: (l.itemId || l.ItemId || l.ItemID || l.itemID || '').toString().toLowerCase(),
                quantityOrdered: l.quantityOrdered || l.QuantityOrdered || 0,
                unitPrice: l.unitPrice || l.UnitPrice || 0,
                receivedQuantity: l.receivedQuantity || l.ReceivedQuantity || 0
            }))
        };
    }

    private normalizeImages(raw: any): Item['images'] {
        const collection = Array.isArray(raw) ? raw : (raw?.$values || []);
        return collection.map((img: any) => ({
            id: (img.id || img.Id || '').toString().toLowerCase(),
            itemId: (img.itemId || img.ItemId || '').toString().toLowerCase(),
            imageUrl: this.resolveImageUrl(img.imageUrl || img.ImageUrl || ''),
            isMain: Boolean(img.isMain ?? img.IsMain)
        }));
    }

    private resolveImageUrl(url?: string | null): string {
        const trimmed = (url || '').trim();
        if (!trimmed) return '';
        if (/^https?:\/\//i.test(trimmed)) return trimmed;
        if (trimmed.startsWith('/')) return trimmed;
        return '/' + trimmed.replace(/^\/+/, '');
    }
}
