# Retail and Wholesale Pricing Guide

## Overview

Your system uses a **PriceList-based pricing model** that allows the same item to have multiple prices for different customer types (Retail, Wholesale, etc.). This is a flexible approach that separates pricing logic from items themselves.

---

## Architecture

### 1. **Core Entities**

#### **Item** (Product Master)
- Single item record (e.g., "Product A")
- Contains: Name, SKU, UnitOfMeasure, etc.
- **Does NOT contain prices directly**

#### **PriceList** (Pricing Categories)
- Defines pricing tiers (e.g., "Retail", "Wholesale")
- Has: `Id`, `Name`, `IsDefault` (boolean)
- Example Data:
  - PriceList ID: ABC123 → Name: "Retail", IsDefault: true
  - PriceList ID: DEF456 → Name: "Wholesale", IsDefault: false

#### **ItemPrice** (Item-PriceList Bridge)
- Links items to priceLists with prices
- One item can have MULTIPLE ItemPrice records (one per PriceList)
- Has: `ItemId`, `PriceListId`, `Price`, `EffectiveFrom`, `EffectiveTo`

**Example:**
```
Item: Product A (SKU: PRODA-001)
├── ItemPrice 1: PriceList="Retail"    → Price = 100
└── ItemPrice 2: PriceList="Wholesale" → Price = 90
```

#### **InvoiceItem** (Invoice Line Items)
- Links items to invoices
- Has: `InvoiceId`, `ItemId`, `Quantity`, **`UnitPrice`**, `LineTotal`
- **`UnitPrice` is stored at the time of invoice creation** (snapshot)

---

## How Pricing Works When Creating an Invoice

### **Current Implementation (Simple Path)**

When you add a line item to an invoice:

1. **User selects an Item** (e.g., "Product A")
2. **System needs to determine which price to use**
3. **Store price at invoice creation time** in `InvoiceItem.UnitPrice`

**Question: How does the system know which PriceList to use?**

Your system likely does ONE of these:

#### **Option A: Use the Default PriceList**
```csharp
// Get the default PriceList
var defaultPriceList = await _context.PriceLists
    .FirstOrDefaultAsync(pl => pl.IsDefault == true);

// Get the item's price for the default price list
var itemPrice = await _context.ItemPrices
    .FirstOrDefaultAsync(ip => 
        ip.ItemId == itemId && 
        ip.PriceListId == defaultPriceList.Id);

invoiceItem.UnitPrice = itemPrice.Price;
```

#### **Option B: Use Customer's Associated PriceList** (Recommended)
```csharp
// Get customer's preferred PriceList (stored on Customer entity)
var customer = await _context.Customers.FindAsync(customerId);
var priceList = customer.DefaultPriceListId; // e.g., "Wholesale"

// Get the item's price for the customer's price list
var itemPrice = await _context.ItemPrices
    .FirstOrDefaultAsync(ip => 
        ip.ItemId == itemId && 
        ip.PriceListId == priceList.Id);

invoiceItem.UnitPrice = itemPrice.Price;
```

#### **Option C: User Explicitly Selects PriceList**
```csharp
// User picks from dropdown in invoice form
// Form includes: Retail (100) | Wholesale (90) | Custom (X)

// Once selected, fetch that price
var itemPrice = await _context.ItemPrices
    .FirstOrDefaultAsync(ip => 
        ip.ItemId == itemId && 
        ip.PriceListId == selectedPriceListId);

invoiceItem.UnitPrice = itemPrice.Price;
```

---

## Recommended Approach: **Customer-Based Pricing**

### **Database Changes Needed**

Add a `Customer` entity with price list preference:

```csharp
public class Customer : BaseEntity
{
    public string Name { get; set; }
    public Guid CompanyId { get; set; }
    
    // Add this:
    public Guid? DefaultPriceListId { get; set; }
    public PriceList DefaultPriceList { get; set; } = null!;
}
```

### **Invoice Creation Flow**

```csharp
public async Task CreateInvoiceAsync(CreateInvoiceDto dto)
{
    var invoice = new Invoice
    {
        Reference = dto.Reference,
        InvoiceDate = dto.InvoiceDate,
        CustomerId = dto.CustomerId,
        // ... other fields
    };

    // Get customer's price list
    var customer = await _context.Customers
        .Include(c => c.DefaultPriceList)
        .FirstOrDefaultAsync(c => c.Id == dto.CustomerId);

    var priceList = customer?.DefaultPriceList 
        ?? await _context.PriceLists.FirstOrDefaultAsync(p => p.IsDefault);

    // Add line items with correct prices
    foreach (var lineItemDto in dto.LineItems)
    {
        var itemPrice = await _context.ItemPrices
            .FirstOrDefaultAsync(ip => 
                ip.ItemId == lineItemDto.ItemId && 
                ip.PriceListId == priceList.Id &&
                ip.EffectiveFrom <= DateTime.UtcNow &&
                (ip.EffectiveTo == null || ip.EffectiveTo >= DateTime.UtcNow));

        if (itemPrice == null)
            throw new Exception($"No active price found for item in {priceList.Name} price list");

        var invoiceItem = new InvoiceItem
        {
            InvoiceId = invoice.Id,
            ItemId = lineItemDto.ItemId,
            Quantity = lineItemDto.Quantity,
            UnitPrice = itemPrice.Price,  // ← CAPTURED AT THIS MOMENT
            LineTotal = lineItemDto.Quantity * itemPrice.Price
        };

        invoice.Lines.Add(invoiceItem);
    }

    _context.Invoices.Add(invoice);
    await _context.SaveChangesAsync();
}
```

