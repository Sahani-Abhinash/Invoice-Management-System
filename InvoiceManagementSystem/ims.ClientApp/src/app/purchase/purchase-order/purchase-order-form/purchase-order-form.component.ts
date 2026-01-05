import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { PurchaseOrderService, CreatePurchaseOrderDto } from '../purchase-order.service';
import { Vendor } from '../../../companies/vendor/vendor.service';
import { Warehouse } from '../../../warehouse/warehouse.service';
import { Item } from '../../../product/items/item.service';
import { CompanyService, Company } from '../../../companies/company/company.service';

@Component({
    selector: 'app-purchase-order-form',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule],
    templateUrl: './purchase-order-form.component.html',
    styleUrls: ['./purchase-order-form.component.css']
})
export class PurchaseOrderFormComponent implements OnInit {
    private fb = inject(FormBuilder);
    private poService = inject(PurchaseOrderService);
    private companyService = inject(CompanyService);
    private router = inject(Router);
    private route = inject(ActivatedRoute);
    private cdr = inject(ChangeDetectorRef);

    form: FormGroup;
    vendors: Vendor[] = [];
    warehouses: Warehouse[] = [];
    items: Item[] = [];
    selectedVendor: Vendor | null = null;
    id: string | null = null;
    isEditMode = false;
    now = new Date();
    companyInfo = {
        name: '',
        address: '',
        cityStateZip: '',
        email: '',
        phone: '',
        taxNumber: ''
    };
    companyLogoUrl: string | null = null;

    constructor() {
        this.form = this.fb.group({
            vendorId: ['', Validators.required],
            warehouseId: ['', Validators.required],
            reference: ['', Validators.required],
            lines: this.fb.array([])
        });

        // Listen to vendor selection changes
        this.form.get('vendorId')?.valueChanges.subscribe(vendorId => {
            this.selectedVendor = this.vendors.find(v => v.id === vendorId) || null;
            this.cdr.detectChanges();
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
        this.poService.getVendors().subscribe(v => {
            this.vendors = v;
            this.cdr.detectChanges();
        });
        this.poService.getWarehouses().subscribe(w => {
            this.warehouses = w;
            this.cdr.detectChanges();
        });
        this.poService.getItems().subscribe(i => {
            this.items = i;
            this.cdr.detectChanges();
        });

        this.companyService.getAll().subscribe({
            next: companies => {
                const company = companies && companies.length ? companies[0] : null;
                if (company) {
                    const anyCompany = company as any;
                    this.companyInfo = {
                        name: company.name || '',
                        address: anyCompany?.address?.line1 || anyCompany?.addressLine1 || '',
                        cityStateZip:
                            [
                                anyCompany?.address?.city?.name || anyCompany?.city || '',
                                anyCompany?.address?.state?.name || anyCompany?.state || '',
                                anyCompany?.address?.postalCode?.code || anyCompany?.postalCode || ''
                            ].filter(Boolean).join(', ').trim(),
                        email: company.email || '',
                        phone: company.phone || '',
                        taxNumber: company.taxNumber || ''
                    };
                    this.companyLogoUrl = this.resolveLogoUrl(company.logoUrl);
                }
                this.cdr.detectChanges();
            },
            error: () => {
                // Fallback to defaults already set
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
