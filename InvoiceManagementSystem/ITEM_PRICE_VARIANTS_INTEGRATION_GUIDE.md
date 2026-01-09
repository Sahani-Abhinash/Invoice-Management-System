# Item Price Variants - Integration Guide

## Angular Routes Setup

Add these routes to your product module routes:

```typescript
// In ims.ClientApp/src/app/product/product.routes.ts

import { VariantSelectorComponent } from './item-price-variant/variant-selector/variant-selector.component';
import { VariantManagerComponent } from './item-price-variant/variant-manager/variant-manager.component';

export const PRODUCT_ROUTES: Routes = [
    { path: '', redirectTo: 'items', pathMatch: 'full' },
    { path: 'items', component: ItemListComponent },
    { path: 'items/create', component: ItemFormComponent },
    { path: 'items/edit/:id', component: ItemFormComponent },
    
    { path: 'prices', component: ItemPriceListComponent },
    { path: 'prices/create', component: ItemPriceFormComponent },
    { path: 'prices/edit/:id', component: ItemPriceFormComponent },
    
    // NEW: Variant routes
    { path: 'variants/selector/:priceId', component: VariantSelectorComponent },
    { path: 'variants/manager/:priceId', component: VariantManagerComponent },
    
    { path: 'pricelists', component: PriceListListComponent },
    { path: 'pricelists/create', component: PriceListFormComponent },
    { path: 'pricelists/edit/:id', component: PriceListFormComponent },
    
    { path: 'properties', component: ProductPropertyListComponent },
    { path: 'properties/create', component: ProductPropertyFormComponent },
    { path: 'properties/edit/:id', component: ProductPropertyFormComponent },
    
    { path: 'attributes', component: PropertyAttributeListComponent },
    { path: 'attributes/create', component: PropertyAttributeFormComponent },
];
```

---

## Integration Examples

### 1. In Item Price Form (Admin)

Add variant manager to item price edit page:

```typescript
// item-price-form.component.ts
import { VariantManagerComponent } from '../item-price-variant/variant-manager/variant-manager.component';

@Component({
    selector: 'app-item-price-form',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        VariantManagerComponent  // Add this
    ],
    templateUrl: './item-price-form.component.html',
    styleUrl: './item-price-form.component.css'
})
export class ItemPriceFormComponent implements OnInit {
    itemPriceId: string = '';
    // ... existing code
}
```

```html
<!-- item-price-form.component.html -->

<div class="form-container">
    <h3>Item Price Form</h3>
    
    <!-- Existing price form -->
    <form [formGroup]="form" (ngSubmit)="onSubmit()">
        <!-- ... existing form fields ... -->
    </form>
</div>

<!-- Add variant manager below the form -->
<div *ngIf="itemPriceId" class="variants-section mt-5">
    <app-variant-manager [itemPriceId]="itemPriceId"></app-variant-manager>
</div>
```

### 2. In Shopping Cart / Product Page (Customer)

```typescript
// shopping-cart.component.ts
import { VariantSelectorComponent } from '../item-price-variant/variant-selector/variant-selector.component';

@Component({
    selector: 'app-shopping-cart',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        VariantSelectorComponent  // Add this
    ],
    templateUrl: './shopping-cart.component.html'
})
export class ShoppingCartComponent implements OnInit {
    selectedProduct: any;
    selectedVariant: ItemPriceVariant | null = null;
    
    onVariantSelected(variant: ItemPriceVariant): void {
        this.selectedVariant = variant;
        console.log('Customer selected:', variant.displayLabel);
        // Add to cart with variant information
    }
    
    onVariantCleared(): void {
        this.selectedVariant = null;
    }
    
    addToCart(): void {
        if (!this.selectedVariant) {
            alert('Please select a variant (color, size, etc.)');
            return;
        }
        
        // Add to cart with variant details
        this.cartService.addItem({
            itemPriceId: this.selectedProduct.id,
            variantId: this.selectedVariant.id,
            variantName: this.selectedVariant.displayLabel,
            quantity: this.quantity,
            price: this.selectedVariant.price
        });
    }
}
```

```html
<!-- shopping-cart.component.html -->

<div class="product-detail">
    <h2>{{ selectedProduct.name }}</h2>
    <p class="price">Price: {{ selectedProduct.price | currency }}</p>
    
    <!-- Variant selector -->
    <app-variant-selector 
        [itemPriceId]="selectedProduct.id"
        (variantSelected)="onVariantSelected($event)"
        (variantCleared)="onVariantCleared()">
    </app-variant-selector>
    
    <!-- Add to cart button -->
    <div class="cart-actions mt-4">
        <button class="btn btn-primary" 
            (click)="addToCart()"
            [disabled]="!selectedVariant">
            Add to Cart
        </button>
    </div>
</div>
```

### 3. In Item Image Gallery (Product Display)

```typescript
// product-gallery.component.ts
import { VariantSelectorComponent } from '../item-price-variant/variant-selector/variant-selector.component';
import { ItemPriceVariantService } from '../item-price-variant/item-price-variant.service';

@Component({
    selector: 'app-product-gallery',
    standalone: true,
    imports: [
        CommonModule,
        VariantSelectorComponent
    ],
    templateUrl: './product-gallery.component.html'
})
export class ProductGalleryComponent implements OnInit {
    itemPriceId: string = '';
    selectedVariant: ItemPriceVariant | null = null;
    
    constructor(private variantService: ItemPriceVariantService) { }
    
    ngOnInit(): void {
        // Load variants when component initializes
        this.loadVariantImages();
    }
    
    onVariantSelected(variant: ItemPriceVariant): void {
        this.selectedVariant = variant;
        this.loadVariantImages(); // Load images for selected variant
    }
    
    loadVariantImages(): void {
        if (this.selectedVariant) {
            // Load images specific to this variant
            // e.g., show Red T-Shirt images when Red is selected
        }
    }
}
```

