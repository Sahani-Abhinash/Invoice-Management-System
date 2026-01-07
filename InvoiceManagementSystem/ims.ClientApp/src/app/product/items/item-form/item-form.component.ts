import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ItemService, CreateItemDto, UnitOfMeasure, ItemImage } from '../item.service';
import { ImageGalleryComponent } from '../../../shared/components/image-gallery/image-gallery.component';
import { ItemPropertyAssignmentComponent } from '../../item-property-assignment/item-property-assignment.component';

@Component({
    selector: 'app-item-form',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, RouterLink, ImageGalleryComponent, ItemPropertyAssignmentComponent],
    templateUrl: './item-form.component.html',
    styleUrls: []
})
export class ItemFormComponent implements OnInit {
    form: FormGroup;
    id: string | null = null;
    uoms: UnitOfMeasure[] = [];
    isEditMode = false;
    images: ItemImage[] = [];
    selectedFile: File | null = null;
    isUploadingImage = false;
    uploadMessage = '';
    uploadError = '';
    private cdr = inject(ChangeDetectorRef);

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

                this.loadImages();
            });
        }
    }

    loadUoMs() {
        this.itemService.getUnitOfMeasures().subscribe(data => {
            this.uoms = data;
            this.cdr.detectChanges();
        });
    }

    loadImages() {
        if (!this.id) return;
        this.itemService.getItemImages(this.id).subscribe({
            next: (images) => {
                this.images = images;
                this.cdr.detectChanges();
            },
            error: (err) => {
                console.error('Error loading images:', err);
            }
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
            this.itemService.create(dto).subscribe((created) => {
                this.id = created.id;
                this.isEditMode = true;
                this.cdr.detectChanges();
            });
        }
    }

    onFileSelected(event: any) {
        const file = event.target.files[0];
        if (file) {
            this.selectedFile = file;
        }
    }

    uploadImage() {
        if (!this.selectedFile || !this.id) {
            this.uploadError = 'Please select a file first';
            return;
        }

        const isMain = this.images.length === 0; // First image is main

        this.isUploadingImage = true;
        this.uploadError = '';
        this.uploadMessage = '';

        this.itemService.uploadImage(this.id, this.selectedFile, isMain).subscribe({
            next: (image) => {
                // Clone array to trigger OnPush change detection in gallery
                this.images = [...this.images, image];
                this.selectedFile = null;
                this.isUploadingImage = false;
                this.uploadMessage = 'Image uploaded successfully';
                const input = document.getElementById('imageInput') as HTMLInputElement;
                if (input) input.value = '';
                setTimeout(() => {
                    this.uploadMessage = '';
                }, 3000);
                this.cdr.detectChanges();
            },
            error: (err) => {
                this.isUploadingImage = false;
                this.uploadError = err.error?.message || 'Error uploading image';
                this.cdr.detectChanges();
            }
        });
    }

    setMainImage(imageId: string) {
        if (!this.id) return;
        const image = this.images.find(img => img.id === imageId);
        if (!image) return;

        this.itemService.setMainImage(this.id, image).subscribe({
            next: () => {
                this.images = this.images.map(img => ({ ...img, isMain: img.id === imageId }));
                this.cdr.detectChanges();
            },
            error: (err) => {
                console.error('Error setting main image:', err);
            }
        });
    }

    deleteImage(imageId: string) {
        if (!this.id) return;

        this.itemService.deleteImage(this.id, imageId).subscribe({
            next: () => {
                this.images = this.images.filter(img => img.id !== imageId);
                this.cdr.detectChanges();
            },
            error: (err) => {
                console.error('Error deleting image:', err);
            }
        });
    }
}
