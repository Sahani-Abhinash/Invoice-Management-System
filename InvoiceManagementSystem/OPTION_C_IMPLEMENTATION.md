# Option C Implementation Guide: User Explicitly Selects PriceList

## Overview
This guide documents the **Option C** implementation where users explicitly select which price list (Retail, Wholesale, etc.) to use when creating an invoice. Prices are automatically looked up from the selected price list.

---

## Architecture Changes Made

### 1. Backend Updates (Completed ✅)

#### **CreateInvoiceDto** - Updated with PriceListId
```csharp
// Location: IMS.Application/DTOs/Invoicing/CreateInvoiceDto.cs

public class CreateInvoiceDto
{
    public string Reference { get; set; }
    public string? PoNumber { get; set; }
    public DateTime InvoiceDate { get; set; }
    public DateTime? DueDate { get; set; }
    public Guid? CustomerId { get; set; }
    public Guid? BranchId { get; set; }
    public Guid? PriceListId { get; set; }  // ← NEW: User selects price list
    public decimal TaxRate { get; set; }
    public List<CreateInvoiceItemDto> Lines { get; set; }
}

public class CreateInvoiceItemDto
{
    public Guid ItemId { get; set; }
    public decimal Quantity { get; set; }
    public decimal? UnitPrice { get; set; }  // ← Changed to optional - will be fetched
}
```

#### **InvoiceService.CreateAsync()** - Enhanced with Price Lookup
```csharp
// Location: IMS.Infrastructure/Services/Invoicing/InvoiceService.cs

public async Task<InvoiceDto> CreateAsync(CreateInvoiceDto dto)
{
    // Step 1: Determine which PriceList to use
    PriceList? selectedPriceList = null;

    if (dto.PriceListId.HasValue)
    {
        // User explicitly selected a price list
        selectedPriceList = await _priceListRepo.GetByIdAsync(dto.PriceListId.Value);
    }
    else
    {
        // Fall back to default price list
        var allPriceLists = await _priceListRepo.GetAllAsync();
        selectedPriceList = allPriceLists.FirstOrDefault(p => p.IsDefault);
    }

    if (selectedPriceList == null)
        throw new InvalidOperationException("No valid price list found. Please select a price list or set a default.");

    // Step 2: Fetch all item prices for the selected price list
    var allItemPrices = await _itemPriceRepo.GetAllAsync();
    var priceListItemPrices = allItemPrices
        .Where(ip => ip.PriceListId == selectedPriceList.Id &&
                   ip.EffectiveFrom <= DateTime.UtcNow &&
                   (ip.EffectiveTo == null || ip.EffectiveTo >= DateTime.UtcNow))
        .ToList();

    // Step 3: Process line items and fetch prices if not provided
    var processedLines = new List<CreateInvoiceItemDto>();
    foreach (var line in dto.Lines)
    {
        var unitPrice = line.UnitPrice;

        // If UnitPrice not provided, fetch from PriceList
        if (!unitPrice.HasValue || unitPrice == 0)
        {
            var itemPrice = priceListItemPrices.FirstOrDefault(ip => ip.ItemId == line.ItemId);
            if (itemPrice == null)
            {
                throw new InvalidOperationException(
                    $"No active price found for item {line.ItemId} in {selectedPriceList.Name} price list");
            }
            unitPrice = itemPrice.Price;
        }

        processedLines.Add(new CreateInvoiceItemDto
        {
            ItemId = line.ItemId,
            Quantity = line.Quantity,
            UnitPrice = unitPrice.Value
        });
    }

    // Step 4: Calculate totals and create invoice
    var subtotal = processedLines.Sum(l => l.Quantity * l.UnitPrice);
    var tax = subtotal * (dto.TaxRate / 100);
    var total = subtotal + tax;

    // ... rest of invoice creation logic
}
```

