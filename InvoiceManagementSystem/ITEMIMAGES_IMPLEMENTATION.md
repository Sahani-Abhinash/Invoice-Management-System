# ItemImages Upload and Display Implementation

## Overview
This document outlines the complete implementation of ItemImages upload and display functionality for the Invoice Management System.

## Architecture

### Backend (C#/.NET)

#### 1. Domain Layer - Updated ItemImage Entity
- **File**: `IMS.Domain/Entities/Product/ItemImage.cs`
- **Properties**:
  - `Id`: Unique identifier (Guid)
  - `ItemId`: Foreign key to Item
  - `Item`: Navigation property to Item entity
  - `ImageUrl`: Relative path to stored image
  - `IsMain`: Boolean flag to mark primary image

#### 2. Application Layer - DTOs

**ItemImageDto** - `IMS.Application/DTOs/Product/ItemImageDto.cs`
```csharp
public class ItemImageDto
{
    public Guid Id { get; set; }
    public Guid ItemId { get; set; }
    public string ImageUrl { get; set; }
    public bool IsMain { get; set; }
}
```

**CreateItemImageDto** - `IMS.Application/DTOs/Product/CreateItemImageDto.cs`
- Used for creating and updating images
- Properties: ItemId, ImageUrl, IsMain

#### 3. Infrastructure Layer - Services

**IItemImageService** Interface
- `GetAllAsync()`: Retrieve all images
- `GetByIdAsync(id)`: Get image by ID
- `GetByItemIdAsync(itemId)`: Get all images for an item
- `CreateAsync(dto)`: Create new image record
- `UpdateAsync(id, dto)`: Update image details
- `DeleteAsync(id)`: Soft delete image

**ItemImageService** Implementation
- Located at: `IMS.Infrastructure/Services/Product/ItemImageService.cs`
- Handles database operations and mapping to DTOs

#### 4. API Controller - ItemController

**New Endpoints**:

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/item/{id}/images` | Get all images for an item |
| POST | `/api/item/{id}/images` | Upload image (multipart/form-data) |
| GET | `/api/item/{itemId}/images/{imageId}` | Get specific image |
| PUT | `/api/item/{itemId}/images/{imageId}/set-main` | Set image as main |
| DELETE | `/api/item/{itemId}/images/{imageId}` | Delete image |

**Upload Endpoint Details**:
```csharp
[HttpPost("{id}/images")]
public async Task<IActionResult> UploadImage(Guid id, [FromForm] IFormFile file, [FromForm] bool isMain = false)
```
- Parameters:
  - `id`: Item ID (route)
  - `file`: Image file (form data)
  - `isMain`: Mark as primary image (optional)
- Validations:
  - File type checking (jpg, jpeg, png, gif, webp)
  - File size validation
  - Directory creation with item-specific folders
- Storage: `/wwwroot/uploads/items/{itemId}/{filename}`

### Frontend (Angular)

#### 1. Service Layer - ItemService
**File**: `ims.ClientApp/src/app/product/items/item.service.ts`

**New Interfaces**:
```typescript
export interface ItemImage {
    id: string;
    itemId: string;
    imageUrl: string;
    isMain: boolean;
}
```

**New Methods**:
```typescript
getItemImages(itemId: string): Observable<ItemImage[]>
uploadImage(itemId: string, file: File, isMain?: boolean): Observable<ItemImage>
getImage(itemId: string, imageId: string): Observable<ItemImage>
setMainImage(itemId: string, imageId: string): Observable<ItemImage>
deleteImage(itemId: string, imageId: string): Observable<void>
```

#### 2. Reusable Image Gallery Component
**Location**: `ims.ClientApp/src/app/shared/components/image-gallery/`

**Files**:
- `image-gallery.component.ts`: Component logic
- `image-gallery.component.html`: Template
- `image-gallery.component.css`: Styles

**Features**:
- Responsive grid layout (configurable columns)
- Image preview modal/lightbox
- Main image badge
- Hover overlay effects
- Delete confirmation dialog
- Readonly mode for display-only galleries

**Input Properties**:
```typescript
@Input() images: GalleryImage[];
@Input() readonly: boolean;
@Input() columns: number;
@Input() showMainBadge: boolean;
@Input() allowSetMain: boolean;
@Input() allowDelete: boolean;
```

**Output Events**:
```typescript
@Output() mainImageSelected = new EventEmitter<string>();
@Output() imageDeleted = new EventEmitter<string>();
```

#### 3. Item Form Component - Enhanced
**Files**:
- `item-form.component.ts`: Component logic with image handling
- `item-form.component.html`: Updated template with gallery

**Functionality**:
- Image upload form (only visible in edit mode)
- File selection with validation
- Upload progress indicator
- Success/error messages
- Image gallery display
- Set main image functionality
- Image deletion with confirmation

**Key Methods**:
- `loadImages()`: Fetch item images on load
- `onFileSelected(event)`: Handle file selection
- `uploadImage()`: Send file to backend
- `setMainImage(imageId)`: Mark image as primary
- `deleteImage(imageId)`: Remove image with confirmation

### Database

#### ItemImage Table Structure
```sql
CREATE TABLE ItemImages (
    Id UNIQUEIDENTIFIER PRIMARY KEY,
    ItemId UNIQUEIDENTIFIER NOT NULL FOREIGN KEY REFERENCES Items(Id),
    ImageUrl NVARCHAR(MAX) NOT NULL,
    IsMain BIT NOT NULL DEFAULT 0,
    IsActive BIT NOT NULL DEFAULT 1,
    IsDeleted BIT NOT NULL DEFAULT 0,
    CreatedOn DATETIME2 NOT NULL,
    UpdatedOn DATETIME2 NOT NULL
)
```

## File Organization

```
Backend:
├── IMS.Domain/
│   └── Entities/Product/
│       └── ItemImage.cs (Updated)
├── IMS.Application/
│   └── DTOs/Product/
│       ├── ItemImageDto.cs (Updated with ItemId)
│       └── CreateItemImageDto.cs
├── IMS.Infrastructure/
│   └── Services/Product/
│       └── ItemImageService.cs (Existing)
└── IMS.API/
    └── Controllers/
        └── ItemController.cs (Enhanced with image endpoints)

