import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ItemPriceVariantService } from '../item-price-variant.service';
import { PropertyAttributeService } from '../../property-attribute/property-attribute.service';
import { ProductPropertyService } from '../../product-property/product-property.service';
import { ItemPriceVariant, PropertyAttribute, ProductProperty } from '../../../models/product-property.model';

/**
 * Variant Selector Component
 * Used for shopping carts and product display pages
 * Allows customers to select variant options (Color, Size, etc.) similar to Amazon/Flipkart
 * 
 * Example Usage:
 * <app-variant-selector 
 *   [itemPriceId]="productId"
 *   (variantSelected)="onVariantSelected($event)">
 * </app-variant-selector>
 */
@Component({
    selector: 'app-variant-selector',
    standalone: true,
    imports: [CommonModule, FormsModule],
    providers: [ItemPriceVariantService],
    templateUrl: './variant-selector.component.html',
    styleUrl: './variant-selector.component.css'
})
export class VariantSelectorComponent implements OnInit {
    @Input() itemPriceId: string = '';
    @Output() variantSelected = new EventEmitter<ItemPriceVariant>();
    @Output() variantCleared = new EventEmitter<void>();

    // State
    variants: ItemPriceVariant[] = [];
    groupedVariants: Map<string, ItemPriceVariant[]> = new Map();
    properties: ProductProperty[] = [];
    selectedVariants: Map<string, string> = new Map(); // propertyName -> propertyAttributeId
    selectedVariant: ItemPriceVariant | null = null;
    loading = false;
    error = '';
    success = '';

    constructor(
        private variantService: ItemPriceVariantService,
        private propertyService: ProductPropertyService,
        private propertyAttributeService: PropertyAttributeService
    ) { }

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
                this.variants = data;
                this.groupVariantsByProperty();
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
     * Load all available properties (Color, Size, etc.)
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
     * Group variants by property for display
     * e.g., {
     *   "Color": [Red, White, Blue],
     *   "Size": [S, M, L]
     * }
     */
    groupVariantsByProperty(): void {
        this.groupedVariants.clear();

        this.variants.forEach(variant => {
            const propName = variant.propertyName || 'Unknown';
            if (!this.groupedVariants.has(propName)) {
                this.groupedVariants.set(propName, []);
            }
            this.groupedVariants.get(propName)?.push(variant);
        });
    }

    /**
     * Get unique properties in variants
     */
    getPropertyNames(): string[] {
        return Array.from(this.groupedVariants.keys());
    }

    /**
     * Get variants for a specific property
     */
    getVariantsByProperty(propertyName: string): ItemPriceVariant[] {
        return this.groupedVariants.get(propertyName) || [];
    }

    /**
     * Handle variant selection
     */
    onVariantSelect(variant: ItemPriceVariant): void {
        this.selectedVariants.set(variant.propertyName || '', variant.propertyAttributeId);
        this.selectedVariant = variant;
        this.variantSelected.emit(variant);
        this.success = `Selected: ${variant.displayLabel}`;
    }

    /**
     * Clear selection
     */
    clearSelection(): void {
        this.selectedVariants.clear();
        this.selectedVariant = null;
        this.variantCleared.emit();
        this.success = '';
    }

    /**
     * Check if a variant is selected
     */
    isVariantSelected(variant: ItemPriceVariant): boolean {
        return this.selectedVariant?.id === variant.id;
    }

    /**
     * Check if a property has any selected variant
     */
    isPropertySelected(propertyName: string): boolean {
        return this.selectedVariants.has(propertyName);
    }

    /**
     * Get display text for a variant
     */
    getVariantDisplayText(variant: ItemPriceVariant): string {
        return `${variant.attributeValue}${variant.stockQuantity !== undefined ? ` (Stock: ${variant.stockQuantity})` : ''}`;
    }
}