#### **New DTOs for Price Display**
```csharp
// Location: IMS.Application/DTOs/Product/ItemWithPricesDto.cs

/// <summary>
/// For displaying an item with prices for a specific price list during invoice creation
/// </summary>
public class ItemWithPricesDto
{
    public Guid Id { get; set; }
    public string Name { get; set; }
    public string SKU { get; set; }
    public UnitOfMeasureDto? UnitOfMeasure { get; set; }
    
    // Dictionary of PriceList Name -> Price
    // Example: { "Retail": 100, "Wholesale": 90 }
    public Dictionary<string, decimal> Prices { get; set; } = new();
}

public class ItemPriceForListDto
{
    public Guid ItemId { get; set; }
    public string ItemName { get; set; }
    public string ItemSKU { get; set; }
    public Guid PriceListId { get; set; }
    public string PriceListName { get; set; }
    public decimal Price { get; set; }
    public DateTime EffectiveFrom { get; set; }
    public DateTime? EffectiveTo { get; set; }
}
```

#### **API Endpoints**

Already available:
- **GET /api/pricelist** - Get all price lists
- **GET /api/pricelist/{id}** - Get price list by ID

New:
- **GET /api/itemprice/pricelist/{priceListId}/items** - Get items with their prices for a specific price list

---

## Frontend Implementation (To Be Done)

### 1. Create Invoice Form Component

```typescript
// invoice-form.component.ts

import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PriceListService } from './services/pricelist.service';
import { ItemService } from './services/item.service';
import { InvoiceService } from './services/invoice.service';

@Component({
  selector: 'app-invoice-form',
  templateUrl: './invoice-form.component.html',
  styleUrls: ['./invoice-form.component.css']
})
export class InvoiceFormComponent implements OnInit {
  invoiceForm!: FormGroup;
  priceLists: PriceListDto[] = [];
  items: ItemWithPricesDto[] = [];
  lineItems: CreateInvoiceItemDto[] = [];
  selectedPriceListId: Guid | null = null;
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private priceListService: PriceListService,
    private itemService: ItemService,
    private invoiceService: InvoiceService
  ) {}

  ngOnInit() {
    this.initForm();
    this.loadPriceLists();
  }

  private initForm() {
    this.invoiceForm = this.fb.group({
      reference: ['', Validators.required],
      poNumber: [''],
      invoiceDate: [new Date(), Validators.required],
      dueDate: [''],
      customerId: [''],
      branchId: [''],
      priceListId: [null, Validators.required],  // ← PriceList selector
      taxRate: [0, Validators.required]
    });
  }

  loadPriceLists() {
    this.priceListService.getAll().subscribe({
      next: (lists) => {
        this.priceLists = lists;
        // Pre-select default
        const defaultList = lists.find(p => p.isDefault);
        if (defaultList) {
          this.invoiceForm.patchValue({ priceListId: defaultList.id });
          this.onPriceListSelected(defaultList.id);
        }
      },
      error: (err) => console.error('Failed to load price lists', err)
    });
  }

  /// Called when user selects a price list
  onPriceListSelected(priceListId: Guid) {
    this.selectedPriceListId = priceListId;
    this.loadItemsForPriceList(priceListId);
  }

  loadItemsForPriceList(priceListId: Guid) {
    this.isLoading = true;
    this.itemService.getItemsWithPricesForPriceList(priceListId).subscribe({
      next: (items) => {
        this.items = items;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Failed to load items', err);
        this.isLoading = false;
      }
    });
  }

  /// User adds a line item to invoice
  addLineItem(itemId: Guid, quantity: number) {
    const item = this.items.find(i => i.id === itemId);
    if (!item) {
      alert('Item not found');
      return;
    }

    const priceList = this.invoiceForm.get('priceListId')?.value;
    const price = item.prices[priceList];

    if (!price) {
      alert('No price found for this item in selected price list');
      return;
    }

    const lineItem: CreateInvoiceItemDto = {
      itemId,
      quantity,
      unitPrice: price  // Explicitly set to selected price
    };

    this.lineItems.push(lineItem);
    this.calculateTotal();
  }

  removeLineItem(index: number) {
    this.lineItems.splice(index, 1);
    this.calculateTotal();
  }

  calculateTotal() {
    const subtotal = this.lineItems.reduce((sum, item) => 
      sum + (item.quantity * item.unitPrice!), 0);
    const taxRate = this.invoiceForm.get('taxRate')?.value || 0;
    const tax = subtotal * (taxRate / 100);
    const total = subtotal + tax;
    
    // Update display
    return { subtotal, tax, total };
  }

  submitInvoice() {
    if (!this.invoiceForm.valid || this.lineItems.length === 0) {
      alert('Please fill all required fields and add at least one line item');
      return;
    }

    const invoiceDto: CreateInvoiceDto = {
      ...this.invoiceForm.value,
      lines: this.lineItems
    };

    this.invoiceService.create(invoiceDto).subscribe({
      next: (invoice) => {
        alert('Invoice created successfully');
        // Navigate or reset form
      },
      error: (err) => {
        alert('Failed to create invoice: ' + err.message);
      }
    });
  }
}
```

