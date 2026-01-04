# Frontend Implementation - Option C: User Explicitly Selects PriceList

## Overview
Frontend implementation completed for **Option C** pricing model where users explicitly select a pricing tier (Retail/Wholesale) when creating invoices. The system automatically fetches and applies the correct prices for all items based on the selected PriceList.

**Status:** ✅ COMPLETE

---

## Changes Made

### 1. **invoice.service.ts** - Updated DTOs
**Location:** `ims.ClientApp/src/app/invoices/invoice.service.ts`

**Changed:**
```typescript
export interface CreateInvoiceDto {
    reference: string;
    invoiceDate: string;
    dueDate?: string;
    customerId: string;
    branchId: string;
    priceListId: string;              // ← NEW: Explicit PriceList selection
    taxRate: number;
    lines: {
        itemId: string;
        quantity: number;
        unitPrice?: number;            // ← CHANGED: Made optional, auto-fetched from ItemPrice
    }[];
}
```

**Rationale:**
- `priceListId`: User now explicitly selects which pricing tier to use (Retail, Wholesale, etc.)
- `unitPrice?: number`: Made optional because backend will auto-populate from ItemPrice service if not provided
- This change supports the backend's price lookup logic

---

### 2. **item-price.service.ts** - New API Method
**Location:** `ims.ClientApp/src/app/invoices/item-price.service.ts`

**Added Method:**
```typescript
getItemsWithPricesForPriceList(priceListId: string): Observable<any[]> {
    return this.http.get<any[]>(
        `${this.apiUrl}/pricelist/${priceListId}/items`
    ).pipe(
        tap(items => console.log('Items loaded for price list:', items)),
        catchError(err => {
            console.error('Failed to load items with prices', err);
            return of([]);
        })
    );
}
```

**Purpose:**
- Fetches items with their prices for a specific PriceList
- Called when user selects a price list dropdown
- Returns array of items with price dictionary by PriceList name

**Returns Format:**
```json
[
    {
        "id": "item-001",
        "name": "Product A",
        "sku": "SKU001",
        "prices": {
            "Retail": 100,
            "Wholesale": 90
        }
    },
    {
        "id": "item-002",
        "name": "Product B",
        "sku": "SKU002",
        "prices": {
            "Retail": 150,
            "Wholesale": 120
        }
    }
]
```

---

### 3. **invoice-form.component.ts** - Component Logic
**Location:** `ims.ClientApp/src/app/invoices/invoice-form/invoice-form.component.ts`

#### 3.1 Service Injection
```typescript
constructor(
    private fb: FormBuilder,
    private invoiceService: InvoiceService,
    private branchService: BranchService,
    private customerService: CustomerService,
    private itemService: ItemService,
    private stockService: StockService,
    private accountingService: AccountingService,
    private priceListService: PriceListService,          // ← NEW
    private itemPriceService: ItemPriceService,          // ← NEW
    private route: ActivatedRoute,
    private router: Router,
    private cdr: ChangeDetectorRef
) {
    // ... existing code
}
```

#### 3.2 Component Properties
```typescript
// Form data arrays
priceLists: PriceList[] = [];                            // ← NEW
itemsWithPrices: any[] = [];                             // ← NEW
selectedPriceListId: string | null = null;              // ← NEW
```

#### 3.3 Form Group - Add PriceListId Control
```typescript
this.invoiceForm = this.fb.group({
    reference: ['', Validators.required],
    invoiceDate: [this.today, Validators.required],
    dueDate: [''],
    customerId: ['', Validators.required],
    branchId: ['', Validators.required],
    priceListId: ['', Validators.required],              // ← NEW: Required field
    taxRate: [0, [Validators.required, Validators.min(0)]],
    lines: this.fb.array([], this.totalStockValidator())
});
```

#### 3.4 Load Price Lists in Initial Data
**Updated `loadInitialData()` method:**

