import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin } from 'rxjs';
import { map } from 'rxjs/operators';

export interface DashboardMetrics {
  // Invoice Metrics
  totalInvoices: number;
  paidInvoices: number;
  unpaidInvoices: number;
  overdueInvoices: number;
  totalRevenue: number;
  paidRevenue: number;
  outstandingRevenue: number;
  
  // Customer Metrics
  totalCustomers: number;
  activeCustomers: number;
  
  // Product Metrics
  totalProducts: number;
  lowStockProducts: number;
  
  // Recent Invoices
  recentInvoices: RecentInvoice[];
  
  // Monthly Stats
  monthlyRevenue: number;
  monthlyInvoices: number;
}

export interface RecentInvoice {
  id: string;
  invoiceNumber: string;
  customerName: string;
  invoiceDate: string;
  dueDate: string;
  totalAmount: number;
  status: string;
}

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private invoiceApiUrl = '/api/Invoice';
  private customerApiUrl = '/api/Customer';
  private productApiUrl = '/api/Item';

  constructor(private http: HttpClient) {}

  getDashboardMetrics(): Observable<DashboardMetrics> {
    return forkJoin({
      invoices: this.http.get<any[]>(`${this.invoiceApiUrl}`),
      customers: this.http.get<any[]>(`${this.customerApiUrl}`),
      products: this.http.get<any[]>(`${this.productApiUrl}`)
    }).pipe(
      map(({ invoices, customers, products }) => {
        const now = new Date();
        const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        
        // Invoice calculations
        const paidInvoices = invoices.filter(i => i.status?.toLowerCase() === 'paid');
        const unpaidInvoices = invoices.filter(i => i.status?.toLowerCase() === 'unpaid' || i.status?.toLowerCase() === 'pending');
        const overdueInvoices = unpaidInvoices.filter(i => {
          const dueDate = new Date(i.dueDate);
          return dueDate < now;
        });
        
        const totalRevenue = invoices.reduce((sum, i) => sum + (i.totalAmount || 0), 0);
        const paidRevenue = paidInvoices.reduce((sum, i) => sum + (i.totalAmount || 0), 0);
        const outstandingRevenue = totalRevenue - paidRevenue;
        
        // Monthly stats
        const monthlyInvoicesData = invoices.filter(i => {
          const invoiceDate = new Date(i.invoiceDate);
          return invoiceDate >= firstDayOfMonth;
        });
        const monthlyRevenue = monthlyInvoicesData.reduce((sum, i) => sum + (i.totalAmount || 0), 0);
        
        // Recent invoices (last 5)
        const recentInvoices = invoices
          .sort((a, b) => new Date(b.invoiceDate).getTime() - new Date(a.invoiceDate).getTime())
          .slice(0, 5)
          .map(i => ({
            id: i.id,
            invoiceNumber: i.invoiceNumber,
            customerName: i.customerName || 'Unknown',
            invoiceDate: i.invoiceDate,
            dueDate: i.dueDate,
            totalAmount: i.totalAmount,
            status: i.status
          }));
        
        // Customer calculations
        const activeCustomers = customers.filter(c => c.isActive !== false).length;
        
        // Product calculations
        const lowStockProducts = products.filter(p => (p.stockQuantity || 0) < (p.reorderLevel || 10)).length;
        
        return {
          totalInvoices: invoices.length,
          paidInvoices: paidInvoices.length,
          unpaidInvoices: unpaidInvoices.length,
          overdueInvoices: overdueInvoices.length,
          totalRevenue,
          paidRevenue,
          outstandingRevenue,
          totalCustomers: customers.length,
          activeCustomers,
          totalProducts: products.length,
          lowStockProducts,
          recentInvoices,
          monthlyRevenue,
          monthlyInvoices: monthlyInvoicesData.length
        };
      })
    );
  }
}