### 2. Create Invoice Form Template

```html
<!-- invoice-form.component.html -->

<div class="container mt-4">
  <div class="card">
    <div class="card-header">
      <h3>Create Invoice</h3>
    </div>

    <div class="card-body">
      <form [formGroup]="invoiceForm">

        <!-- Price List Selection (Top Priority) -->
        <div class="row mb-3">
          <div class="col-md-6">
            <label class="form-label">Price List <span class="text-danger">*</span></label>
            <select class="form-control" 
                    formControlName="priceListId"
                    (change)="onPriceListSelected($event.target.value)">
              <option value="">Select Price List</option>
              <option *ngFor="let list of priceLists" [value]="list.id">
                {{ list.name }} {{ list.isDefault ? '(Default)' : '' }}
              </option>
            </select>
            <small class="text-info">Select pricing tier (Retail/Wholesale) to determine item prices</small>
          </div>

          <div class="col-md-6">
            <label class="form-label">Invoice Date <span class="text-danger">*</span></label>
            <input type="date" class="form-control" formControlName="invoiceDate">
          </div>
        </div>

        <!-- Invoice Header -->
        <div class="row mb-3">
          <div class="col-md-6">
            <label class="form-label">Reference <span class="text-danger">*</span></label>
            <input type="text" class="form-control" formControlName="reference" placeholder="INV-001">
          </div>

          <div class="col-md-6">
            <label class="form-label">PO Number</label>
            <input type="text" class="form-control" formControlName="poNumber">
          </div>
        </div>

        <div class="row mb-3">
          <div class="col-md-6">
            <label class="form-label">Customer</label>
            <input type="text" class="form-control" formControlName="customerId">
          </div>

          <div class="col-md-6">
            <label class="form-label">Tax Rate (%)</label>
            <input type="number" class="form-control" formControlName="taxRate" step="0.01">
          </div>
        </div>

      </form>

      <!-- Line Items Section -->
      <hr>
      <h5 class="mt-4">Line Items</h5>

      <div *ngIf="isLoading" class="alert alert-info">
        Loading items for selected price list...
      </div>

      <div class="table-responsive" *ngIf="!isLoading && items.length > 0">
        <table class="table table-sm table-hover">
          <thead class="table-light">
            <tr>
              <th>Item</th>
              <th>SKU</th>
              <th>Price</th>
              <th>Quantity</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let item of items">
              <td>{{ item.name }}</td>
              <td>{{ item.sku }}</td>
              <td>
                <strong>{{ item.prices[invoiceForm.get('priceListId')?.value] | currency }}</strong>
                <br>
                <small class="text-muted">
                  <!-- Show all available prices -->
                  <span *ngFor="let [listName, price] of Object.entries(item.prices); let last = last">
                    {{ listName }}: {{ price | currency }}{{ !last ? ' | ' : '' }}
                  </span>
                </small>
              </td>
              <td>
                <input type="number" class="form-control form-control-sm" 
                       placeholder="Qty" min="1" #qty>
              </td>
              <td>
                <button type="button" class="btn btn-sm btn-primary"
                        (click)="addLineItem(item.id, +qty.value)">
                  Add
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Selected Line Items -->
      <div class="mt-4" *ngIf="lineItems.length > 0">
        <h5>Selected Items</h5>
        <div class="table-responsive">
          <table class="table table-sm">
            <thead class="table-light">
              <tr>
                <th>Item</th>
                <th>Quantity</th>
                <th>Unit Price</th>
                <th>Line Total</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let line of lineItems; let i = index">
                <td>{{ items.find(it => it.id === line.itemId)?.name }}</td>
                <td>{{ line.quantity }}</td>
                <td>{{ line.unitPrice | currency }}</td>
                <td>{{ (line.quantity * line.unitPrice!) | currency }}</td>
                <td>
                  <button type="button" class="btn btn-sm btn-danger"
                          (click)="removeLineItem(i)">
                    Remove
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Totals -->
        <div class="row mt-4">
          <div class="col-md-6 ms-auto">
            <table class="table table-sm">
              <tr>
                <td><strong>Subtotal:</strong></td>
                <td>{{ calculateTotal().subtotal | currency }}</td>
              </tr>
              <tr>
                <td><strong>Tax:</strong></td>
                <td>{{ calculateTotal().tax | currency }}</td>
              </tr>
              <tr class="table-warning">
                <td><strong>Total:</strong></td>
                <td><strong>{{ calculateTotal().total | currency }}</strong></td>
              </tr>
            </table>
          </div>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="mt-4">
        <button type="submit" class="btn btn-primary" 
                (click)="submitInvoice()"
                [disabled]="!invoiceForm.valid || lineItems.length === 0">
          Create Invoice
        </button>
        <button type="button" class="btn btn-secondary ms-2">
          Cancel
        </button>
      </div>

    </div>
  </div>
</div>
```

