import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { PropertyAttributeService } from '../property-attribute.service';
import { ProductPropertyService } from '../../product-property/product-property.service';
import { PropertyAttribute } from '../../../models/product-property.model';
import { TableDataManagerService } from '../../../shared/services/table-data-manager.service';
import { TableControlsComponent } from '../../../shared/components/table-controls/table-controls.component';
import { TablePaginationComponent } from '../../../shared/components/table-pagination/table-pagination.component';

@Component({
    selector: 'app-property-attribute-list',
    standalone: true,
    imports: [CommonModule, FormsModule, RouterModule, TableControlsComponent, TablePaginationComponent],
    providers: [TableDataManagerService],
    templateUrl: './property-attribute-list.component.html',
    styleUrl: './property-attribute-list.component.css'
})
export class PropertyAttributeListComponent implements OnInit {
    selectedPropertyId: string | null = null;
    selectedPropertyName: string = '';
    loading = false;
    error = '';

    constructor(
        public tableManager: TableDataManagerService<PropertyAttribute>,
        private attributeService: PropertyAttributeService,
        private propertyService: ProductPropertyService,
        private router: Router,
        private route: ActivatedRoute,
        private cdr: ChangeDetectorRef
    ) { }

    ngOnInit(): void {
        this.route.queryParams.subscribe(params => {
            this.selectedPropertyId = params['propertyId'] || null;
            this.loadAttributes();
            if (this.selectedPropertyId) {
                this.loadPropertyName();
            }
        });
    }

    loadPropertyName(): void {
        if (!this.selectedPropertyId) return;
        this.propertyService.getById(this.selectedPropertyId).subscribe({
            next: (property) => {
                this.selectedPropertyName = property.name;
            },
            error: (err) => console.error('Failed to load property name', err)
        });
    }

    loadAttributes(): void {
        this.loading = true;
        const observable = this.selectedPropertyId
            ? this.attributeService.getByPropertyId(this.selectedPropertyId)
            : this.attributeService.getAll();

        observable.subscribe({
            next: (data) => {
                this.tableManager.setData(data);
                this.loading = false;
                this.cdr.detectChanges();
            },
            error: (err) => {
                this.error = 'Failed to load property attributes';
                this.loading = false;
                console.error(err);
            }
        });
    }

    onSearch(searchText: string): void {
        this.tableManager.applySearch(searchText, (attribute, search) => {
            const value = attribute.value?.toLowerCase() || '';
            const description = attribute.description?.toLowerCase() || '';
            const propertyName = attribute.productPropertyName?.toLowerCase() || '';
            return value.includes(search) || description.includes(search) || propertyName.includes(search);
        });
    }

    onSort(column: string): void {
        this.tableManager.sortBy(column, (a, b, col) => {
            let aValue = '';
            let bValue = '';
            switch (col) {
                case 'value': aValue = a.value || ''; bValue = b.value || ''; break;
                case 'description': aValue = a.description || ''; bValue = b.description || ''; break;
                case 'propertyName': aValue = a.productPropertyName || ''; bValue = b.productPropertyName || ''; break;
                case 'displayOrder': return a.displayOrder - b.displayOrder;
            }
            return aValue.toLowerCase() < bValue.toLowerCase() ? -1 : 1;
        });
    }

    deleteAttribute(id: string): void {
        if (confirm('Are you sure you want to delete this attribute?')) {
            this.attributeService.delete(id).subscribe({
                next: () => {
                    this.loadAttributes();
                },
                error: (err) => {
                    this.error = 'Failed to delete attribute';
                    console.error(err);
                }
            });
        }
    }

    editAttribute(id: string): void {
        this.router.navigate(['/products/attributes/edit', id]);
    }

    createAttribute(): void {
        const params = this.selectedPropertyId ? { propertyId: this.selectedPropertyId } : {};
        this.router.navigate(['/products/attributes/create'], { queryParams: params });
    }

    clearFilter(): void {
        this.router.navigate(['/products/attributes']);
    }

    backToProperties(): void {
        this.router.navigate(['/products/properties']);
    }
}