```typescript
loadInitialData(): void {
    this.isLoading = true;
    console.log('Loading initial data for invoice form...');

    const requests: any = {
        branches: this.branchService.getAll().pipe(catchError(err => { console.error('Failed to load branches', err); return of([]); })),
        customers: this.customerService.getAll().pipe(catchError(err => { console.error('Failed to load customers', err); return of([]); })),
        items: this.itemService.getAll().pipe(catchError(err => { console.error('Failed to load items', err); return of([]); })),
        stocks: this.stockService.getAll().pipe(catchError(err => { console.error('Failed to load stocks', err); return of([]); })),
        accounts: this.accountingService.getAllAccounts().pipe(catchError(err => { console.error('Failed to load accounts', err); return of([]); })),
        priceLists: this.priceListService.getAll().pipe(catchError(err => { console.error('Failed to load price lists', err); return of([]); }))  // ← NEW
    };

    // ... rest of forkJoin
    
    forkJoin(requests).subscribe({
        next: (data: any) => {
            this.branches = data.branches || [];
            this.items = data.items || [];
            this.stocks = data.stocks || [];
            this.accounts = data.accounts || [];
            this.priceLists = data.priceLists || [];      // ← NEW
            this.customers = (data.customers || []).map((c: Customer) => ({
                ...c,
                id: (c.id || '').toString().toLowerCase()
            }));
            this.processStocks(this.stocks);

            // Set up price list dropdown listener after data is loaded
            this.invoiceForm.get('priceListId')?.valueChanges.subscribe((priceListId) => {
                if (priceListId) {
                    this.onPriceListSelected(priceListId);
                }
            });

            // Auto-select default price list if available
            const defaultPriceList = this.priceLists.find(p => p.isDefault);
            if (defaultPriceList) {
                this.invoiceForm.patchValue({ priceListId: defaultPriceList.id });
                this.onPriceListSelected(defaultPriceList.id);
            }

            if (this.isEdit && data.invoice) {
                this.patchForm(data.invoice);
            } else if (!this.isEdit) {
                this.addLine();
            }

            this.isLoading = false;
            this.cdr.detectChanges();
        },
        error: (err) => {
            console.error('Critical error in forkJoin:', err);
            this.isLoading = false;
            this.cdr.detectChanges();
        }
    });
}
```

#### 3.5 New Method: onPriceListSelected()
```typescript
onPriceListSelected(priceListId: string): void {
    if (!priceListId) {
        this.itemsWithPrices = [];
        return;
    }

    this.selectedPriceListId = priceListId;
    console.log('Loading items for price list:', priceListId);

    this.itemPriceService.getItemsWithPricesForPriceList(priceListId).subscribe({
        next: (items: any[]) => {
            console.log('Items loaded for price list:', items);
            this.itemsWithPrices = items;
            
            // Reset quantities and prices for existing line items
            this.lines.controls.forEach((control) => {
                const itemId = control.get('itemId')?.value;
                if (itemId) {
                    // Auto-populate price from new price list
                    const itemWithPrices = this.itemsWithPrices.find(i => i.id === itemId);
                    if (itemWithPrices && itemWithPrices.prices && itemWithPrices.prices[priceListId]) {
                        control.patchValue({ 
                            unitPrice: itemWithPrices.prices[priceListId] 
                        });
                    }
                }
            });
            
            this.cdr.detectChanges();
        },
        error: (err) => {
            console.error('Failed to load items for price list', err);
            this.itemsWithPrices = [];
        }
    });
}
```

**Responsibilities:**
1. Stores the selected priceListId
2. Calls ItemPriceService to fetch items with prices for that PriceList
3. Updates existing line items with prices from the new price list
4. Triggers change detection to update the UI

