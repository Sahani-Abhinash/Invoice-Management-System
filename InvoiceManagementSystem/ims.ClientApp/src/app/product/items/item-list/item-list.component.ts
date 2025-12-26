import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ItemService, Item } from '../item.service';

@Component({
    selector: 'app-item-list',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './item-list.component.html',
    styleUrls: []
})
export class ItemListComponent implements OnInit {
    items: Item[] = [];

    constructor(
        private itemService: ItemService,
        private router: Router,
        private cdr: ChangeDetectorRef
    ) { }

    ngOnInit(): void {
        this.loadItems();
    }

    loadItems() {
        this.itemService.getAll().subscribe(
            data => {
                this.items = data;
                this.cdr.detectChanges();
            },
            error => {
                console.error('Error loading items:', error);
            }
        );
    }

    deleteItem(id: string) {
        if (confirm('Are you sure you want to delete this item?')) {
            this.itemService.delete(id).subscribe(() => this.loadItems());
        }
    }

    editItem(id: string) {
        this.router.navigate(['/products/items/edit', id]);
    }

    createItem() {
        this.router.navigate(['/products/items/create']);
    }
}