Frontend:
├── ims.ClientApp/src/app/
│   ├── product/items/
│   │   ├── item-form/
│   │   │   ├── item-form.component.ts (Enhanced)
│   │   │   └── item-form.component.html (Updated)
│   │   └── item.service.ts (Enhanced with image methods)
│   └── shared/components/
│       └── image-gallery/
│           ├── image-gallery.component.ts
│           ├── image-gallery.component.html
│           └── image-gallery.component.css
```

## Workflow

### Upload Workflow:
1. User navigates to Item Edit form
2. Form loads item details and existing images
3. User selects image file from file picker
4. User clicks "Upload Image" button
5. Frontend sends multipart/form-data to backend
6. Backend validates file type and saves to disk
7. Backend creates database record with image URL
8. Frontend receives response and updates gallery
9. Gallery refreshes with new image

### Set Main Image Workflow:
1. User clicks "Set Main" button on image
2. Frontend calls `setMainImage` endpoint
3. Backend unsets all other main images for item
4. Backend sets selected image as main
5. Frontend updates local image array
6. Gallery re-renders with updated main badge

### Delete Image Workflow:
1. User clicks "Delete" button on image
2. Confirmation dialog appears
3. If confirmed, frontend calls `deleteImage` endpoint
4. Backend deletes physical file from disk
5. Backend soft-deletes database record
6. Frontend removes image from local array
7. Gallery re-renders without deleted image

## Usage Example

### In Components:

```typescript
import { ImageGalleryComponent } from '../shared/components/image-gallery/image-gallery.component';

@Component({
  imports: [ImageGalleryComponent],
  template: `
    <app-image-gallery
      [images]="itemImages"
      [columns]="3"
      [readonly]="false"
      [allowSetMain]="true"
      [allowDelete]="true"
      (mainImageSelected)="onSetMain($event)"
      (imageDeleted)="onDelete($event)">
    </app-image-gallery>
  `
})
export class MyComponent {
  itemImages: ItemImage[] = [];
  
