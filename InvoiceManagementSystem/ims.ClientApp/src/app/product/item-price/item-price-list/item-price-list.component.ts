import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ItemPriceService, ItemPrice } from '../item-price.service';

@Component({
    selector: 'app-item-price-list',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './item-price-list.component.html',
    styleUrls: []
})
export class ItemPriceListComponent implements OnInit {
    itemPrices$!: import('rxjs').Observable<ItemPrice[]>;

    constructor(
        private itemPriceService: ItemPriceService,
        private router: Router
    ) { }

    ngOnInit(): void {
        this.loadItemPrices();
    }

    loadItemPrices() {
        this.itemPrices$ = this.itemPriceService.getAll();
    }

    deleteItemPrice(id: string) {
        if (confirm('Are you sure you want to delete this price?')) {
            this.itemPriceService.delete(id).subscribe(() => this.loadItemPrices());
        }
    }

    editItemPrice(id: string) {
        this.router.navigate(['/products/prices/edit', id]);
    }

    createItemPrice() {
        this.router.navigate(['/products/prices/create']);
    }
}
