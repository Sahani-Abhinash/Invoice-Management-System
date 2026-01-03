import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Vendor } from '../../companies/vendor/vendor.service';
import { Warehouse } from '../../warehouse/warehouse.service';
import { Item } from '../../product/items/item.service';

export enum PaymentMethod {
    Cash = 0,
    Card = 1,
    BankTransfer = 2,
    Cheque = 3,
    Mobile = 4,
    Paypal = 5,
    Other = 6
}

export interface GrnLine {
    id: string;
    itemId: string;
    quantity: number;
    unitPrice: number;
}

export interface Grn {
    id: string;
    purchaseOrderId: string;  // REQUIRED - linked to PO
    receivedDate: string;
    reference: string;
    isReceived: boolean;
    accountId?: string;
    lines: GrnLine[];
    paymentStatus?: string; // Unpaid, PartiallyPaid, FullyPaid
}

export interface CreateGrnLineDto {
    itemId: string;
    quantity: number;
    unitPrice: number;
}

export interface CreateGrnDto {
    purchaseOrderId: string;  // REQUIRED - linked to PO
    reference: string;
    accountId?: string;
    lines: CreateGrnLineDto[];
}

export interface Payment {
    id: string;
    amount: number;
    method: PaymentMethod;
    date: string;
    dueDate?: string;
}

export interface RecordPaymentDto {
    amount: number;
    method: PaymentMethod;
    dueDate?: string;
}

export interface GrnPaymentDetails {
    id: string;
    reference: string;
    total: number;
    paidAmount: number;
    balanceDue: number;
    paymentStatus: string;
    payments: Payment[];
}

@Injectable({
    providedIn: 'root'
})
export class GrnService {
    private apiUrl = 'https://localhost:7276/api/grn';
    private vendorUrl = 'https://localhost:7276/api/vendor';
    private warehouseUrl = 'https://localhost:7276/api/warehouse';
    private itemUrl = 'https://localhost:7276/api/item';
    private poUrl = 'https://localhost:7276/api/purchaseorder';

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

    recordPayment(id: string, payment: RecordPaymentDto): Observable<Payment> {
        return this.http.post<any>(`${this.apiUrl}/${id}/payment`, payment).pipe(
            map(p => this.mapPaymentToCamelCase(p))
        );
    }

    getPaymentDetails(id: string): Observable<GrnPaymentDetails> {
        return this.http.get<any>(`${this.apiUrl}/${id}/payment-details`).pipe(
            map(details => this.mapPaymentDetailsToCamelCase(details))
        );
    }

    getPaymentMethodName(method: PaymentMethod): string {
        switch (method) {
            case PaymentMethod.Cash: return 'Cash';
            case PaymentMethod.Card: return 'Credit/Debit Card';
            case PaymentMethod.BankTransfer: return 'Bank Transfer';
            case PaymentMethod.Cheque: return 'Cheque';
            case PaymentMethod.Mobile: return 'Mobile Payment';
            case PaymentMethod.Paypal: return 'PayPal';
            case PaymentMethod.Other: return 'Other';
            default: return 'Unknown';
        }
    }

    private mapPaymentToCamelCase(data: any): Payment {
        return {
            id: data.id || data.Id || data.ID || '',
            amount: data.amount || data.Amount || 0,
            method: data.method || data.Method || PaymentMethod.Cash,
            date: data.date || data.Date || new Date().toISOString()
        };
    }

    private mapPaymentDetailsToCamelCase(data: any): GrnPaymentDetails {
        return {
            id: data.id || data.Id || data.ID || '',
            reference: data.reference || data.Reference || '',
            total: data.total || data.Total || 0,
            paidAmount: data.paidAmount || data.PaidAmount || 0,
            balanceDue: data.balanceDue || data.BalanceDue || 0,
            paymentStatus: data.paymentStatus || data.PaymentStatus || 'Unpaid',
            payments: (data.payments || data.Payments || []).map((p: any) => this.mapPaymentToCamelCase(p))
        };
    }

    // Helpers
    getPurchaseOrder(id: string): Observable<{ id: string; reference: string; vendorId: string; warehouseId: string }> {
        return this.http.get<any>(`${this.poUrl}/${id}`).pipe(
            map((po: any) => ({
                id: (po.id || po.Id || po.ID || '').toString().toLowerCase(),
                reference: po.reference || po.Reference || '',
                vendorId: (po.vendorId || po.VendorId || po.VendorID || '').toString().toLowerCase(),
                warehouseId: (po.warehouseId || po.WarehouseId || po.WarehouseID || '').toString().toLowerCase()
            }))
        );
    }

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
        const poId = grn.purchaseOrderId || grn.PurchaseOrderId || grn.PurchaseOrderID || '';

        return {
            id: id.toString().toLowerCase(),
            purchaseOrderId: poId.toString().toLowerCase(),
            reference: grn.reference || grn.Reference || '',
            receivedDate: grn.receivedDate || grn.ReceivedDate || '',
            isReceived: grn.isReceived !== undefined ? grn.isReceived : (grn.IsReceived !== undefined ? grn.IsReceived : false),
            paymentStatus: grn.paymentStatus || grn.PaymentStatus || 'Unpaid',
            lines: (grn.lines || grn.Lines || []).map((l: any) => ({
                id: (l.id || l.Id || l.ID || '').toString().toLowerCase(),
                itemId: (l.itemId || l.ItemId || l.ItemID || l.itemID || '').toString().toLowerCase(),
                quantity: l.quantity || l.Quantity || 0,
                unitPrice: l.unitPrice || l.UnitPrice || 0
            }))
        };
    }
}