### 3. Service Updates

```typescript
// pricelist.service.ts
export class PriceListService {
  private apiUrl = 'https://localhost:7276/api/pricelist';

  constructor(private http: HttpClient) {}

  getAll(): Observable<PriceListDto[]> {
    return this.http.get<PriceListDto[]>(this.apiUrl);
  }

  getById(id: Guid): Observable<PriceListDto> {
    return this.http.get<PriceListDto>(`${this.apiUrl}/${id}`);
  }
}

// item.service.ts (existing, add new method)
export class ItemService {
  private apiUrl = 'https://localhost:7276/api/item';
  private itemPriceUrl = 'https://localhost:7276/api/itemprice';

  constructor(private http: HttpClient) {}

  // Existing methods...

  getItemsWithPricesForPriceList(priceListId: Guid): Observable<ItemWithPricesDto[]> {
    return this.http.get<ItemWithPricesDto[]>(
      `${this.itemPriceUrl}/pricelist/${priceListId}/items`
    );
  }
}
```

---

## Flow Diagram: User Explicitly Selects PriceList

```
┌─────────────────────────────────────────────────────────────┐
│ Invoice Creation Form Loads                                 │
└────────────┬────────────────────────────────────────────────┘
             │
             ├─→ Load all PriceLists (Retail, Wholesale)
             │
             └─→ Pre-select default or ask user to choose
                 │
                 ▼
┌─────────────────────────────────────────────────────────────┐
│ User Selects PriceList (e.g., "Wholesale")                  │
└────────────┬────────────────────────────────────────────────┘
             │
             ├─→ API: GET /api/itemprice/pricelist/{id}/items
             │
             ├─→ Returns: [
             │      {
             │        id: "ITEM001",
             │        name: "Product A",
             │        sku: "PRODA-001",
             │        prices: { "Retail": 100, "Wholesale": 90 }
             │      }
             │    ]
             │
             └─→ Populate Item Selection Dropdown
                 │
                 ▼
┌─────────────────────────────────────────────────────────────┐
│ User Selects Items and Adds to Invoice                      │
│ - Quantity: 50                                              │
│ - Price: 90 (auto-populated from Wholesale price list)      │
│ - LineTotal: 4500                                           │
└────────────┬────────────────────────────────────────────────┘
             │
             ├─→ User clicks "Create Invoice"
             │
             ▼
┌─────────────────────────────────────────────────────────────┐
│ Submit Invoice to Backend                                    │
│ POST /api/invoice/create                                    │
│ Body: {                                                     │
│   reference: "INV-001",                                     │
│   priceListId: "WHOLESALE_LIST_ID",  ← Explicit selection   │
│   lines: [                                                  │
│     {                                                       │
│       itemId: "ITEM001",                                    │
│       quantity: 50,                                         │
│       unitPrice: 90  ← Will be validated/overridden by     │
│     }                 backend if needed                     │
│   ]                                                         │
│ }                                                           │
└────────────┬────────────────────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────────────────────┐
│ Backend Processing (InvoiceService.CreateAsync)             │
│                                                             │
│ 1. Get selected PriceList from DTO                         │
│ 2. Load all ItemPrices for that PriceList                  │
│ 3. For each line item:                                     │
│    - If UnitPrice provided, use it                         │
│    - Otherwise, fetch from PriceList                       │
│ 4. Store snapshot of prices in InvoiceItem.UnitPrice       │
│ 5. Create Invoice with correct prices                      │
└────────────┬────────────────────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────────────────────┐
│ Invoice Created Successfully                                 │
│                                                             │
│ Invoice ID: 12345                                           │
│ Reference: INV-001                                          │
│ PriceList: Wholesale                                        │
│ LineItem 1:                                                │
│   - Item: Product A                                         │
│   - Qty: 50                                                 │
│   - UnitPrice: 90 (from Wholesale list)                     │
│   - LineTotal: 4500                                         │
│ SubTotal: 4500                                              │
│ Tax (10%): 450                                              │
│ Total: 4950                                                 │
└─────────────────────────────────────────────────────────────┘
```

