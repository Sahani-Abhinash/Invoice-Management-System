import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { DashboardService, DashboardMetrics } from './dashboard.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  metrics: DashboardMetrics | null = null;
  isLoading = true;
  errorMessage = '';
  quickLinks = [
    { title: 'Company', description: 'View company profile and logo', route: '/companies', icon: 'ri-building-4-line', tone: 'primary' },
    { title: 'Branches', description: 'Manage branches', route: '/branches', icon: 'ri-git-branch-line', tone: 'info' },
    { title: 'Customers', description: 'Customers and contacts', route: '/customers', icon: 'ri-user-3-line', tone: 'success' },
    { title: 'Vendors', description: 'Suppliers and vendors', route: '/vendors', icon: 'ri-store-2-line', tone: 'secondary' },
    { title: 'Warehouses', description: 'Locations and stock', route: '/warehouses', icon: 'ri-warehouse-line', tone: 'warning' },
    { title: 'Geography', description: 'Countries, states, cities', route: '/geography', icon: 'ri-map-pin-line', tone: 'primary' },
    { title: 'Products', description: 'Catalog and pricing', route: '/products', icon: 'ri-price-tag-3-line', tone: 'info' },
    { title: 'Purchase Orders', description: 'POs and receipts', route: '/purchase-orders', icon: 'ri-shopping-cart-2-line', tone: 'success' },
    { title: 'Goods Receipt (GRN)', description: 'Receive against POs', route: '/grns', icon: 'ri-file-list-3-line', tone: 'secondary' },
    { title: 'Invoices', description: 'Sales invoices and payments', route: '/invoices', icon: 'ri-bill-line', tone: 'warning' },
    { title: 'Accounting', description: 'Categories and transactions', route: '/accounting', icon: 'ri-wallet-3-line', tone: 'primary' },
    { title: 'Security', description: 'Users, roles, permissions', route: '/users', icon: 'ri-shield-keyhole-line', tone: 'danger' }
  ];
  reportLinks: Array<{
    title: string;
    description: string;
    route: string;
    icon: string;
    tone: string;
    reportType: string;
    metricKey?: keyof DashboardMetrics;
    format?: 'currency' | 'count';
  }> = [
    { title: 'Sales & Invoices', description: 'Open invoices, receipts, and collections', route: '/invoices', icon: 'ri-bill-line', tone: 'primary', reportType: 'Sales', metricKey: 'totalInvoices', format: 'count' },
    { title: 'Revenue & Collections', description: 'Collected vs outstanding balances', route: '/accounting', icon: 'ri-wallet-3-line', tone: 'success', reportType: 'Finance', metricKey: 'outstandingRevenue', format: 'currency' },
    { title: 'Purchases & GRNs', description: 'Purchase orders, receipts, and costs', route: '/purchase-orders', icon: 'ri-shopping-cart-2-line', tone: 'warning', reportType: 'Procurement' },
    { title: 'Customers & Aging', description: 'Customer list and receivables status', route: '/customers', icon: 'ri-user-3-line', tone: 'info', reportType: 'Receivables', metricKey: 'totalCustomers', format: 'count' },
    { title: 'Products & Inventory', description: 'Catalog, stock levels, low stock alerts', route: '/products', icon: 'ri-price-tag-3-line', tone: 'secondary', reportType: 'Inventory', metricKey: 'totalProducts', format: 'count' },
    { title: 'Vendors & Payables', description: 'Vendors, bills, and payment status', route: '/vendors', icon: 'ri-store-2-line', tone: 'danger', reportType: 'Payables' }
  ];

  constructor(private dashboardService: DashboardService) {}

  ngOnInit(): void {
    this.loadDashboardMetrics();
  }

  loadDashboardMetrics(): void {
    this.isLoading = true;
    this.dashboardService.getDashboardMetrics().subscribe({
      next: (data: DashboardMetrics) => {
        this.metrics = data;
        this.isLoading = false;
      },
      error: (err: any) => {
        console.error('Error loading dashboard metrics:', err);
        this.errorMessage = 'Failed to load dashboard data';
        this.isLoading = false;
      }
    });
  }

  refresh(): void {
    this.loadDashboardMetrics();
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount || 0);
  }

  getMetricValue(link: { metricKey?: keyof DashboardMetrics; format?: 'currency' | 'count' }): string {
    if (!link.metricKey || !this.metrics) return '—';
    const value = (this.metrics as any)[link.metricKey] ?? 0;
    return link.format === 'currency' ? this.formatCurrency(value) : value.toString();
  }

  formatDate(date: string): string {
    if (!date) return '';
    return new Date(date).toLocaleDateString();
  }

  getStatusBadgeClass(status: string): string {
    const lowerStatus = status?.toLowerCase() || '';
    if (lowerStatus === 'paid') return 'bg-success-subtle text-success';
    if (lowerStatus === 'unpaid' || lowerStatus === 'pending') return 'bg-warning-subtle text-warning';
    if (lowerStatus === 'overdue') return 'bg-danger-subtle text-danger';
    if (lowerStatus === 'cancelled') return 'bg-secondary-subtle text-secondary';
    return 'bg-info-subtle text-info';
  }

  getPercentage(part: number, total: number): number {
    if (total === 0) return 0;
    return Math.round((part / total) * 100);
  }
}
