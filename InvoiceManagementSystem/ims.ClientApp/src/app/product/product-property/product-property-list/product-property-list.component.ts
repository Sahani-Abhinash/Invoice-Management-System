import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { ProductPropertyService } from '../product-property.service';
import { ProductProperty } from '../../../models/product-property.model';
import { TableDataManagerService } from '../../../shared/services/table-data-manager.service';
import { TableControlsComponent } from '../../../shared/components/table-controls/table-controls.component';
import { TablePaginationComponent } from '../../../shared/components/table-pagination/table-pagination.component';

@Component({
    selector: 'app-product-property-list',
    standalone: true,
    imports: [CommonModule, FormsModule, RouterModule, TableControlsComponent, TablePaginationComponent],
    providers: [TableDataManagerService],
    templateUrl: './product-property-list.component.html',
    styleUrl: './product-property-list.component.css'
})
export class ProductPropertyListComponent implements OnInit {
    loading = false;
    error = '';

    constructor(
        public tableManager: TableDataManagerService<ProductProperty>,
        private propertyService: ProductPropertyService,
        private router: Router,
        private cdr: ChangeDetectorRef
    ) { }

    ngOnInit(): void {
        this.loadProperties();
    }

    loadProperties(): void {
        this.loading = true;
        this.propertyService.getAll().subscribe({
            next: (data) => {
                this.tableManager.setData(data);
                this.loading = false;
                this.cdr.detectChanges();
            },
            error: (err) => {
                this.error = 'Failed to load product properties';
                this.loading = false;
                console.error(err);
            }
        });
    }

    onSearch(searchText: string): void {
        this.tableManager.applySearch(searchText, (property, search) => {
            const name = property.name?.toLowerCase() || '';
            const description = property.description?.toLowerCase() || '';
            return name.includes(search) || description.includes(search);
        });
    }

    onSort(column: string): void {
        this.tableManager.sortBy(column, (a, b, col) => {
            let aValue = '';
            let bValue = '';
            switch (col) {
                case 'name': aValue = a.name || ''; bValue = b.name || ''; break;
                case 'description': aValue = a.description || ''; bValue = b.description || ''; break;
                case 'displayOrder': return a.displayOrder - b.displayOrder;
            }
            return aValue.toLowerCase() < bValue.toLowerCase() ? -1 : 1;
        });
    }

    deleteProperty(id: string): void {
        if (confirm('Are you sure you want to delete this property? This will also delete all its attributes.')) {
            this.propertyService.delete(id).subscribe({
                next: () => {
                    this.loadProperties();
                },
                error: (err) => {
                    this.error = 'Failed to delete property';
                    console.error(err);
                }
            });
        }
    }

    editProperty(id: string): void {
        this.router.navigate(['/products/properties/edit', id]);
    }

    createProperty(): void {
        this.router.navigate(['/products/properties/create']);
    }

    viewAttributes(id: string): void {
        this.router.navigate(['/products/attributes'], { queryParams: { propertyId: id } });
    }
}
