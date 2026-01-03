import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { PriceListService, CreatePriceListDto } from '../price-list.service';

@Component({
    selector: 'app-price-list-form',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, RouterLink],
    templateUrl: './price-list-form.component.html',
    styleUrls: []
})
export class PriceListFormComponent implements OnInit {
    form: FormGroup;
    id: string | null = null;
    isEditMode = false;
    private cdr = inject(ChangeDetectorRef);

    constructor(
        private fb: FormBuilder,
        private route: ActivatedRoute,
        private router: Router,
        private priceListService: PriceListService
    ) {
        this.form = this.fb.group({
            name: ['', Validators.required],
            isDefault: [false]
        });
    }

    ngOnInit(): void {
        this.id = this.route.snapshot.paramMap.get('id');
        this.isEditMode = !!this.id;

        if (this.isEditMode && this.id) {
            this.priceListService.getById(this.id).subscribe(data => {
                this.form.patchValue({
                    name: data.name,
                    isDefault: data.isDefault
                });
            });
        }
    }

    save() {
        if (this.form.invalid) return;

        const dto: CreatePriceListDto = this.form.value;

        if (this.isEditMode && this.id) {
            this.priceListService.update(this.id, dto).subscribe(() => {
                this.router.navigate(['/products/pricelists']);
            });
        } else {
            this.priceListService.create(dto).subscribe(() => {
                this.router.navigate(['/products/pricelists']);
            });
        }
    }
}
