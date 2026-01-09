import { Component, OnInit, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ItemPriceVariantService } from '../item-price-variant.service';
import { PropertyAttributeService } from '../../property-attribute/property-attribute.service';
import { ProductPropertyService } from '../../product-property/product-property.service';
import { ItemPriceVariant, CreateItemPriceVariantDto, PropertyAttribute, ProductProperty } from '../../../models/product-property.model';

/**
 * Variant Manager Component
 * Used for admins to manage product variants
 * Add/edit/delete color and size variants for a product price
 * 
 * Example Usage:
 * <app-variant-manager 
 *   [itemPriceId]="selectedPriceId">
 * </app-variant-manager>
 */
@Component({
    selector: 'app-variant-manager',
    standalone: true,
    imports: [CommonModule, FormsModule, ReactiveFormsModule],
    providers: [ItemPriceVariantService],
    templateUrl: './variant-manager.component.html',
    styleUrl: './variant-manager.component.css'
})
export class VariantManagerComponent implements OnInit {
    @Input() itemPriceId: string = '';

    // Form
    form: FormGroup;
    isEditMode = false;
    editingVariantId: string | null = null;

    // Data
    variants: ItemPriceVariant[] = [];
    properties: ProductProperty[] = [];
    attributes: PropertyAttribute[] = [];
    selectedProperty: ProductProperty | null = null;

    // State
    loading = false;
    error = '';
    success = '';

    constructor(
        private fb: FormBuilder,
        private variantService: ItemPriceVariantService,
        private propertyService: ProductPropertyService,
        private attributeService: PropertyAttributeService
    ) {
        this.form = this.fb.group({
            propertyId: ['', Validators.required],
            propertyAttributeId: ['', Validators.required],
            displayOrder: [0, [Validators.required, Validators.min(0)]],
            stockQuantity: ['', [Validators.min(0)]],
            variantSKU: ['', Validators.maxLength(100)]
        });
    }

    ngOnInit(): void {
        if (this.itemPriceId) {
            this.loadVariants();
            this.loadProperties();
        }
    }

    /**
     * Load all variants for this price
     */
    loadVariants(): void {
        this.loading = true;
        this.error = '';

        this.variantService.getByItemPriceId(this.itemPriceId).subscribe({
            next: (data) => {
                this.variants = data.sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0));
                this.loading = false;
            },
            error: (err) => {
                this.error = 'Failed to load variants';
                this.loading = false;
                console.error(err);
            }
        });
    }

    /**
     * Load all properties (Color, Size, etc.)
     */
    loadProperties(): void {
        this.propertyService.getAll().subscribe({
            next: (data) => {
                this.properties = data;
            },
            error: (err) => {
                this.error = 'Failed to load properties';
                console.error(err);
            }
        });
    }

    /**
     * Load attributes when property is selected
     */
    onPropertyChange(event: Event): void {
        const target = event.target as HTMLSelectElement;
        const propertyId = target.value;

        this.selectedProperty = this.properties.find(p => p.id === propertyId) || null;
        this.form.patchValue({ propertyAttributeId: '' });

        if (this.selectedProperty) {
            this.attributeService.getByPropertyId(propertyId).subscribe({
                next: (attributes: PropertyAttribute[]) => {
                    this.attributes = attributes;
                },
                error: (err) => {
                    this.error = 'Failed to load attributes';
                    console.error(err);
                }
            });
        }
    }

    /**
     * Submit form to create or update variant
     */
    onSubmit(): void {
        if (!this.form.valid || !this.itemPriceId) {
            this.error = 'Please fill in all required fields';
            return;
        }

        this.loading = true;
        this.error = '';
        this.success = '';

        const dto: CreateItemPriceVariantDto = {
            itemPriceId: this.itemPriceId,
            propertyAttributeId: this.form.get('propertyAttributeId')?.value,
            displayOrder: this.form.get('displayOrder')?.value,
            stockQuantity: this.form.get('stockQuantity')?.value || 0,
            variantSKU: this.form.get('variantSKU')?.value
        };

        if (this.isEditMode && this.editingVariantId) {
            this.variantService.update(this.editingVariantId, { ...dto, id: this.editingVariantId } as any).subscribe({
                next: () => {
                    this.success = 'Variant updated successfully';
                    this.resetForm();
                    this.loadVariants();
                    this.loading = false;
                },
                error: (err) => {
                    this.error = err.error?.message || 'Failed to update variant';
                    this.loading = false;
                }
            });
        } else {
            this.variantService.create(dto).subscribe({
                next: () => {
                    this.success = 'Variant created successfully';
                    this.resetForm();
                    this.loadVariants();
                    this.loading = false;
                },
                error: (err) => {
                    this.error = err.error?.message || 'Failed to create variant';
                    this.loading = false;
                }
            });
        }
    }

    /**
     * Load variant for editing
     */
    editVariant(variant: ItemPriceVariant): void {
        this.isEditMode = true;
        this.editingVariantId = variant.id;

        const property = this.properties.find(p => p.name === variant.propertyName);
        if (property) {
            this.selectedProperty = property;
            this.form.patchValue({
                propertyId: property.id,
                propertyAttributeId: variant.propertyAttributeId,
                displayOrder: variant.displayOrder,
                stockQuantity: variant.stockQuantity,
                variantSKU: variant.variantSKU
            });

            this.attributeService.getByPropertyId(property.id).subscribe({
                next: (attributes: PropertyAttribute[]) => {
                    this.attributes = attributes;
                }
            });
        }
    }

    /**
     * Delete a variant
     */
    deleteVariant(id: string): void {
        if (!confirm('Are you sure you want to delete this variant?')) {
            return;
        }

        this.loading = true;
        this.variantService.delete(id).subscribe({
            next: () => {
                this.success = 'Variant deleted successfully';
                this.loadVariants();
                this.loading = false;
            },
            error: (err) => {
                this.error = 'Failed to delete variant';
                this.loading = false;
                console.error(err);
            }
        });
    }

    /**
     * Reset form
     */
    resetForm(): void {
        this.form.reset();
        this.isEditMode = false;
        this.editingVariantId = null;
        this.selectedProperty = null;
        this.attributes = [];
    }
}
