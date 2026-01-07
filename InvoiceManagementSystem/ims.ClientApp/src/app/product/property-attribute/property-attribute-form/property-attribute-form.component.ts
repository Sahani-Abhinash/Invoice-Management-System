import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { PropertyAttributeService } from '../property-attribute.service';
import { ProductPropertyService } from '../../product-property/product-property.service';
import { CreatePropertyAttributeDto, ProductProperty } from '../../../models/product-property.model';

@Component({
    selector: 'app-property-attribute-form',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, RouterModule],
    templateUrl: './property-attribute-form.component.html',
    styleUrl: './property-attribute-form.component.css'
})
export class PropertyAttributeFormComponent implements OnInit {
    form: FormGroup;
    isEditMode = false;
    attributeId: string | null = null;
    properties: ProductProperty[] = [];
    loading = false;
    error = '';
    success = '';

    constructor(
        private fb: FormBuilder,
        private attributeService: PropertyAttributeService,
        private propertyService: ProductPropertyService,
        private router: Router,
        private route: ActivatedRoute
    ) {
        this.form = this.fb.group({
            productPropertyId: ['', Validators.required],
            value: ['', [Validators.required, Validators.maxLength(100)]],
            description: ['', Validators.maxLength(500)],
            displayOrder: [0, [Validators.required, Validators.min(0)]],
            metadata: ['', Validators.maxLength(1000)]
        });
    }

    ngOnInit(): void {
        this.loadProperties();
        this.attributeId = this.route.snapshot.paramMap.get('id');
        
        // Check for propertyId in query params (when creating from property list)
        this.route.queryParams.subscribe(params => {
            const propertyId = params['propertyId'];
            if (propertyId && !this.attributeId) {
                this.form.patchValue({ productPropertyId: propertyId });
            }
        });

        if (this.attributeId) {
            this.isEditMode = true;
            this.loadAttribute();
        }
    }

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

    loadAttribute(): void {
        if (!this.attributeId) return;

        this.loading = true;
        this.attributeService.getById(this.attributeId).subscribe({
            next: (attribute) => {
                this.form.patchValue({
                    productPropertyId: attribute.productPropertyId,
                    value: attribute.value,
                    description: attribute.description,
                    displayOrder: attribute.displayOrder,
                    metadata: attribute.metadata
                });
                this.loading = false;
            },
            error: (err) => {
                this.error = 'Failed to load attribute';
                this.loading = false;
                console.error(err);
            }
        });
    }

    onSubmit(): void {
        if (this.form.invalid) {
            this.form.markAllAsTouched();
            return;
        }

        const dto: CreatePropertyAttributeDto = this.form.value;
        this.loading = true;
        this.error = '';

        const operation = this.isEditMode && this.attributeId
            ? this.attributeService.update(this.attributeId, dto)
            : this.attributeService.create(dto);

        operation.subscribe({
            next: () => {
                this.success = `Attribute ${this.isEditMode ? 'updated' : 'created'} successfully`;
                setTimeout(() => this.router.navigate(['/products/attributes']), 1500);
            },
            error: (err) => {
                this.error = `Failed to ${this.isEditMode ? 'update' : 'create'} attribute`;
                this.loading = false;
                console.error(err);
            }
        });
    }

    cancel(): void {
        this.router.navigate(['/products/attributes']);
    }
}