  onSetMain(imageId: string) {
    // Handle set main
  }
  
  onDelete(imageId: string) {
    // Handle delete
  }
}
```

## API Examples

### Upload Image
```bash
curl -X POST "https://localhost:5001/api/item/550e8400-e29b-41d4-a716-446655440000/images?isMain=true" \
  -F "file=@image.jpg"
```

### Get Images
```bash
curl -X GET "https://localhost:5001/api/item/550e8400-e29b-41d4-a716-446655440000/images"
```

### Set Main Image
```bash
curl -X PUT "https://localhost:5001/api/item/550e8400-e29b-41d4-a716-446655440000/images/650e8400-e29b-41d4-a716-446655440000/set-main"
```

### Delete Image
```bash
curl -X DELETE "https://localhost:5001/api/item/550e8400-e29b-41d4-a716-446655440000/images/650e8400-e29b-41d4-a716-446655440000"
```

## Configuration Requirements

### Backend Configuration
- Ensure `wwwroot` directory exists in IMS.API
- Create `uploads/items` subdirectory structure (auto-created on first upload)
- File upload size limits (configure in `appsettings.json` or Program.cs):

```csharp
services.Configure<FormOptions>(options =>
{
    options.MultipartBodyLengthLimit = 52428800; // 50 MB
    options.ValueLengthLimit = 52428800;
    options.MultipartHeadersLengthLimit = 2000;
});
```

### Frontend Configuration
- Ensure Angular HttpClient is provided in main.ts or component
- Image gallery component is standalone, can be imported directly

## Supported Image Formats
- JPEG (.jpg, .jpeg)
- PNG (.png)
- GIF (.gif)
- WebP (.webp)

## Features

✅ Multiple images per item
✅ Set primary/main image
✅ Image preview in modal lightbox
✅ Responsive gallery grid
✅ Drag-and-drop ready (can be extended)
✅ Image deletion with confirmation
✅ File type validation
✅ Success/error notifications
✅ Readonly gallery mode for display-only scenarios
✅ Soft-delete support (database level)
✅ Image storage organized by item ID

## Future Enhancements

- [ ] Drag-and-drop file upload
- [ ] Image cropping/editing
- [ ] Image compression before upload
- [ ] Bulk upload functionality
- [ ] Image sorting/reordering
- [ ] Thumbnail generation
- [ ] CDN integration for image serving
- [ ] Image metadata extraction (EXIF)

## Testing

### Backend Testing Checklist:
- [ ] Upload image with valid file type
- [ ] Reject invalid file types
- [ ] Create ItemImage record correctly
- [ ] Set image as main (unset others)
- [ ] Delete image (physical file + database)
- [ ] Get images by item ID
- [ ] Handle concurrent uploads

### Frontend Testing Checklist:
- [ ] File picker works
- [ ] Upload button disabled when no file selected
- [ ] Progress spinner shows during upload
- [ ] Success message displays after upload
- [ ] Images load in gallery
- [ ] Main badge shows correct image
- [ ] Set main button works
- [ ] Delete confirmation appears
- [ ] Gallery responsive on mobile
- [ ] Preview modal opens and closes

## Troubleshooting

### Images not uploading:
1. Check file type (must be jpg, png, gif, webp)
2. Verify file size (check FormOptions limit)
3. Ensure `wwwroot/uploads/items` directory writable
4. Check browser console for errors
5. Verify API response in Network tab

### Images not displaying:
1. Check ImageUrl is correct path
2. Verify images physically exist in `wwwroot/uploads/items/{itemId}/`
3. Check CORS configuration if cross-domain
4. Verify file permissions

### Main image not updating:
1. Check API endpoint is called correctly
2. Verify response received successfully
3. Check browser console for errors
4. Ensure item ID is valid

## Summary

This implementation provides a complete ItemImages management system with:
- Backend API for CRUD operations on images
- Secure file upload with validation
- Responsive frontend gallery component
- Full integration into item management workflow
- Reusable gallery component for other modules