---

## Cart Service Integration

Update your cart service to track variants:

```typescript
// cart.service.ts
import { ItemPriceVariant } from './models/product-property.model';

export interface CartItem {
    itemPriceId: string;
    variantId?: string;              // NEW: Track selected variant
    variantName?: string;            // NEW: For display
    quantity: number;
    price: number;
}

export class CartService {
    addItem(item: CartItem): void {
        // Check if exact same item + variant already in cart
        const existingItem = this.items.find(i => 
            i.itemPriceId === item.itemPriceId && 
            i.variantId === item.variantId
        );
        
        if (existingItem) {
            existingItem.quantity += item.quantity;
        } else {
            this.items.push(item);
        }
        
        this.saveCart();
    }
}
```

---

## Order/Checkout Integration

When creating an order, include variant information:

```typescript
// order.service.ts
interface OrderLineItem {
    itemPriceId: string;
    variantId: string;              // NEW: Record which variant was ordered
    variantName: string;            // NEW: Display name (Color: Red, Size: M)
    quantity: number;
    unitPrice: number;
    totalPrice: number;
}

export class OrderService {
    createOrder(cartItems: CartItem[]): Observable<Order> {
        const lineItems: OrderLineItem[] = cartItems.map(item => ({
            itemPriceId: item.itemPriceId,
            variantId: item.variantId || '',
            variantName: item.variantName || 'No variant',
            quantity: item.quantity,
            unitPrice: item.price,
            totalPrice: item.price * item.quantity
        }));
        
        return this.http.post('/api/orders', { lineItems });
    }
}
```

---

## Inventory Tracking (Optional Enhancement)

Track variant stock after purchase:

```typescript
// inventory-management.service.ts
export class InventoryService {
    reduceVariantStock(variantId: string, quantity: number): Observable<boolean> {
        return this.http.patch<boolean>(
            `/api/itempricevariants/${variantId}/stock`,
            { reduceBy: quantity }
        );
    }
    
    getVariantStock(variantId: string): Observable<number> {
        return this.http.get<number>(
            `/api/itempricevariants/${variantId}/stock`
        );
    }
}
```

---

## Search & Filter by Variants (Optional)

Allow customers to filter products by variant values:

```typescript
// product-search.component.ts
export class ProductSearchComponent {
    colors: PropertyAttribute[] = [];
    sizes: PropertyAttribute[] = [];
    selectedColors: Set<string> = new Set();
    selectedSizes: Set<string> = new Set();
    
    searchByVariants(): void {
        // Build filter query
        const colorIds = Array.from(this.selectedColors);
        const sizeIds = Array.from(this.selectedSizes);
        
        // Get products with selected variants
        this.variantService.getByPropertyAttributeId(colorIds[0]).subscribe(
            (variants) => {
                const productIds = variants.map(v => v.itemPriceId);
                this.loadProducts(productIds);
            }
        );
    }
}
```

---

## Database Queries (Reference)

### Get all variants for a product
```sql
SELECT * FROM ItemPriceVariants 
WHERE ItemPriceId = @itemPriceId AND IsDeleted = 0
ORDER BY DisplayOrder
```

### Get products available in specific size
```sql
SELECT DISTINCT ipv.ItemPriceId
FROM ItemPriceVariants ipv
JOIN PropertyAttributes pa ON ipv.PropertyAttributeId = pa.Id
JOIN ProductProperties pp ON pa.ProductPropertyId = pp.Id
WHERE pp.Name = 'Size' AND pa.Value = 'M'
```

### Check stock for variant
```sql
SELECT StockQuantity 
FROM ItemPriceVariants 
WHERE Id = @variantId AND IsDeleted = 0
```

---

## Testing Checklist

- [ ] Create variant through admin (VariantManager)
- [ ] See variant in variant selector (VariantSelector)
- [ ] Select variant in shopping cart
- [ ] Verify API calls in Network tab (F12)
- [ ] Add to cart with variant
- [ ] Check cart contains variant info
- [ ] Create order with variant details
- [ ] Verify database has variant records

---

## Performance Considerations

1. **Cache variants**: If displaying same product multiple times, cache the variants
2. **Pagination**: If product has many variants, implement pagination
3. **Lazy loading**: Load variants only when product is expanded
4. **Database indexes**: Already created on ItemPriceId and PropertyAttributeId

---

## Migration Path

If you have existing products without variants:

1. Create properties & attributes (Color, Size)
2. Use migration script to generate variants:
   ```sql
   -- Create variants for all existing products
   INSERT INTO ItemPriceVariants (Id, ItemPriceId, PropertyAttributeId, IsDeleted)
   SELECT 
       NEWID(),
       ip.Id,
       pa.Id,
       0
   FROM ItemPrices ip
   CROSS JOIN PropertyAttributes pa
   WHERE pa.ProductPropertyId IN (SELECT Id FROM ProductProperties WHERE Name IN ('Color', 'Size'))
   ```

3. Update frontend to use VariantSelector

---

## Summary

The Item Variant system is now fully integrated and ready to use:
- ✅ Backend: Complete API with validation
- ✅ Frontend: Components for admin and customer
- ✅ Integration: Ready to embed in your existing pages
- ✅ Documentation: Examples for all use cases

**Start with**: Creating a product variant through the admin panel, then integrate VariantSelector in your shopping cart!
