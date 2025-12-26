import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { PurchaseOrderService, PurchaseOrder } from '../purchase-order.service';
import { Vendor } from '../../../companies/vendor/vendor.service';
import { Warehouse } from '../../../warehouse/warehouse.service';
import { Observable, forkJoin, map } from 'rxjs';

@Component({
    selector: 'app-purchase-order-list',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './purchase-order-list.component.html',
    styleUrls: []
})
export class PurchaseOrderListComponent implements OnInit {
    purchaseOrders$!: Observable<any[]>;

    constructor(
        private poService: PurchaseOrderService,
        private router: Router
    ) { }

    ngOnInit(): void {
        this.loadData();
    }

    loadData() {
        this.purchaseOrders$ = forkJoin({
            pos: this.poService.getAll(),
            vendors: this.poService.getVendors(),
            warehouses: this.poService.getWarehouses()
        }).pipe(
            map(data => {
                // Create lookup maps
                const vendorMap = new Map(data.vendors.map(v => [v.id || (v as any).Id, v.name || (v as any).Name]));
                const warehouseMap = new Map(data.warehouses.map(w => [w.id || (w as any).Id, w.name || (w as any).Name]));

                // Map POs with names (Checking for PascalCase just in case)
                return data.pos.map((po: any) => {
                    const vendorId = po.vendorId || po.VendorId;
                    const warehouseId = po.warehouseId || po.WarehouseId;
                    return {
                        ...po,
                        reference: po.reference || po.Reference,
                        orderDate: po.orderDate || po.OrderDate,
                        isApproved: po.isApproved !== undefined ? po.isApproved : po.IsApproved,
                        isClosed: po.isClosed !== undefined ? po.isClosed : po.IsClosed,
                        id: po.id || po.Id,
                        vendorName: vendorMap.get(vendorId) || 'Unknown',
                        warehouseName: warehouseMap.get(warehouseId) || 'Unknown'
                    };
                });
            })
        );
    }

    createPO() {
        this.router.navigate(['/purchase-orders/create']);
    }

    viewPODetail(id: string) {
        this.router.navigate(['/purchase-orders/view', id]);
    }

    viewPO(id: string) {
        this.router.navigate(['/purchase-orders/edit', id]);
    }

    approvePO(id: string) {
        if (confirm('Approve this Purchase Order?')) {
            this.poService.approve(id).subscribe(() => this.loadData());
        }
    }

    closePO(id: string) {
        if (confirm('Close this Purchase Order?')) {
            this.poService.close(id).subscribe(() => this.loadData());
        }
    }
}
