import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { GrnService, CreateGrnDto } from '../grn.service';
import { PurchaseOrderService } from '../../purchase-order/purchase-order.service';
import { Vendor } from '../../../companies/vendor/vendor.service';
import { Warehouse } from '../../../warehouse/warehouse.service';
import { Item } from '../../../product/items/item.service';
import { forkJoin } from 'rxjs';

@Component({
    selector: 'app-grn-form',
    standalone: true,
    imports: [CommonModule, FormsModule, ReactiveFormsModule],
    templateUrl: './grn-form.component.html',
    styleUrls: ['./grn-form.component.css']
})
export class GrnFormComponent implements OnInit {
    grnForm: FormGroup;
    vendors: Vendor[] = [];
    warehouses: Warehouse[] = [];
    items: Item[] = [];
    purchaseOrders: any[] = [];
    isLoading = true;
    isSaving = false;
    isEdit = false;
    grnId: string | null = null;
    today = new Date();
    currentPo: any = null;

    constructor(
        private fb: FormBuilder,
        private grnService: GrnService,
        private poService: PurchaseOrderService,
        private router: Router,
        private route: ActivatedRoute,
        private cdr: ChangeDetectorRef
    ) {
        this.grnForm = this.fb.group({
            vendorId: [''], // Auto-filled from PO
            warehouseId: [''], // Auto-filled from PO
            purchaseOrderId: ['', Validators.required], // PO is REQUIRED
            reference: ['', Validators.required],
            lines: this.fb.array([], Validators.required)
        });
    }

    ngOnInit(): void {
        this.grnId = this.route.snapshot.paramMap.get('id');
        this.isEdit = !!this.grnId;
        this.loadInitialData();
    }

    loadInitialData(): void {
        const requests: any = {
            vendors: this.grnService.getVendors(),
            warehouses: this.grnService.getWarehouses(),
            items: this.grnService.getItems(),
            pos: this.poService.getAll()
        };

        if (this.isEdit && this.grnId) {
            requests.grn = this.grnService.getById(this.grnId);
        }

        forkJoin(requests).subscribe({
            next: (data: any) => {
                this.vendors = data.vendors;
                this.warehouses = data.warehouses;
                this.items = data.items;
                // Filter to show only approved purchase orders
                this.purchaseOrders = (data.pos || []).filter((po: any) => po.isApproved === true);

                // Detailed logging for debugging
                console.log('=== GRN FORM DATA LOADED ===');
                console.log('All POs returned from backend:', data.pos);
                console.log('Approved POs (filtered):', this.purchaseOrders);
                console.log('Vendors:', this.vendors);
                console.log('Warehouses:', this.warehouses);
                console.log('Items:', this.items);
                console.log('Summary:', {
                    totalPos: (data.pos || []).length,
                    approvedPosCount: this.purchaseOrders.length,
                    vendorsCount: this.vendors.length,
                    warehousesCount: this.warehouses.length,
                    itemsCount: this.items.length
                });

                if (this.isEdit && data.grn) {
                    if (data.grn.isReceived) {
                        alert('This GRN is already received and cannot be edited.');
                        this.router.navigate(['/grns/view', this.grnId]);
                        return;
                    }

                    // Lowercase poId for matching
                    const poId = (data.grn.purchaseOrderId || '').toString().toLowerCase();
                    if (poId && poId !== 'null' && poId !== 'undefined') {
                        // Fetch full PO details to get line-item metadata
                        this.poService.getById(poId).subscribe({
                            next: (po) => {
                                this.currentPo = po;
                                this.patchGrnForm(data.grn, po);
                                this.isLoading = false;
                                this.cdr.detectChanges();
                            },
                            error: () => {
                                this.patchGrnForm(data.grn);
                                this.isLoading = false;
                                this.cdr.detectChanges();
                            }
                        });
                    } else {
                        this.patchGrnForm(data.grn);
                        this.isLoading = false;
                        this.cdr.detectChanges();
                    }
                } else {
                    // Check for PO ID in query params (if creating from PO)
                    const poId = this.route.snapshot.queryParamMap.get('poId');
                    if (poId) {
                        this.onPoChange(poId);
                    }
                    this.isLoading = false;
                    this.cdr.detectChanges();
                }
            },
            error: (err) => {
                console.error('Error loading initial data:', err);
                this.isLoading = false;
                this.cdr.detectChanges();
            }
        });
    }

    getPoVendorName(vendorId: string): string {
        const vendor = this.vendors.find(v => (v.id || '').toLowerCase() === (vendorId || '').toLowerCase());
        return vendor ? (vendor.name || '') : vendorId;
    }

