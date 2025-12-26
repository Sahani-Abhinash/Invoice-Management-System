import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { PurchaseOrderService, CreatePurchaseOrderDto } from '../purchase-order.service';
import { Vendor } from '../../../companies/vendor/vendor.service';
import { Warehouse } from '../../../warehouse/warehouse.service';
import { Item } from '../../../product/items/item.service';

@Component({
    selector: 'app-purchase-order-form',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule],
    templateUrl: './purchase-order-form.component.html',
    styleUrls: ['./purchase-order-form.component.css']
})
export class PurchaseOrderFormComponent implements OnInit {
    form: FormGroup;
    vendors: Vendor[] = [];
    warehouses: Warehouse[] = [];
    items: Item[] = [];
    id: string | null = null;
    isEditMode = false;
    now = new Date();

    constructor(
        private fb: FormBuilder,
        private poService: PurchaseOrderService,
        private router: Router,
        private route: ActivatedRoute
    ) {
        this.form = this.fb.group({
            vendorId: ['', Validators.required],
            warehouseId: ['', Validators.required],
            reference: ['', Validators.required],
            lines: this.fb.array([])
        });
    }

    ngOnInit(): void {
        this.loadDependencies();

        this.id = this.route.snapshot.paramMap.get('id');
        if (this.id) {
            this.isEditMode = true;
            this.loadPO(this.id);
        } else {
            this.addLine(); // Start with one empty line for create
        }
    }

    get lines(): FormArray {
        return this.form.get('lines') as FormArray;
    }

    loadDependencies() {
        this.poService.getVendors().subscribe(v => this.vendors = v);
        this.poService.getWarehouses().subscribe(w => this.warehouses = w);
        this.poService.getItems().subscribe(i => this.items = i);
    }

    loadPO(id: string) {
        this.poService.getById(id).subscribe(po => {
            this.form.patchValue({
                vendorId: po.vendorId,
                warehouseId: po.warehouseId,
                reference: po.reference
            });

            this.lines.clear();
            po.lines.forEach(line => {
                this.lines.push(this.fb.group({
                    itemId: [line.itemId, Validators.required],
                    quantityOrdered: [line.quantityOrdered, [Validators.required, Validators.min(0.01)]],
                    unitPrice: [line.unitPrice, [Validators.required, Validators.min(0)]]
                }));
            });
        });
    }

    addLine() {
        const lineGroup = this.fb.group({
            itemId: ['', Validators.required],
            quantityOrdered: [1, [Validators.required, Validators.min(0.01)]],
            unitPrice: [0, [Validators.required, Validators.min(0)]]
        });
        this.lines.push(lineGroup);
    }

    removeLine(index: number) {
        this.lines.removeAt(index);
    }

    calculateTotal(): number {
        return this.lines.controls.reduce((acc, control) => {
            const qty = control.get('quantityOrdered')?.value || 0;
            const price = control.get('unitPrice')?.value || 0;
            return acc + (qty * price);
        }, 0);
    }

    save() {
        if (this.form.invalid) return;

        const dto: CreatePurchaseOrderDto = this.form.value;

        if (this.isEditMode && this.id) {
            this.poService.update(this.id, dto).subscribe(
                () => this.router.navigate(['/purchase-orders']),
                error => console.error('Error updating PO', error)
            );
        } else {
            this.poService.create(dto).subscribe(
                () => this.router.navigate(['/purchase-orders']),
                error => console.error('Error creating PO', error)
            );
        }
    }

    cancel() {
        this.router.navigate(['/purchase-orders']);
    }
}
