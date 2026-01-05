import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { GrnService, Grn } from '../grn.service';
import { Vendor } from '../../../companies/vendor/vendor.service';
import { Warehouse } from '../../../warehouse/warehouse.service';
import { Item } from '../../../product/items/item.service';
import { CompanyService, Company } from '../../../companies/company/company.service';
import { Address, AddressService } from '../../../Master/geography/address/address.service';
import { forkJoin } from 'rxjs';

export interface PurchaseOrder {
    id: string;
    reference: string;
    vendorId: string;
    warehouseId: string;
}

@Component({
    selector: 'app-grn-view',
    standalone: true,
    imports: [CommonModule, RouterLink],
    templateUrl: './grn-view.component.html',
    styleUrls: ['./grn-view.component.css']
})
export class GrnViewComponent implements OnInit {
    grn: Grn | null = null;
    isLoading = true;
    error: string | null = null;
    purchaseOrder: PurchaseOrder | null = null;
    vendor: Vendor | null = null;
    warehouse: Warehouse | null = null;
    itemsMap: Map<string, Item> = new Map();
    totalAmount: number = 0;
    isLoadingDetails = false;
    company: Company | null = null;
    companyAddress: Address | null = null;
    companyLogoUrl: string | null = null;

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private grnService: GrnService,
        private cdr: ChangeDetectorRef,
        private companyService: CompanyService,
        private addressService: AddressService
    ) { }

    ngOnInit(): void {
        const id = this.route.snapshot.paramMap.get('id');
        if (id) {
            this.loadData(id);
        } else {
            this.error = 'No GRN ID provided';
            this.isLoading = false;
        }
    }

    loadData(id: string) {
        this.isLoading = true;
        this.grnService.getById(id).subscribe({
            next: (grn) => {
                this.grn = grn;
                this.isLoading = false;
                this.cdr.detectChanges();

                this.isLoadingDetails = true;
                forkJoin({
                    po: this.grnService.getPurchaseOrder(grn.purchaseOrderId),
                    vendors: this.grnService.getVendors(),
                    warehouses: this.grnService.getWarehouses(),
                    items: this.grnService.getItems(),
                    companies: this.companyService.getAll()
                }).subscribe({
                    next: (data) => {
                        this.purchaseOrder = data.po;
                        this.vendor = data.vendors.find(v => (v.id || '').toLowerCase() === (data.po.vendorId || '').toLowerCase()) || null;
                        this.warehouse = data.warehouses.find(w => (w.id || '').toLowerCase() === (data.po.warehouseId || '').toLowerCase()) || null;

                        this.itemsMap = new Map();
                        data.items.forEach(i => {
                            if (i.id) this.itemsMap.set(i.id.toLowerCase(), i);
                        });

                        this.setCompany(data.companies);

                        this.calculateTotal();
                        this.isLoadingDetails = false;
                        this.cdr.detectChanges();
                    },
                    error: (err) => {
                        console.error('[GRN View] Error loading dependencies:', err);
                        this.isLoadingDetails = false;
                        this.cdr.detectChanges();
                    }
                });
            },
            error: (err) => {
                console.error('[GRN View] Error loading GRN:', err);
                this.error = 'Failed to load Goods Receipt Note.';
                this.isLoading = false;
                this.cdr.detectChanges();
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
        if (!this.grn) return;
        this.totalAmount = this.grn.lines.reduce((acc, line) => acc + ((line.quantity || 0) * (line.unitPrice || 0)), 0);
    }

    print() {
        window.print();
    }

    back() {
        this.router.navigate(['/grns']);
    }

    edit() {
        if (this.grn) {
            this.router.navigate(['/grns/edit', this.grn.id]);
        }
    }

    receive() {
        if (!this.grn) return;
        if (confirm('Are you sure you want to mark this GRN as received? This will update the stock levels.')) {
            this.grnService.receive(this.grn.id).subscribe({
                next: () => {
                    alert('GRN received successfully!');
                    this.loadData(this.grn!.id);
                },
                error: (err) => {
                    console.error('Error receiving GRN:', err);
                    alert('Failed to receive GRN');
                }
            });
        }
    }

    receiveAndPay() {
        if (!this.grn) return;
        if (confirm('Mark this GRN as received and proceed to payment?')) {
            this.grnService.receive(this.grn.id).subscribe({
                next: () => {
                    // Navigate to payment page after successful receive
                    this.router.navigate(['/grns', this.grn!.id, 'payment']);
                },
                error: (err) => {
                    console.error('Error receiving GRN:', err);
                    alert('Failed to receive GRN');
                }
            });
        }
    }
}