    patchGrnForm(grn: any, po?: any): void {
        this.grnForm.patchValue({
            vendorId: (grn.vendorId || '').toLowerCase(),
            warehouseId: (grn.warehouseId || '').toLowerCase(),
            purchaseOrderId: (grn.purchaseOrderId || '').toLowerCase(),
            reference: grn.reference
        });

        while (this.lines.length !== 0) {
            this.lines.removeAt(0);
        }

        grn.lines.forEach((line: any) => {
            // Find corresponding PO line if PO data is provided
            let poLine = null;
            if (po && po.lines) {
                const lineId = (line.itemId || '').toLowerCase();
                poLine = po.lines.find((pl: any) => (pl.itemId || '').toLowerCase() === lineId);
            }

            const ordered = poLine?.quantityOrdered || 0;
            const received = poLine?.receivedQuantity || 0;
            const remaining = ordered - received;

            const lineForm = this.fb.group({
                itemId: [(line.itemId || '').toLowerCase(), Validators.required],
                quantityOrdered: [ordered],
                alreadyReceived: [received],
                quantity: [line.quantity, [Validators.required, Validators.min(0)]],
                unitPrice: [line.unitPrice, [Validators.required, Validators.min(0)]]
            });
            this.lines.push(lineForm);
        });
    }

    get lines(): FormArray {
        return this.grnForm.get('lines') as FormArray;
    }

    addLine(item?: any): void {
        const ordered = item?.quantityOrdered || 0;
        const received = item?.receivedQuantity || 0;
        const remaining = ordered - received;

        const lineForm = this.fb.group({
            itemId: [(item?.itemId || '').toLowerCase(), Validators.required],
            quantityOrdered: [ordered], // Display only
            alreadyReceived: [received], // Display only
            quantity: [item?.quantity || (remaining > 0 ? remaining : 0), [Validators.required, Validators.min(0)]], // Actually receiving now
            unitPrice: [item?.unitPrice || 0, [Validators.required, Validators.min(0)]]
        });
        this.lines.push(lineForm);
    }

    getFilteredItems(): Item[] {
        if (!this.currentPo || !this.currentPo.lines) {
            return this.items;
        }

        const poItemIds = new Set(this.currentPo.lines.map((l: any) => (l.itemId || '').toLowerCase()));
        return this.items.filter(i => poItemIds.has((i.id || '').toLowerCase()));
    }

    removeLine(index: number): void {
        this.lines.removeAt(index);
    }

    onPoChange(poId: string): void {
        if (!poId) {
            // Option to clear lines if PO is deselected?
            return;
        }

        this.isLoading = true; // Show loading while fetching full PO details
        this.poService.getById(poId).subscribe({
            next: (po) => {
                this.currentPo = po;
                if (po) {
                    this.grnForm.patchValue({
                        vendorId: (po.vendorId || '').toLowerCase(),
                        warehouseId: (po.warehouseId || '').toLowerCase(),
                        purchaseOrderId: (po.id || '').toLowerCase(),
                        reference: 'GRN-FROM-' + po.reference
                    });

                    // Clear existing lines
                    while (this.lines.length !== 0) {
                        this.lines.removeAt(0);
                    }

                    // Add lines from PO
                    if (po.lines && po.lines.length > 0) {
                        po.lines.forEach((line: any) => {
                            this.addLine(line);
                        });
                    }
                }
                this.isLoading = false;
                this.cdr.detectChanges();
            },
            error: (err) => {
                console.error('Error fetching full PO details:', err);
                this.isLoading = false;
                this.cdr.detectChanges();
            }
        });
    }

    onSubmit(): void {
        if (this.grnForm.invalid) {
            this.grnForm.markAllAsTouched();
            return;
        }

        this.isSaving = true;
        const formValue = this.grnForm.value;
        const dto: CreateGrnDto = {
            purchaseOrderId: formValue.purchaseOrderId,
            reference: formValue.reference,
            lines: formValue.lines.map((l: any) => ({
                itemId: l.itemId,
                quantity: l.quantity,
                unitPrice: l.unitPrice
            }))
        };

        const operation = this.isEdit && this.grnId
            ? this.grnService.update(this.grnId, dto)
            : this.grnService.create(dto);

        operation.subscribe({
            next: (result) => {
                alert(this.isEdit ? 'GRN updated successfully!' : 'GRN created successfully!');
                this.router.navigate(['/grns/view', result.id]);
            },
            error: (err) => {
                console.error('Error saving GRN:', err);
                alert('Failed to save GRN');
                this.isSaving = false;
                this.cdr.detectChanges();
            }
        });
    }

    cancel(): void {
        this.router.navigate(['/grns']);
    }

    calculateLineTotal(index: number): number {
        const line = this.lines.at(index).value;
        return (line.quantity || 0) * (line.unitPrice || 0);
    }

    calculateGrandTotal(): number {
        return this.lines.controls.reduce((acc, control) => {
            const line = control.value;
            return acc + ((line.quantity || 0) * (line.unitPrice || 0));
        }, 0);
    }

    // Helper to get vendor details by ID
    getVendorInfo(vendorId: string): Vendor | undefined {
        return this.vendors.find(v => (v.id || '').toLowerCase() === (vendorId || '').toLowerCase());
    }

    // Helper to get warehouse details by ID
    getWarehouseInfo(warehouseId: string): Warehouse | undefined {
        return this.warehouses.find(w => (w.id || '').toLowerCase() === (warehouseId || '').toLowerCase());
    }
}
