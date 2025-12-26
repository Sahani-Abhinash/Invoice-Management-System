import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ItemService, CreateItemDto, UnitOfMeasure } from '../item.service';

@Component({
    selector: 'app-item-form',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, RouterLink],
    templateUrl: './item-form.component.html',
    styleUrls: []
})
export class ItemFormComponent implements OnInit {
    form: FormGroup;
    id: string | null = null;
    uoms: UnitOfMeasure[] = [];
    isEditMode = false;

    constructor(
        private fb: FormBuilder,
        private route: ActivatedRoute,
        private router: Router,
        private itemService: ItemService
    ) {
        this.form = this.fb.group({
            name: ['', Validators.required],
            sku: ['', Validators.required],
            unitOfMeasureId: ['', Validators.required]
        });
    }

    ngOnInit(): void {
        this.id = this.route.snapshot.paramMap.get('id');
        this.isEditMode = !!this.id;

        this.loadUoMs();

        if (this.isEditMode && this.id) {
            this.itemService.getById(this.id).subscribe(data => {
                const anyData = data as any;
                const name = anyData.name || anyData.Name;
                const sku = anyData.sku || anyData.SKU || anyData.Sku;
                const uomId = anyData.unitOfMeasureId || anyData.UnitOfMeasureId || anyData.unitOfMeasure?.id || anyData.UnitOfMeasure?.Id;

                this.form.patchValue({
                    name: name,
                    sku: sku,
                    unitOfMeasureId: uomId
                });
            });
        }
    }

    loadUoMs() {
        this.itemService.getUnitOfMeasures().subscribe(data => {
            this.uoms = data;
        });
    }

    save() {
        if (this.form.invalid) return;

        const dto: CreateItemDto = this.form.value;

        if (this.isEditMode && this.id) {
            this.itemService.update(this.id, dto).subscribe(() => {
                this.router.navigate(['/products/items']);
            });
        } else {
            this.itemService.create(dto).subscribe(() => {
                this.router.navigate(['/products/items']);
            });
        }
    }
}
