import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { ProductPropertyService } from '../product-property.service';
import { CreateProductPropertyDto } from '../../../models/product-property.model';

@Component({
    selector: 'app-product-property-form',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, RouterModule],
    templateUrl: './product-property-form.component.html',
    styleUrl: './product-property-form.component.css'
})
export class ProductPropertyFormComponent implements OnInit {
    form: FormGroup;
    isEditMode = false;
    propertyId: string | null = null;
    loading = false;
    error = '';
    success = '';

    constructor(
        private fb: FormBuilder,
        private propertyService: ProductPropertyService,
        private router: Router,
        private route: ActivatedRoute
    ) {
        this.form = this.fb.group({
            name: ['', [Validators.required, Validators.maxLength(100)]],
            description: ['', Validators.maxLength(500)],
            displayOrder: [0, [Validators.required, Validators.min(0)]]
        });
    }

    ngOnInit(): void {
        this.propertyId = this.route.snapshot.paramMap.get('id');
        if (this.propertyId) {
            this.isEditMode = true;
            this.loadProperty();
        }
    }

    loadProperty(): void {
        if (!this.propertyId) return;

        this.loading = true;
        this.propertyService.getById(this.propertyId).subscribe({
            next: (property) => {
                this.form.patchValue({
                    name: property.name,
                    description: property.description,
                    displayOrder: property.displayOrder
                });
                this.loading = false;
            },
            error: (err) => {
                this.error = 'Failed to load property';
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

        const dto: CreateProductPropertyDto = this.form.value;
        this.loading = true;
        this.error = '';

        const operation = this.isEditMode && this.propertyId
            ? this.propertyService.update(this.propertyId, dto)
            : this.propertyService.create(dto);

        operation.subscribe({
            next: () => {
                this.success = `Property ${this.isEditMode ? 'updated' : 'created'} successfully`;
                setTimeout(() => this.router.navigate(['/products/properties']), 1500);
            },
            error: (err) => {
                this.error = `Failed to ${this.isEditMode ? 'update' : 'create'} property`;
                this.loading = false;
                console.error(err);
            }
        });
    }

    cancel(): void {
        this.router.navigate(['/products/properties']);
    }
}