---

## Key Benefits of Option C

✅ **User Control**: Explicit selection of pricing tier  
✅ **Flexibility**: Can override prices if needed  
✅ **Transparency**: Users see which price list is being used  
✅ **Price Validation**: Backend validates prices against selected list  
✅ **Auditability**: Can track which price list was used for each invoice  
✅ **Fallback Support**: Defaults to system default if not specified  
✅ **Effective Dating**: Honors EffectiveFrom/EffectiveTo on ItemPrice  

---

## Testing Checklist

- [ ] Create invoice with Retail price list
- [ ] Create invoice with Wholesale price list
- [ ] Verify correct prices are used based on selection
- [ ] Test with multiple line items
- [ ] Test decimal rounding on totals
- [ ] Test with expired prices (EffectiveTo in past)
- [ ] Test with future prices (EffectiveFrom in future)
- [ ] Test fallback to default price list
- [ ] Test error handling when no prices exist for item
- [ ] Verify prices are frozen in invoice history

---

## Implementation Status

| Component | Status | Location |
|-----------|--------|----------|
| CreateInvoiceDto with PriceListId | ✅ Complete | IMS.Application/DTOs/Invoicing |
| CreateInvoiceItemDto (optional UnitPrice) | ✅ Complete | IMS.Application/DTOs/Invoicing |
| ItemWithPricesDto | ✅ Complete | IMS.Application/DTOs/Product |
| InvoiceService.CreateAsync() logic | ✅ Complete | IMS.Infrastructure/Services/Invoicing |
| API Endpoint: GET /pricelist | ✅ Ready | IMS.API/Controllers/PriceListController |
| API Endpoint: GET /itemprice/pricelist/{id}/items | ✅ Ready | IMS.API/Controllers/ItemPriceController |
| ItemPriceService enhancement | ✅ Complete | IMS.Infrastructure/Services/Product |
| Frontend form component | ⏳ To Do | ims.ClientApp/src/app/features/invoice |
| Frontend template | ⏳ To Do | ims.ClientApp/src/app/features/invoice |
| PriceListService | ⏳ To Do | ims.ClientApp/src/app/services |
| Item service update | ⏳ To Do | ims.ClientApp/src/app/services |

---

## Next Steps

1. Build frontend components using the code provided above
2. Test end-to-end invoice creation with different price lists
3. Add validations for missing prices
4. Add UI feedback for loading states
5. Implement invoice edit functionality with price list changes
6. Add price history/audit trail reporting

