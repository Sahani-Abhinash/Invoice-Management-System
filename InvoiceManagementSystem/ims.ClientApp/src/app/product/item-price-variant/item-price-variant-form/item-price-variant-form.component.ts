import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ItemPriceVariantService } from '../item-price-variant.service';
import { PropertyAttributeService } from '../../property-attribute/property-attribute.service';
import { ProductPropertyService } from '../../product-property/product-property.service';
import { ItemPriceService } from '../../item-price/item-price.service';
import { ItemPriceVariant, CreateItemPriceVariantDto, UpdateItemPriceVariantDto, PropertyAttribute, ProductProperty } from '../../../models/product-property.model';

@Component({
    selector: 'app-item-price-variant-form',
    standalone: true,
    imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule],
    templateUrl: './item-price-variant-form.component.html',
    styleUrl: './item-price-variant-form.component.css'
})
export class ItemPriceVariantFormComponent implements OnInit {
    form: FormGroup;
    isEditMode = false;
    variantId: string | null = null;
    itemPriceId: string | null = null;

    // Data
    variant: ItemPriceVariant | null = null;
    itemPrices: any[] = [];
    properties: ProductProperty[] = [];
    attributes: PropertyAttribute[] = [];
    filteredAttributes: PropertyAttribute[] = [];

    // State
    loading = false;
    saving = false;
    error = '';

    constructor(
        private fb: FormBuilder,
        private route: ActivatedRoute,
        private router: Router,
        private variantService: ItemPriceVariantService,
        private propertyService: ProductPropertyService,
        private attributeService: PropertyAttributeService,
        private itemPriceService: ItemPriceService,
        private cdr: ChangeDetectorRef
    ) {
        this.form = this.fb.group({
            itemPriceId: ['', Validators.required],
            propertyAttributeId: ['', Validators.required],
            productPropertyId: [''],
            displayOrder: [0, [Validators.required, Validators.min(0)]],
            stockQuantity: [null, [Validators.min(0)]],
            variantSKU: ['', Validators.maxLength(100)]
        });
    }

    ngOnInit(): void {
        // Get ID from route if editing
        this.variantId = this.route.snapshot.paramMap.get('id');
        this.itemPriceId = this.route.snapshot.queryParamMap.get('itemPriceId');
        this.isEditMode = !!this.variantId;

        this.loadProperties();
        this.loadAttributesAndThenVariant();
        this.loadItemPrices();

        // Log form status for debugging
        this.form.statusChanges.subscribe(status => {
            console.log('Form status:', status, 'Valid:', this.form.valid);
            console.log('Form errors:', this.form.errors);
            console.log('Form value:', this.form.value);
        });

        // Watch for property changes to filter attributes
        this.form.get('productPropertyId')?.valueChanges.subscribe(propertyId => {
            this.onPropertyChange(propertyId);
        });
    }

    loadAttributesAndThenVariant(): void {
        this.attributeService.getAll().subscribe({
            next: (data) => {
                this.attributes = data;
                this.filteredAttributes = data;
                console.log('Attributes loaded:', data);
                
                // Now that attributes are loaded, load the variant if in edit mode
                if (this.isEditMode && this.variantId) {
                    this.loadVariant(this.variantId);
                }
            },
            error: (err) => {
                console.error('Failed to load attributes', err);
            }
        });
    }

    loadVariant(id: string): void {
        this.loading = true;
        this.variantService.getById(id).subscribe({
            next: (data) => {
                console.log('Variant loaded for edit:', data);
                this.variant = data;
                
                // Find the property ID from the property attribute
                const attribute = this.attributes.find(a => a.id === data.propertyAttributeId);
                const productPropertyId = attribute?.productPropertyId || '';
                
                console.log('Found attribute:', attribute);
                console.log('Product property ID:', productPropertyId);
                
                this.form.patchValue({
                    itemPriceId: data.itemPriceId,
                    propertyAttributeId: data.propertyAttributeId,
                    productPropertyId: productPropertyId,
                    displayOrder: data.displayOrder ?? 0,
                    stockQuantity: data.stockQuantity ?? null,
                    variantSKU: data.variantSKU ?? undefined
                });
                
                // Disable itemPriceId in edit mode (it's the primary key reference)
                // propertyAttributeId can now be updated since we removed the unique constraint
                this.form.get('itemPriceId')?.disable();
                this.form.get('productPropertyId')?.disable();
                
                this.loading = false;
                this.cdr.detectChanges();
                console.log('Form patched with variant data:', this.form.value);
            },
            error: (err) => {
                this.error = 'Failed to load variant';
                this.loading = false;
                this.cdr.detectChanges();
                console.error('Error loading variant:', err);
            }
        });
    }

    loadProperties(): void {
        this.propertyService.getAll().subscribe({
            next: (data) => {
                this.properties = data;
            },
            error: (err) => {
                console.error('Failed to load properties', err);
            }
        });
    }

