import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { PurchaseOrderService, PurchaseOrder } from '../purchase-order.service';
import { Vendor } from '../../../companies/vendor/vendor.service';
import { Warehouse } from '../../../warehouse/warehouse.service';
import { Item } from '../../../product/items/item.service';
import { CompanyService, Company } from '../../../companies/company/company.service';
import { Address, AddressService } from '../../../Master/geography/address/address.service';
import { forkJoin } from 'rxjs';

@Component({
    selector: 'app-purchase-order-view',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './purchase-order-view.component.html',
    styleUrls: ['./purchase-order-view.component.css']
})
export class PurchaseOrderViewComponent implements OnInit {
    po: PurchaseOrder | null = null;
    isLoading = true;
    error: string | null = null;
    vendor: Vendor | null = null;
    warehouse: Warehouse | null = null;
    itemsMap: Map<string, Item> = new Map();
    totalAmount: number = 0;
    company: Company | null = null;
    companyAddress: Address | null = null;
    companyLogoUrl: string | null = null;

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private poService: PurchaseOrderService,
        private cdr: ChangeDetectorRef,
        private companyService: CompanyService,
        private addressService: AddressService
    ) { }

    ngOnInit(): void {
        console.log('[PO View] ngOnInit called');
        const id = this.route.snapshot.paramMap.get('id');
        console.log('[PO View] Route ID:', id);
        if (id) {
            console.log('[PO View] Loading data for ID:', id);
            this.loadData(id);
        } else {
            console.error('[PO View] No PO ID provided in route');
            this.error = 'No PO ID provided';
            this.isLoading = false;
        }
    }

    isLoadingDetails = false;

    loadData(id: string) {
        console.log('[PO View] loadData started, isLoading = true');
        this.isLoading = true;
        console.log('[PO View] Calling API: getById(' + id + ')');

        this.poService.getById(id).subscribe({
            next: (po) => {
                console.log('[PO View] API Success - PO data received:', po);
                this.po = po;
                console.log('[PO View] Setting isLoading = false');
                this.isLoading = false; // Show PO immediately
                this.cdr.detectChanges(); // Manually trigger change detection
                console.log('[PO View] Current state - isLoading:', this.isLoading, 'po:', this.po);
                this.isLoadingDetails = true;

                console.log('[PO View] Loading vendor/warehouse/items data...');
                forkJoin({
                    vendors: this.poService.getVendors(),
                    warehouses: this.poService.getWarehouses(),
                    items: this.poService.getItems(),
                    companies: this.companyService.getAll()
                }).subscribe({
                    next: (data) => {
                        console.log('[PO View] Dependencies loaded:', {
                            vendorsCount: data.vendors.length,
                            warehousesCount: data.warehouses.length,
                            itemsCount: data.items.length
                        });

                        this.vendor = data.vendors.find(v => (v.id || '').toLowerCase() === (po.vendorId || '').toLowerCase()) || null;
                        this.warehouse = data.warehouses.find(w => (w.id || '').toLowerCase() === (po.warehouseId || '').toLowerCase()) || null;

                        console.log('[PO View] Matched vendor:', this.vendor);
                        console.log('[PO View] Matched warehouse:', this.warehouse);

                        this.itemsMap = new Map();
                        data.items.forEach(i => {
                            if (i.id) this.itemsMap.set(i.id.toLowerCase(), i);
                        });

                        this.setCompany(data.companies);

                        console.log('[PO View] Items map size:', this.itemsMap.size);
                        this.calculateTotal();
                        console.log('[PO View] Total calculated:', this.totalAmount);
                        this.isLoadingDetails = false;
                        this.cdr.detectChanges(); // Manually trigger change detection after all data is loaded
                        console.log('[PO View] All loading complete - isLoading:', this.isLoading, 'isLoadingDetails:', this.isLoadingDetails);
                    },
                    error: (err) => {
                        console.error('[PO View] Error loading dependencies:', err);
                        // We don't block the view, just maybe show a warning or keep defaults
                        this.isLoadingDetails = false;
                    }
                });
            },
            error: (err) => {
                console.error('[PO View] Error loading PO:', err);
                this.error = 'Failed to load Purchase Order. Please check the ID or try again.';
                this.isLoading = false;
                this.cdr.detectChanges(); // Manually trigger change detection
                console.log('[PO View] Error state - isLoading:', this.isLoading, 'error:', this.error);
            }
        });
    }

    getItem(itemId: string): Item | undefined {
        if (!itemId) return undefined;
        return this.itemsMap.get(itemId.toLowerCase());
    }

    private setCompany(companies: Company[]) {
        if (!companies || companies.length === 0) return;
        this.company = companies[0];
        this.companyLogoUrl = this.resolveLogoUrl(this.company.logoUrl);
        this.addressService.getForOwner('Company', this.company.id).subscribe({
            next: (addresses) => {
                this.companyAddress = addresses?.[0] || null;
                this.cdr.detectChanges();
            },
            error: () => {
                this.companyAddress = null;
            }
        });
    }

    private resolveLogoUrl(url?: string | null): string | null {
        if (!url) return null;
        const trimmed = url.trim();
        if (!trimmed) return null;
        if (/^https?:\/\//i.test(trimmed)) return trimmed;
        if (trimmed.startsWith('/')) return trimmed;
        return '/' + trimmed.replace(/^\/+/, '');
    }

    getItemImage(itemId: string): string | null {
        const item = this.getItem(itemId);
        if (!item) return null;
        const images = item.images || [];
        const mainImage = images.find(i => i.isMain) || images[0];
        const url = (mainImage?.imageUrl || item.mainImageUrl || '').trim();
        return url || null;
    }

    calculateTotal() {
        if (!this.po) return;
        this.totalAmount = this.po.lines.reduce((acc, line) => acc + ((line.quantityOrdered || 0) * (line.unitPrice || 0)), 0);
    }

    print() {
        window.print();
    }

    back() {
        this.router.navigate(['/purchase-orders']);
    }

    receiveGoods() {
        if (!this.po) return;
        this.router.navigate(['/grns/create'], { queryParams: { poId: this.po.id } });
    }
}