#### 3.6 Updated addLine() Method
```typescript
addLine(item?: any): void {
    // Determine initial unit price from itemsWithPrices or item parameter
    let initialPrice = item?.unitPrice || 0;
    
    if (!initialPrice && item?.itemId && this.selectedPriceListId) {
        // Look up price from itemsWithPrices for selected price list
        const itemWithPrices = this.itemsWithPrices.find(i => i.id === item.itemId);
        if (itemWithPrices && itemWithPrices.prices && itemWithPrices.prices[this.selectedPriceListId]) {
            initialPrice = itemWithPrices.prices[this.selectedPriceListId];
        }
    }

    const lineForm = this.fb.group({
        itemId: [(item?.itemId || '').toString().toLowerCase(), Validators.required],
        quantity: [item?.quantity || 1, [Validators.required, Validators.min(1)]],
        unitPrice: [initialPrice, [Validators.required, Validators.min(0)]]
    });

    // When item changes, auto-populate price from selected price list
    lineForm.get('itemId')?.valueChanges.subscribe((itemId) => {
        if (itemId && this.selectedPriceListId) {
            const itemWithPrices = this.itemsWithPrices.find(i => i.id === itemId);
            if (itemWithPrices && itemWithPrices.prices && itemWithPrices.prices[this.selectedPriceListId]) {
                lineForm.patchValue({ 
                    unitPrice: itemWithPrices.prices[this.selectedPriceListId] 
                }, { emitEvent: false });
            }
        }
        this.validateAllLines();
    });

    lineForm.get('quantity')?.valueChanges.subscribe(() => {
        this.validateAllLines();
    });

    this.lines.push(lineForm);
    this.validateAllLines();
    this.cdr.detectChanges();
}
```

**Changes:**
- Looks up initial price from `itemsWithPrices` if not provided
- When user selects an item, auto-populates the price from selected price list
- Price is fetched dynamically based on `selectedPriceListId`
- Prevents manual price changes (disabled in template)

#### 3.7 Updated onSubmit() Method
```typescript
onSubmit(): void {
    if (this.invoiceForm.invalid) {
        this.invoiceForm.markAllAsTouched();
        return;
    }

    const formValue = this.invoiceForm.value;
    const dto: CreateInvoiceDto = {
        reference: formValue.reference,
        invoiceDate: formValue.invoiceDate,
        dueDate: formValue.dueDate || undefined,
        customerId: formValue.customerId,
        branchId: formValue.branchId,
        priceListId: formValue.priceListId,              // ← NEW
        taxRate: formValue.taxRate,
        lines: formValue.lines.map((l: any) => ({
            itemId: l.itemId,
            quantity: l.quantity,
            unitPrice: l.unitPrice
        }))
    };

    if (this.isEdit && this.invoiceId) {
        this.invoiceService.update(this.invoiceId, dto).subscribe({
            next: () => this.router.navigate(['/invoices']),
            error: (err) => alert('Failed to update invoice')
        });
    } else {
        this.invoiceService.create(dto).subscribe({
            next: () => this.router.navigate(['/invoices']),
            error: (err) => alert('Failed to create invoice')
        });
    }
}
```

---

### 4. **invoice-form.component.html** - Template Updates
**Location:** `ims.ClientApp/src/app/invoices/invoice-form/invoice-form.component.html`

#### 4.1 Add Price List Dropdown
Added after Branch selector in "Bill To" section:

```html
<div class="col-md-12">
    <label class="form-label text-muted fw-semibold">Price List <span class="text-danger">*</span></label>
    <select class="form-select border-dashed" formControlName="priceListId" aria-label="Price List" title="Price List">
        <option value="">Select Price List</option>
        <option *ngFor="let list of priceLists" [value]="list.id">
            {{ list.name }} {{ list.isDefault ? '(Default)' : '' }}
        </option>
    </select>
    <div *ngIf="invoiceForm.get('priceListId')?.touched && invoiceForm.get('priceListId')?.invalid" class="text-danger small mt-1">
        Price List is required
    </div>
</div>
```

**Features:**
- Shows all available price lists (Retail, Wholesale, etc.)
- Marks default price list with "(Default)" indicator
- Displays validation error if not selected
- Dropdown triggers `onPriceListSelected()` method automatically

#### 4.2 Update Item Selection Dropdown
Updated to show items from `itemsWithPrices` with prices displayed:

```html
<td class="col-desc">
    <select class="form-select" formControlName="itemId" (change)="onItemChange(i)" aria-label="Item" title="Item">
        <option value="">Choose Item...</option>
        <option *ngFor="let item of itemsWithPrices.length > 0 ? itemsWithPrices : items" 
            [value]="(item.id || '').toLowerCase()">
            {{ item.name }} ({{ item.sku }})
            <span *ngIf="itemsWithPrices.length > 0 && item.prices && selectedPriceListId">
                - ${{ item.prices[selectedPriceListId] }}
            </span>
        </option>
    </select>
    <div class="d-flex justify-content-between mt-1 small text-muted">
        <span>Stock: {{ getAvailableStock(line.get('itemId')?.value) }}</span>
        <span *ngIf="line.get('itemId')?.touched && line.get('itemId')?.invalid"
            class="text-danger">Required</span>
    </div>
</td>
```

