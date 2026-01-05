import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ItemService, Item } from '../item.service';
import { TableDataManagerService } from '../../../shared/services/table-data-manager.service';
import { TableControlsComponent } from '../../../shared/components/table-controls/table-controls.component';
import { TablePaginationComponent } from '../../../shared/components/table-pagination/table-pagination.component';

@Component({
    selector: 'app-item-list',
    standalone: true,
    imports: [CommonModule, FormsModule, TableControlsComponent, TablePaginationComponent],
    providers: [TableDataManagerService],
    templateUrl: './item-list.component.html',
    styleUrls: []
})
export class ItemListComponent implements OnInit {
    Math = Math;

    constructor(
        public tableManager: TableDataManagerService<Item>,
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
                this.tableManager.setData(data);
                console.log(data);
                this.cdr.detectChanges();
            },
            error => {
                console.error('Error loading items:', error);
            }
        );
    }

    onSearch(searchText: string) {
        this.tableManager.applySearch(searchText, (item, search) => {
            const name = item.name?.toLowerCase() || '';
            const sku = item.sku?.toLowerCase() || '';
            const uom = item.unitOfMeasure?.name?.toLowerCase() || '';
            return name.includes(search) || sku.includes(search) || uom.includes(search);
        });
    }

    onSort(column: string) {
        this.tableManager.sortBy(column, (a, b, col) => {
            let aValue = '';
            let bValue = '';
            switch (col) {
                case 'name': aValue = a.name || ''; bValue = b.name || ''; break;
                case 'sku': aValue = a.sku || ''; bValue = b.sku || ''; break;
                case 'uom': aValue = a.unitOfMeasure?.name || ''; bValue = b.unitOfMeasure?.name || ''; break;
            }
            return aValue.toLowerCase() < bValue.toLowerCase() ? -1 : 1;
        });
    }

    deleteItem(id: string) {
        if (confirm('Are you sure you want to delete this item?')) {
            this.itemService.delete(id).subscribe(() => this.loadItems());
        }
    }

    getMainImageUrl(item: Item): string | null {
        if (!item) return null;
        const images = item.images || [];
        const mainImage = images.find(i => i.isMain) || images[0];
        const url = (mainImage?.imageUrl || item.mainImageUrl || '').trim();
        return url || null;
    }

    editItem(id: string) {
        this.router.navigate(['/products/items/edit', id]);
    }

    createItem() {
        this.router.navigate(['/products/items/create']);
    }
}
