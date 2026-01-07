import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ItemPropertyAttributeService } from '../item-property-attribute/item-property-attribute.service';
import { PropertyAttributeService } from '../property-attribute/property-attribute.service';
import { ProductPropertyService } from '../product-property/product-property.service';
import { ItemPropertyAttribute, CreateItemPropertyAttributeDto, PropertyAttribute, ProductProperty } from '../../models/product-property.model';

@Component({
    selector: 'app-item-property-assignment',
    standalone: true,
    imports: [CommonModule, FormsModule, ReactiveFormsModule],
    providers: [ItemPropertyAttributeService],
    templateUrl: './item-property-assignment.component.html',
    styleUrl: './item-property-assignment.component.css'
})
export class ItemPropertyAssignmentComponent implements OnInit {
    @Input() itemId!: string;
    @Output() assignmentUpdated = new EventEmitter<ItemPropertyAttribute[]>();

    assignedProperties: ItemPropertyAttribute[] = [];
    availableProperties: ProductProperty[] = [];
    availableAttributes: PropertyAttribute[] = [];

    selectedProperty: ProductProperty | null = null;
    selectedAttribute: PropertyAttribute | null = null;

    form!: FormGroup;
    loading = false;
    error = '';
    successMessage = '';

    constructor(
        private itemPropertyAttributeService: ItemPropertyAttributeService,
        private propertyAttributeService: PropertyAttributeService,
        private propertyService: ProductPropertyService,
        private fb: FormBuilder
    ) {
        this.form = this.fb.group({
            propertyId: ['', Validators.required],
            attributeId: ['', Validators.required],
            notes: ['']
        });
    }

    ngOnInit(): void {
        this.loadAssignedProperties();
        this.loadAvailableProperties();
    }

    loadAssignedProperties(): void {
        this.loading = true;
        this.itemPropertyAttributeService.getByItemId(this.itemId).subscribe({
            next: (data: ItemPropertyAttribute[]) => {
                this.assignedProperties = data;
                this.loading = false;
            },
            error: (err: any) => {
                this.error = 'Failed to load assigned properties';
                this.loading = false;
                console.error(err);
            }
        });
    }

    loadAvailableProperties(): void {
        this.propertyService.getAll().subscribe({
            next: (properties: ProductProperty[]) => {
                this.availableProperties = properties;
            },
            error: (err: any) => {
                this.error = 'Failed to load properties';
                console.error(err);
            }
        });
    }

    onPropertyChange(event: Event): void {
        const target = event.target as HTMLSelectElement;
        const propertyId = target.value;
        this.selectedProperty = this.availableProperties.find(p => p.id === propertyId) || null;
        this.selectedAttribute = null;
        this.form.patchValue({ attributeId: '' });

        if (this.selectedProperty) {
            this.propertyAttributeService.getByPropertyId(propertyId).subscribe({
                next: (attributes: PropertyAttribute[]) => {
                    this.availableAttributes = attributes;
                },
                error: (err: any) => {
                    this.error = 'Failed to load attributes for selected property';
                    console.error(err);
                }
            });
        }
    }

    onAttributeChange(event: Event): void {
        const target = event.target as HTMLSelectElement;
        const attributeId = target.value;
        this.selectedAttribute = this.availableAttributes.find(a => a.id === attributeId) || null;
    }

    assignProperty(): void {
        if (!this.form.valid || !this.selectedAttribute) {
            this.error = 'Please select both property and attribute';
            return;
        }

        const dto: CreateItemPropertyAttributeDto = {
            itemId: this.itemId,
            propertyAttributeId: this.form.get('attributeId')?.value,
            notes: this.form.get('notes')?.value,
            displayOrder: this.assignedProperties.length
        };

        this.loading = true;
        this.itemPropertyAttributeService.create(dto).subscribe({
            next: (result: ItemPropertyAttribute) => {
                this.successMessage = `${this.selectedAttribute?.value} assigned successfully`;
                this.form.reset();
                this.selectedProperty = null;
                this.selectedAttribute = null;
                this.availableAttributes = [];
                this.loadAssignedProperties();
                setTimeout(() => this.successMessage = '', 3000);
                this.loading = false;
            },
            error: (err: any) => {
                this.error = 'Failed to assign property';
                this.loading = false;
                console.error(err);
            }
        });
    }

    removeAssignment(id: string): void {
        if (confirm('Are you sure you want to remove this assignment?')) {
            this.itemPropertyAttributeService.delete(id).subscribe({
                next: () => {
                    this.loadAssignedProperties();
                },
                error: (err: any) => {
                    this.error = 'Failed to remove assignment';
                    console.error(err);
                }
            });
        }
    }

    clearMessages(): void {
        this.error = '';
        this.successMessage = '';
    }
}