    loadItemPrices(): void {
        this.itemPriceService.getAll().subscribe({
            next: (data) => {
                // Add itemName for easy display
                this.itemPrices = data.map(ip => ({
                    ...ip,
                    itemName: ip.item?.name || 'Unknown Item'
                }));
            },
            error: (err) => {
                console.error('Failed to load item prices', err);
                this.error = 'Failed to load item prices';
            }
        });
    }

    getAttributesByProperty(propertyId: string): PropertyAttribute[] {
        if (!propertyId || !this.attributes) {
            return [];
        }
        return this.attributes.filter(a => a.productPropertyId === propertyId);
    }

    onPropertyChange(propertyId: string): void {
        if (propertyId) {
            this.filteredAttributes = this.attributes.filter(a => a.productPropertyId === propertyId);
        } else {
            this.filteredAttributes = this.attributes;
        }
        // Reset attribute selection only in create mode, not in edit mode
        if (!this.isEditMode) {
            this.form.patchValue({ propertyAttributeId: '' });
        }
    }

    onSubmit(): void {
        console.log('Submit clicked - Form valid:', this.form.valid);
        console.log('Form value:', this.form.value);
        console.log('Form errors:', this.form.errors);
        
        // Check individual control errors
        Object.keys(this.form.controls).forEach(key => {
            const control = this.form.get(key);
            if (control?.invalid) {
                console.log(`Control ${key} invalid:`, control.errors);
            }
        });

        if (this.form.invalid) {
            this.form.markAllAsTouched();
            console.error('Form is invalid, cannot submit');
            return;
        }

        this.saving = true;
        this.error = '';

        const formValue = this.form.value;
        
        // Get the raw value including disabled controls
        const rawValue = this.form.getRawValue();
        
        // Convert values to proper types
        const stockQuantity = formValue.stockQuantity ? parseInt(formValue.stockQuantity, 10) : undefined;
        const displayOrder = parseInt(formValue.displayOrder, 10) || 0;
        
        // Use rawValue for itemPriceId since it might be disabled
        const itemPriceId = rawValue.itemPriceId || formValue.itemPriceId;

        console.log('Creating variant with:', {
            itemPriceId: itemPriceId,
            propertyAttributeId: formValue.propertyAttributeId,
            displayOrder: displayOrder,
            stockQuantity: stockQuantity,
            variantSKU: formValue.variantSKU
        });

        if (this.isEditMode && this.variantId) {
            // Get propertyAttributeId from raw value since it might be disabled
            const propertyAttributeId = rawValue.propertyAttributeId || formValue.propertyAttributeId;
            
            const dto: UpdateItemPriceVariantDto = {
                id: this.variantId,
                itemPriceId: itemPriceId,
                propertyAttributeId: propertyAttributeId,
                displayOrder: displayOrder,
                stockQuantity: stockQuantity,
                variantSKU: formValue.variantSKU || undefined
            };

            this.variantService.update(this.variantId, dto).subscribe({
                next: () => {
                    this.router.navigate(['/products/variants']);
                },
                error: (err) => {
                    const errorMsg = err.error?.message || err.error?.detail || err.statusText || 'Failed to update variant';
                    this.error = errorMsg;
                    this.saving = false;
                    this.cdr.detectChanges();
                    console.error('Error updating variant:', err);
                    console.error('Error response:', err.error);
                    console.error('DTO sent:', dto);
                }
            });
        } else {
            const dto: CreateItemPriceVariantDto = {
                itemPriceId: itemPriceId,
                propertyAttributeId: formValue.propertyAttributeId,
                displayOrder: displayOrder,
                stockQuantity: stockQuantity,
                variantSKU: formValue.variantSKU || undefined
            };

            console.log('Creating variant with DTO:', dto);

            this.variantService.create(dto).subscribe({
                next: () => {
                    this.router.navigate(['/products/variants']);
                },
                error: (err) => {
                    const errorMsg = err.error?.message || err.error?.detail || err.statusText || 'Failed to create variant';
                    this.error = errorMsg;
                    this.saving = false;
                    this.cdr.detectChanges();
                    console.error('Error creating variant:', err);
                    console.error('Error response:', err.error);
                    console.error('DTO sent:', dto);
                    console.error('Error details:', err.error);
                }
            });
        }
    }

    cancel(): void {
        this.router.navigate(['/products/variants']);
    }

    getPropertyName(attributeId: string): string {
        const attribute = this.attributes.find(a => a.id === attributeId);
        if (!attribute) return '';
        const property = this.properties.find(p => p.id === attribute.productPropertyId);
        return property?.name || '';
    }

    getItemPriceName(itemPriceId: string): string {
        const itemPrice = this.itemPrices.find(ip => ip.id === itemPriceId);
        return itemPrice ? `${itemPrice.itemName} - ${itemPrice.price}` : '';
    }
}