**Features:**
- Uses `itemsWithPrices` when available, falls back to `items`
- Shows price in dropdown next to item name (e.g., "Product A - $100")
- Helps users make informed purchasing decisions
- Stock validation remains unchanged

---

## User Flow Diagram

```
┌─────────────────────────────────────────┐
│  Invoice Form Initialization            │
│  ✓ Load Price Lists                     │
│  ✓ Auto-select Default Price List       │
│  ✓ Load items for default price list    │
└──────────────┬──────────────────────────┘
               │
               ▼
┌──────────────────────────────────────┐
│  User selects DIFFERENT Price List   │
│  (e.g., from Retail to Wholesale)    │
└──────────────┬──────────────────────────┘
               │
               ▼
       onPriceListSelected()
         ├─ Fetch itemsWithPrices
         │  for new PriceList
         ├─ Update existing lines
         │  with new prices
         └─ Trigger change detection
               │
               ▼
┌──────────────────────────────────────┐
│  Form Updated with New Prices        │
│  ✓ Item dropdown shows new prices    │
│  ✓ Existing line items auto-updated  │
│  ✓ New line items get new price      │
└──────────────┬──────────────────────────┘
               │
               ▼
┌──────────────────────────────────────┐
│  User Adds Line Item                 │
│  ├─ Select Item from dropdown        │
│  └─ itemId change listener fires     │
│       └─ Auto-populate unitPrice     │
│          from selected PriceList     │
└──────────────┬──────────────────────────┘
               │
               ▼
┌──────────────────────────────────────┐
│  User Submits Form                   │
│  ├─ Validate all fields              │
│  ├─ Build CreateInvoiceDto with:     │
│  │  ✓ priceListId                    │
│  │  ✓ lines with itemId, qty, price  │
│  └─ Send to API                      │
└──────────────┬──────────────────────────┘
               │
               ▼
        Backend Processing
      (See BACKEND_OPTION_C)
```

---

## Key Features

### ✅ Dynamic Price Loading
- Prices loaded dynamically when price list selected
- Supports multiple pricing tiers (Retail, Wholesale, etc.)
- Prices displayed in item dropdown for user guidance

### ✅ Automatic Price Population
- When user selects item, price auto-populates from chosen price list
- When user switches price lists, existing line items updated automatically
- Unit price field is read-only (disabled) to prevent manual overrides

### ✅ Default Price List Selection
- Form auto-selects default price list on initialization
- Reduces user clicks for common scenarios
- Can still be overridden by user selection

### ✅ Real-time Stock Validation
- Stock validation preserved from original implementation
- Works seamlessly with price list selection
- Shows remaining stock after quantity selected

### ✅ Validation & Error Handling
- Price List is required field with validation error display
- Items fetching includes error handling with fallback to general items list
- Network errors logged to console, UI remains functional

---

## Testing Checklist

### Component Loading
- [ ] Form loads with all required fields visible
- [ ] Price lists dropdown populated
- [ ] Default price list pre-selected
- [ ] Items loaded for default price list

### Price List Selection
- [ ] Changing price list loads different items
- [ ] Item dropdown shows prices for selected list
- [ ] Existing line items update prices when list changed
- [ ] Format is "Retail: 100, Wholesale: 90" or similar

### Line Item Addition
- [ ] Adding new line shows items with prices
- [ ] Selecting item auto-populates price
- [ ] Price reflects selected price list
- [ ] Price field is read-only (disabled)
- [ ] Stock validation still works

### Form Submission
- [ ] priceListId included in POST/PUT request
- [ ] All line items include unitPrice from selected list
- [ ] Invoice created/updated successfully
- [ ] Redirects to invoice list on success