---

## Frontend Flow: Adding Line Items

### **User Interface**

When user adds items to invoice form:

```
Customer: [Dropdown] → Automatically loads customer's price list
         ↓
         System knows: Retail or Wholesale

Item: [Dropdown] → Shows available items
      ↓
      Shows: "Product A - Retail Price: 100" OR "Product A - Wholesale Price: 90"

Quantity: [Input]
         ↓
         LineTotal calculated as: Quantity × UnitPrice

[Add Line Item]
```

### **Code Example (Angular)**

```typescript
// user-form.component.ts or invoice-form.component.ts

export class InvoiceFormComponent {
  priceList: PriceList; // Retail or Wholesale
  items: Item[];
  itemPrices: Map<Guid, ItemPrice[]> = new Map();

  onCustomerSelected(customerId: Guid) {
    this.customerService.getById(customerId).subscribe(customer => {
      // Get customer's price list
      this.priceList = customer.defaultPriceList; // e.g., "Wholesale"
      
      // Load all items with their prices for this price list
      this.itemService.getItemsWithPrices(this.priceList.id).subscribe(items => {
        this.items = items; // Items now have price info
      });
    });
  }

  addLineItem(itemId: Guid, quantity: number) {
    const item = this.items.find(i => i.id === itemId);
    const itemPrice = item.prices.find(p => p.priceListId === this.priceList.id);

    const lineItem = {
      itemId,
      itemName: item.name,
      quantity,
      unitPrice: itemPrice.price,
      lineTotal: quantity * itemPrice.price
    };

    this.invoiceLineItems.push(lineItem);
    this.calculateInvoiceTotal();
  }
}
```

---

## Sample Data Flow

### **Database Setup**

```sql
-- PriceLists
INSERT INTO PriceLists (Id, Name, IsDefault) 
VALUES 
  ('ABC123', 'Retail', 1),
  ('DEF456', 'Wholesale', 0);

-- Items
INSERT INTO Items (Id, Name, SKU, UnitOfMeasureId) 
VALUES 
  ('ITEM001', 'Product A', 'PRODA-001', 'UOM001');

-- ItemPrices
INSERT INTO ItemPrices (Id, ItemId, PriceListId, Price, EffectiveFrom, EffectiveTo) 
VALUES 
  ('PRICE001', 'ITEM001', 'ABC123', 100.00, '2024-01-01', NULL),
  ('PRICE002', 'ITEM001', 'DEF456', 90.00, '2024-01-01', NULL);

-- Customers
INSERT INTO Customers (Id, Name, DefaultPriceListId) 
VALUES 
  ('CUST001', 'John Retail Shop', 'ABC123'),
  ('CUST002', 'Wholesale Distributor', 'DEF456');

-- Invoice & InvoiceItems
INSERT INTO Invoices (Id, Reference, CustomerId, InvoiceDate, ...) 
VALUES 
  ('INV001', 'INV-2024-001', 'CUST001', '2024-01-15', ...);

INSERT INTO InvoiceItems (InvoiceId, ItemId, Quantity, UnitPrice, LineTotal) 
VALUES 
  ('INV001', 'ITEM001', 5, 100.00, 500.00);  -- Retail price

-- For wholesale customer:
INSERT INTO Invoices (Id, Reference, CustomerId, InvoiceDate, ...) 
VALUES 
  ('INV002', 'INV-2024-002', 'CUST002', '2024-01-16', ...);

INSERT INTO InvoiceItems (InvoiceId, ItemId, Quantity, UnitPrice, LineTotal) 
VALUES 
  ('INV002', 'ITEM001', 50, 90.00, 4500.00);  -- Wholesale price
```

---

## Key Takeaways

✅ **Same item, different prices**: One Item + multiple ItemPrices (by PriceList)  
✅ **Prices are snapshot**: Captured at invoice creation time in `InvoiceItem.UnitPrice`  
✅ **Price selection logic**: Determine from Customer → DefaultPriceList (or default system price)  
✅ **Flexibility**: Add new price lists anytime (Wholesale A, Wholesale B, Bulk, VIP, etc.)  
✅ **Effective dating**: ItemPrice supports `EffectiveFrom` and `EffectiveTo` for seasonal pricing

---

## Next Steps for Implementation

1. **Add `DefaultPriceListId` to Customer entity** (if not exists)
2. **Update CreateInvoiceDto** to include customer selection
3. **Create API endpoint** to get ItemPrices by PriceList
4. **Update InvoiceService.CreateInvoiceAsync()** to implement the logic above
5. **Update Frontend form** to load customer's price list and show correct prices
6. **Test** with both retail and wholesale customers

Would you like me to implement any of these changes?
