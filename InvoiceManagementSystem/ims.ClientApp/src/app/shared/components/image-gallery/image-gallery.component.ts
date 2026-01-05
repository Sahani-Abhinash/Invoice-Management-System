import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface GalleryImage {
    id: string;
    imageUrl: string;
    isMain?: boolean;
    altText?: string;
}

@Component({
    selector: 'app-image-gallery',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './image-gallery.component.html',
    styleUrls: ['./image-gallery.component.css'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ImageGalleryComponent {
    @Input() images: GalleryImage[] = [];
    @Input() readonly: boolean = false;
    @Input() columns: number = 3;
    @Input() showMainBadge: boolean = true;
    @Input() allowSetMain: boolean = true;
    @Input() allowDelete: boolean = true;

    @Output() mainImageSelected = new EventEmitter<string>();
    @Output() imageDeleted = new EventEmitter<string>();

    selectedImage: GalleryImage | null = null;

    get colClass(): string {
        const colMap: { [key: number]: string } = {
            2: 'col-lg-6 col-md-6',
            3: 'col-lg-4 col-md-6',
            4: 'col-lg-3 col-md-6',
            6: 'col-lg-2 col-md-4'
        };
        return colMap[this.columns] || 'col-lg-4 col-md-6';
    }

    setMainImage(image: GalleryImage) {
        if (!this.readonly && this.allowSetMain && !image.isMain) {
            this.mainImageSelected.emit(image.id);
        }
    }

    deleteImage(image: GalleryImage) {
        if (!this.readonly && this.allowDelete) {
            if (confirm('Are you sure you want to delete this image?')) {
                this.imageDeleted.emit(image.id);
            }
        }
    }

    openImageModal(image: GalleryImage) {
        this.selectedImage = image;
    }

    closeImageModal() {
        this.selectedImage = null;
    }
}
