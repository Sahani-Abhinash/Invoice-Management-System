import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ItemPriceService, CreateItemPriceDto, PriceList } from '../item-price.service';
import { Item } from '../../items/item.service';

@Component({
    selector: 'app-item-price-form',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, RouterLink],
    templateUrl: './item-price-form.component.html',
    styleUrls: []
})
export class ItemPriceFormComponent implements OnInit {
    form: FormGroup;
    id: string | null = null;
    items: Item[] = [];
    priceLists: PriceList[] = [];
    isEditMode = false;

    constructor(
        private fb: FormBuilder,
        private route: ActivatedRoute,
        private router: Router,
        private itemPriceService: ItemPriceService
    ) {
        this.form = this.fb.group({
            itemId: ['', Validators.required],
            priceListId: ['', Validators.required],
            price: [0, [Validators.required, Validators.min(0)]],
            effectiveFrom: [new Date().toISOString().split('T')[0], Validators.required],
            effectiveTo: [null]
        });
    }

    ngOnInit(): void {
        this.id = this.route.snapshot.paramMap.get('id');
        this.isEditMode = !!this.id;

        this.loadDependencies();

        if (this.isEditMode && this.id) {
            this.itemPriceService.getById(this.id).subscribe(data => {
                const anyData = data as any;
                this.form.patchValue({
                    itemId: anyData.itemId || anyData.item?.id,
                    priceListId: anyData.priceListId || anyData.priceList?.id,
                    price: anyData.price,
                    effectiveFrom: anyData.effectiveFrom ? new Date(anyData.effectiveFrom).toISOString().split('T')[0] : '',
                    effectiveTo: anyData.effectiveTo ? new Date(anyData.effectiveTo).toISOString().split('T')[0] : null
                });
            });
        }
    }

    loadDependencies() {
        this.itemPriceService.getItems().subscribe(data => this.items = data);
        this.itemPriceService.getPriceLists().subscribe(data => this.priceLists = data);
    }

    save() {
        if (this.form.invalid) return;

        const dto: CreateItemPriceDto = {
            ...this.form.value,
            effectiveFrom: new Date(this.form.value.effectiveFrom).toISOString(),
            effectiveTo: this.form.value.effectiveTo ? new Date(this.form.value.effectiveTo).toISOString() : undefined
        };

        if (this.isEditMode && this.id) {
            this.itemPriceService.update(this.id, dto).subscribe(() => {
                this.router.navigate(['/products/prices']);
            });
        } else {
            this.itemPriceService.create(dto).subscribe(() => {
                this.router.navigate(['/products/prices']);
            });
        }
    }
}
