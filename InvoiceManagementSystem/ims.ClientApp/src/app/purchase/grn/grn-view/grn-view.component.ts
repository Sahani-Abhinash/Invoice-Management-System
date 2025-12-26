import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { GrnService, Grn } from '../grn.service';
import { Vendor } from '../../../companies/vendor/vendor.service';
import { Warehouse } from '../../../warehouse/warehouse.service';
import { Item } from '../../../product/items/item.service';
import { forkJoin } from 'rxjs';

@Component({
    selector: 'app-grn-view',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './grn-view.component.html',
    styleUrls: ['./grn-view.component.css']
})
export class GrnViewComponent implements OnInit {
    grn: Grn | null = null;
    isLoading = true;
    error: string | null = null;
    vendor: Vendor | null = null;
    warehouse: Warehouse | null = null;
    itemsMap: Map<string, Item> = new Map();
    totalAmount: number = 0;
    isLoadingDetails = false;

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private grnService: GrnService,
        private cdr: ChangeDetectorRef
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
                    vendors: this.grnService.getVendors(),
                    warehouses: this.grnService.getWarehouses(),
                    items: this.grnService.getItems()
                }).subscribe({
                    next: (data) => {
                        this.vendor = data.vendors.find(v => (v.id || '').toLowerCase() === (grn.vendorId || '').toLowerCase()) || null;
                        this.warehouse = data.warehouses.find(w => (w.id || '').toLowerCase() === (grn.warehouseId || '').toLowerCase()) || null;

                        this.itemsMap = new Map();
                        data.items.forEach(i => {
                            if (i.id) this.itemsMap.set(i.id.toLowerCase(), i);
                        });

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
}
