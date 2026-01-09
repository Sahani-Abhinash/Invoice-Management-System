import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ItemPriceVariantService } from '../item-price-variant.service';
import { ItemPriceService } from '../../item-price/item-price.service';
import { ItemPriceVariant } from '../../../models/product-property.model';
import { FormsModule } from '@angular/forms';

@Component({
    selector: 'app-item-price-variant-list',
    standalone: true,
    imports: [CommonModule, RouterModule, FormsModule],
    templateUrl: './item-price-variant-list.component.html',
    styleUrl: './item-price-variant-list.component.css'
})
export class ItemPriceVariantListComponent implements OnInit {
    variants: ItemPriceVariant[] = [];
    filteredVariants: ItemPriceVariant[] = [];
    loading = false;
    error = '';
    searchTerm = '';

    // Group variants by item price
    groupedVariants: Map<string, ItemPriceVariant[]> = new Map();

    constructor(
        private variantService: ItemPriceVariantService,
        private itemPriceService: ItemPriceService,
        private cdr: ChangeDetectorRef
    ) { }

    ngOnInit(): void {
        this.loadVariants();
    }

    loadVariants(): void {
        this.loading = true;
        this.error = '';

        this.variantService.getAll().subscribe({
            next: (data) => {
                console.log('Variants loaded:', data);
                this.variants = data;
                this.filteredVariants = data;
                this.groupVariantsByItemPrice();
                this.loading = false;
                this.cdr.detectChanges();
                console.log('Grouped variants:', this.groupedVariants);
            },
            error: (err) => {
                this.error = 'Failed to load variants';
                this.loading = false;
                this.cdr.detectChanges();
                console.error('Error loading variants:', err);
            }
        });
    }

    groupVariantsByItemPrice(): void {
        this.groupedVariants.clear();

        this.filteredVariants.forEach(variant => {
            const key = variant.itemPriceId;
            if (!this.groupedVariants.has(key)) {
                this.groupedVariants.set(key, []);
            }
            this.groupedVariants.get(key)?.push(variant);
        });
    }

    onSearch(): void {
        if (!this.searchTerm.trim()) {
            this.filteredVariants = this.variants;
        } else {
            const term = this.searchTerm.toLowerCase();
            this.filteredVariants = this.variants.filter(v =>
                v.itemName?.toLowerCase().includes(term) ||
                v.propertyName?.toLowerCase().includes(term) ||
                v.attributeValue?.toLowerCase().includes(term) ||
                v.variantSKU?.toLowerCase().includes(term)
            );
        }
        this.groupVariantsByItemPrice();
        this.cdr.detectChanges();
    }

    deleteVariant(id: string): void {
        if (!confirm('Are you sure you want to delete this variant?')) {
            return;
        }

        this.loading = true;
        this.variantService.delete(id).subscribe({
            next: () => {
                this.loadVariants();
                this.cdr.detectChanges();
            },
            error: (err) => {
                this.error = 'Failed to delete variant';
                this.loading = false;
                this.cdr.detectChanges();
                console.error(err);
            }
        });
    }

    getItemPriceGroups(): string[] {
        return Array.from(this.groupedVariants.keys());
    }

    getVariantsForPrice(itemPriceId: string): ItemPriceVariant[] {
        return this.groupedVariants.get(itemPriceId) || [];
    }

    getItemName(itemPriceId: string): string {
        const variants = this.groupedVariants.get(itemPriceId);
        return variants && variants.length > 0 ? variants[0].itemName || 'Unknown Item' : 'Unknown Item';
    }

    getItemPrice(itemPriceId: string): number {
        const variants = this.groupedVariants.get(itemPriceId);
        return variants && variants.length > 0 ? variants[0].price || 0 : 0;
    }
}
