import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { PriceListService, PriceList } from '../price-list.service';

@Component({
    selector: 'app-price-list-list',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './price-list-list.component.html',
    styleUrls: []
})
export class PriceListListComponent implements OnInit {
    priceLists$!: import('rxjs').Observable<PriceList[]>;

    constructor(
        private priceListService: PriceListService,
        private router: Router
    ) { }

    ngOnInit(): void {
        this.loadPriceLists();
    }

    loadPriceLists() {
        this.priceLists$ = this.priceListService.getAll();
    }

    deletePriceList(id: string) {
        if (confirm('Are you sure you want to delete this price list?')) {
            this.priceListService.delete(id).subscribe(() => this.loadPriceLists());
        }
    }

    editPriceList(id: string) {
        this.router.navigate(['/products/pricelists/edit', id]);
    }

    createPriceList() {
        this.router.navigate(['/products/pricelists/create']);
    }
}
