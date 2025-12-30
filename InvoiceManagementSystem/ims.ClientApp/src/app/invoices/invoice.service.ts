import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';

export enum PaymentMethod {
    Other = 0,
    Cash = 1,
    Card = 2,
    BankTransfer = 3,
    Cheque = 4,
    Mobile = 5,
    Paypal = 6
}

export interface InvoiceItem {
    id: string;
    itemId: string;
    quantity: number;
    unitPrice: number;
    lineTotal: number;
}

export interface Payment {
    id: string;
    invoiceId: string;
    amount: number;
    paidAt: string;
    method: PaymentMethod;
}

export interface Invoice {
    id: string;
    reference: string;
    poNumber?: string;
    invoiceDate: string;
    dueDate?: string;
    customerId?: string;
    branchId?: string;
    subTotal: number;
    tax: number;
    total: number;
    paidAmount: number;
    balanceDue: number;
    isPaid: boolean;
    paymentStatus: string;
    lines: InvoiceItem[];
    payments: Payment[];
}

export interface CreateInvoiceDto {
    reference: string;
    poNumber?: string;
    invoiceDate: string;
    dueDate?: string;
    customerId?: string;
    branchId?: string;
    taxRate: number;
    lines: {
        itemId: string;
        quantity: number;
        unitPrice: number;
    }[];
}

export interface RecordPaymentDto {
    amount: number;
    method: PaymentMethod;
}

export interface InvoicePaymentDetails {
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
export class InvoiceService {
    private apiUrl = '/api/invoice';

    constructor(private http: HttpClient) { }

    getAll(): Observable<Invoice[]> {
        return this.http.get<any[]>(this.apiUrl).pipe(
            map(data => data.map(i => this.mapToCamelCase(i)))
        );
    }

    getById(id: string): Observable<Invoice> {
        return this.http.get<any>(`${this.apiUrl}/${id}`).pipe(
            map(i => this.mapToCamelCase(i))
        );
    }

    create(dto: CreateInvoiceDto): Observable<Invoice> {
        return this.http.post<any>(this.apiUrl, dto).pipe(
            map(i => this.mapToCamelCase(i))
        );
    }

    update(id: string, dto: CreateInvoiceDto): Observable<Invoice> {
        return this.http.put<any>(`${this.apiUrl}/${id}`, dto).pipe(
            map(i => this.mapToCamelCase(i))
        );
    }

    delete(id: string): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }

    markAsPaid(id: string): Observable<void> {
        return this.http.post<void>(`${this.apiUrl}/pay/${id}`, {});
    }

    recordPayment(id: string, payment: RecordPaymentDto): Observable<Payment> {
        return this.http.post<any>(`${this.apiUrl}/${id}/payment`, payment).pipe(
            map(p => this.mapPaymentToCamelCase(p))
        );
    }

    getPaymentDetails(id: string): Observable<InvoicePaymentDetails> {
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
            case PaymentMethod.Other:
            default: return 'Other';
        }
    }

    private mapToCamelCase(data: any): Invoice {
        return {
            id: (data.id || data.Id || '').toString().toLowerCase(),
            reference: data.reference || data.Reference || '',
            poNumber: data.poNumber || data.PoNumber || '',
            invoiceDate: data.invoiceDate || data.InvoiceDate || '',
            dueDate: data.dueDate || data.DueDate,
            customerId: (data.customerId || data.CustomerId || '').toString().toLowerCase(),
            branchId: (data.branchId || data.BranchId || '').toString().toLowerCase(),
            subTotal: data.subTotal || data.SubTotal || 0,
            tax: data.tax || data.Tax || 0,
            total: data.total || data.Total || 0,
            paidAmount: data.paidAmount || data.PaidAmount || 0,
            balanceDue: (data.balanceDue || data.BalanceDue || 0),
            isPaid: data.isPaid !== undefined ? data.isPaid : (data.IsPaid !== undefined ? data.IsPaid : false),
            paymentStatus: data.paymentStatus || data.PaymentStatus || 'Unpaid',
            lines: (data.lines || data.Lines || []).map((l: any) => ({
                id: (l.id || l.Id || '').toString().toLowerCase(),
                itemId: (l.itemId || l.ItemId || '').toString().toLowerCase(),
                quantity: l.quantity || l.Quantity || 0,
                unitPrice: l.unitPrice || l.UnitPrice || 0,
                lineTotal: l.lineTotal || l.LineTotal || 0
            })),
            payments: (data.payments || data.Payments || []).map((p: any) => this.mapPaymentToCamelCase(p))
        };
    }

    private mapPaymentToCamelCase(data: any): Payment {
        return {
            id: (data.id || data.Id || '').toString().toLowerCase(),
            invoiceId: (data.invoiceId || data.InvoiceId || '').toString().toLowerCase(),
            amount: data.amount || data.Amount || 0,
            paidAt: data.paidAt || data.PaidAt || '',
            method: data.method !== undefined ? data.method : (data.Method !== undefined ? data.Method : PaymentMethod.Other)
        };
    }

    private mapPaymentDetailsToCamelCase(data: any): InvoicePaymentDetails {
        return {
            id: (data.id || data.Id || '').toString().toLowerCase(),
            reference: data.reference || data.Reference || '',
            total: data.total || data.Total || 0,
            paidAmount: data.paidAmount || data.PaidAmount || 0,
            balanceDue: data.balanceDue || data.BalanceDue || 0,
            paymentStatus: data.paymentStatus || data.PaymentStatus || 'Unpaid',
            payments: (data.payments || data.Payments || []).map((p: any) => this.mapPaymentToCamelCase(p))
        };
    }
}