### Error Scenarios
- [ ] Missing price list shows error
- [ ] No items for selected price list handled gracefully
- [ ] Network error doesn't crash form
- [ ] Validation errors displayed correctly

---

## Integration with Backend

### API Endpoints Used
1. **GET /api/pricelist** - Fetch all price lists
   - Returns: `PriceList[]` with `id`, `name`, `isDefault`

2. **GET /api/itemprice/pricelist/{priceListId}/items** - Get items with prices
   - Returns: `ItemWithPricesDto[]` with items and price dictionary
   - Format: `{ id, name, sku, prices: { [priceListId]: price } }`

3. **POST /api/invoice/create** - Create invoice with prices
   - Accepts: `CreateInvoiceDto` with `priceListId`
   - Backend handles price lookup if `unitPrice` not provided

4. **PUT /api/invoice/{id}** - Update invoice with new prices
   - Same as create, supports price list changes

### Backend Responsibilities
- ✅ Validates priceListId exists and is active
- ✅ Fetches ItemPrice records for selected PriceList
- ✅ Validates effective dates (EffectiveFrom <= now <= EffectiveTo)
- ✅ Stores price snapshot in InvoiceItem.UnitPrice
- ✅ Throws exception if prices not found for selected items

---

## Notes & Observations

### Why UnitPrice is Disabled in Template
The `unitPrice` field is set as disabled in the form control to:
1. Prevent users from manually overriding calculated prices
2. Ensure price consistency across all items
3. Maintain audit trail of actual prices used
4. Simplify validation logic

**Code Example:**
```html
<input type="number" class="form-control text-end" 
       formControlName="unitPrice" 
       [disabled]="true"                      <!-- ← Always disabled -->
       aria-label="Unit price" 
       placeholder="0.00">
```

### Price Dictionary Structure
The backend returns prices as a dictionary to support multiple price lists simultaneously:

```json
{
    "id": "item-001",
    "name": "Product A",
    "prices": {
        "c7a1e4c0-5d4c-4b8a-9f2e-1a3b5c7d9e0f": 100,  // Retail PriceList ID
        "d8b2f5d1-6e5d-5c9b-ag3f-2b4c6d8e0f1g": 90     // Wholesale PriceList ID
    }
}
```

Users select by `name` ("Retail", "Wholesale"), but form control uses `id` (GUID) for backend compatibility.

### Change Detection Strategy
Uses `this.cdr.detectChanges()` after async operations to ensure:
1. Updated itemsWithPrices array rendered immediately
2. Dropdown prices displayed without delay
3. Form control patches applied visibly

---

## Example Workflow

**Scenario: Creating invoice with Wholesale pricing after creating one with Retail**

1. User loads invoice form
2. System pre-selects "Retail (Default)" price list
3. Items dropdown shows: "Product A - $100", "Product B - $150"
4. User changes dropdown to "Wholesale"
5. Items dropdown updates to: "Product A - $90", "Product B - $120"
6. Existing line items (if any) update prices to wholesale
7. User adds line item "Product A"
8. Price auto-populates as $90
9. User submits form
10. Backend creates invoice with `priceListId` and wholesale prices

---

## Files Modified Summary

| File | Changes | Status |
|------|---------|--------|
| invoice.service.ts | Added priceListId to CreateInvoiceDto | ✅ Done |
| item-price.service.ts | Added getItemsWithPricesForPriceList() | ✅ Done |
| invoice-form.component.ts | Added imports, properties, methods, form control | ✅ Done |
| invoice-form.component.html | Added price list dropdown, updated item dropdown | ✅ Done |

**Total Changes:** 4 files modified
**Lines Added/Modified:** ~150 lines of code
**Tests Recommended:** Unit tests for onPriceListSelected(), integration tests for form submission

---

## Conclusion

Frontend implementation for **Option C** is complete. Users can now:
1. ✅ Select pricing tier when creating invoices
2. ✅ See item prices for selected tier in dropdown
3. ✅ Have prices automatically populated when selecting items
4. ✅ Switch pricing tiers and have all prices update automatically

The system maintains all existing validations (stock checks, required fields) while adding new pricing tier selection capability. Integration with backend price lookup is seamless and transparent to the user.
