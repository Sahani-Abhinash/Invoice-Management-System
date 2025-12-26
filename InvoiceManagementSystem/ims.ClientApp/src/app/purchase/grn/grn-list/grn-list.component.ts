import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { GrnService, Grn } from '../grn.service';
import { Vendor } from '../../../companies/vendor/vendor.service';
import { Warehouse } from '../../../warehouse/warehouse.service';
import { forkJoin } from 'rxjs';

@Component({
    selector: 'app-grn-list',
    standalone: true,
    imports: [CommonModule, RouterModule],
    templateUrl: './grn-list.component.html',
    styleUrls: ['./grn-list.component.css']
})
export class GrnListComponent implements OnInit {
    grns: Grn[] = [];
    vendorsMap: Map<string, string> = new Map();
    warehousesMap: Map<string, string> = new Map();
    isLoading = true;
    error: string | null = null;

    constructor(
        private grnService: GrnService,
        private router: Router,
        private cdr: ChangeDetectorRef
    ) { }

    ngOnInit(): void {
        this.loadGrns();
    }

    loadGrns(): void {
        this.isLoading = true;

        forkJoin({
            grns: this.grnService.getAll(),
            vendors: this.grnService.getVendors(),
            warehouses: this.grnService.getWarehouses()
        }).subscribe({
            next: (data) => {
                this.grns = data.grns;

                // Populate maps for quick lookup
                this.vendorsMap.clear();
                data.vendors.forEach(v => {
                    if (v.id) this.vendorsMap.set(v.id.toLowerCase(), v.name || '');
                });

                this.warehousesMap.clear();
                data.warehouses.forEach(w => {
                    if (w.id) this.warehousesMap.set(w.id.toLowerCase(), w.name || '');
                });

                this.isLoading = false;
                this.cdr.detectChanges();
            },
            error: (err) => {
                console.error('Error loading GRNs or dependencies:', err);
                this.error = 'Failed to load GRNs';
                this.isLoading = false;
                this.cdr.detectChanges();
            }
        });
    }

    getVendorName(id: string): string {
        if (!id) return 'Unknown';
        return this.vendorsMap.get(id.toLowerCase()) || id;
    }

    getWarehouseName(id: string): string {
        if (!id) return 'Unknown';
        return this.warehousesMap.get(id.toLowerCase()) || id;
    }

    viewGrn(id: string): void {
        this.router.navigate(['/grns/view', id]);
    }

    editGrn(id: string, event: Event): void {
        event.stopPropagation();
        this.router.navigate(['/grns/edit', id]);
    }

    createGrn(): void {
        this.router.navigate(['/grns/create']);
    }

    receiveGrn(id: string, event: Event): void {
        event.stopPropagation();
        if (confirm('Are you sure you want to mark this GRN as received? This will update the stock levels.')) {
            this.grnService.receive(id).subscribe({
                next: () => {
                    alert('GRN received successfully!');
                    this.loadGrns();
                },
                error: (err) => {
                    console.error('Error receiving GRN:', err);
                    alert('Failed to receive GRN');
                }
            });
        }
    }
}
