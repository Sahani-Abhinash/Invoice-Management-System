# Price List Bug Fix - Same Price Displaying for Retail and Wholesale

## 🐛 Problem Identified

**Issue:** Different price lists (Retail, Wholesale) were displaying the **same price** for items.

**Root Cause:** The frontend was trying to access prices using the **PriceList ID** (GUID), but the backend returns prices keyed by **PriceList Name** (string like "Retail", "Wholesale").

### Example of the Issue:
```
Backend Returns:
{
  "id": "item-001",
  "name": "Product A",
  "prices": {
    "Retail": 100,      // ← Key is the NAME, not the ID
    "Wholesale": 90
  }
}

Frontend Was Doing (WRONG):
prices[priceListId]  // Using GUID like "c7a1e4c0-5d4c-4b8a-9f2e-1a3b5c7d9e0f"
// Returns undefined, so price never populated!

Frontend Should Do (CORRECT):
prices[selectedPriceListName]  // Using name like "Retail" or "Wholesale"
// Returns 100 or 90 correctly!
```

---

## ✅ Solution Implemented

Added a new component property `selectedPriceListName` to store the name of the selected price list and updated all price lookups to use the name instead of the ID.

### Changes Made:

#### 1. **Component Property Added**
```typescript
selectedPriceListName: string | null = null;  // ← NEW
```

#### 2. **onPriceListSelected() Method Updated**
```typescript
onPriceListSelected(priceListId: string): void {
    // Get the name of the selected price list
    const selectedPriceList = this.priceLists.find(p => p.id === priceListId);
    this.selectedPriceListName = selectedPriceList?.name || null;  // ← Store the name
    
    // Now access prices using the NAME
    if (itemWithPrices.prices[this.selectedPriceListName]) {  // ← Using name!
        // Set the price correctly
    }
}
```

#### 3. **addLine() Method Updated**
```typescript
// Look up price using the NAME instead of ID
if (itemWithPrices.prices[this.selectedPriceListName]) {  // ← Using name!
    initialPrice = itemWithPrices.prices[this.selectedPriceListName];
}
```

#### 4. **Item Price Change Listener Updated**
```typescript
lineForm.get('itemId')?.valueChanges.subscribe((itemId) => {
    if (itemId && this.selectedPriceListName) {  // ← Using name!
        if (itemWithPrices.prices[this.selectedPriceListName]) {  // ← Using name!
            lineForm.patchValue({ unitPrice: itemWithPrices.prices[this.selectedPriceListName] });
        }
    }
});
```

#### 5. **Template Updated**
```html
<span *ngIf="itemsWithPrices.length > 0 && item.prices && selectedPriceListName">
    - ${{ item.prices[selectedPriceListName] }}  <!-- Using name! -->
</span>
```

---

## 📊 Before and After

### Before (Bug):
1. User selects "Retail" price list
2. Form stores: `selectedPriceListId = "c7a1e4c0-5d4c-4b8a-9f2e-1a3b5c7d9e0f"`
3. Backend returns: `prices: { "Retail": 100, "Wholesale": 90 }`
4. Frontend tries: `prices[selectedPriceListId]` → `prices["c7a1e4c0..."]` → **undefined** ❌
5. Price field stays empty or shows wrong value

### After (Fixed):
1. User selects "Retail" price list
2. Form stores: 
   - `selectedPriceListId = "c7a1e4c0-5d4c-4b8a-9f2e-1a3b5c7d9e0f"`
   - `selectedPriceListName = "Retail"` ← **NEW**
3. Backend returns: `prices: { "Retail": 100, "Wholesale": 90 }`
4. Frontend tries: `prices[selectedPriceListName]` → `prices["Retail"]` → **100** ✅
5. Price displays correctly!

---

## 🧪 Testing the Fix

### Test Scenario: Verify Different Prices for Different Price Lists

1. **Load the form**
   - Should see "Retail" pre-selected (or your default)
   - Item dropdown should show: "Product A - $100"

2. **Change to Wholesale**
   - Click Price List dropdown → Select "Wholesale"
   - Item dropdown should update to: "Product A - $90"
   - Notice the price changed from $100 to $90 ✅

3. **Add line items**
   - Add "Product A" with Retail selected → Price should be $100
   - Change to Wholesale → Price should auto-update to $90 ✅

4. **Verify prices in line items**
   - With Retail: Unit Price = $100
   - With Wholesale: Unit Price = $90
   - Switch back to Retail: Unit Price should revert to $100 ✅

---

## 📁 Files Modified

### invoice-form.component.ts
- **Line ~35:** Added `selectedPriceListName: string | null = null;`
- **Lines ~149-195:** Updated `onPriceListSelected()` method
- **Lines ~125-128:** Updated default price list selection
- **Lines ~297-303:** Updated `addLine()` initial price lookup
- **Lines ~315-325:** Updated item change listener

### invoice-form.component.html
- **Lines ~115-127:** Updated item dropdown to use `selectedPriceListName`

---

## 🔍 Why This Happened

The backend DTO (ItemWithPricesDto) is designed with a `Dictionary<string, decimal>` where the key is the **PriceList Name** (not ID). This is by design for better readability and user experience.

### ItemWithPricesDto Structure (Backend):
```csharp
public class ItemWithPricesDto
{
    public Guid Id { get; set; }
    public string Name { get; set; }
    public string SKU { get; set; }
    
    /// Dictionary of PriceList Name -> Price
    /// Example: { "Retail": 100, "Wholesale": 90 }
    public Dictionary<string, decimal> Prices { get; set; } = new();
}
```

The frontend now correctly understands this structure and accesses prices by name.

---

## ✨ Key Takeaway

**Always match your data access patterns to the data structure:**
- Backend returns: `Dictionary<string, decimal>` (name-based keys)
- Frontend must use: `prices[priceName]` (not `prices[priceId]`)

The fix aligns the frontend code with the backend data structure for correct price retrieval.

---

## 🎯 Expected Results After Fix

✅ Retail price list shows Retail prices
✅ Wholesale price list shows Wholesale prices  
✅ Switching price lists updates all prices
✅ Adding items auto-populates correct price
✅ Prices differ correctly for each price list

---

## 🚀 Next Steps

1. **Test the fix** by following the test scenario above
2. **Verify in browser** that prices update correctly when changing price lists
3. **Check console** for the debug logs:
   - "Loading items for price list: [ID] Name: [Name]"
   - "Items loaded for price list: [items with prices]"
4. **Confirm submission** includes correct prices

---

**Fix Status: ✅ COMPLETE**

All price lookup logic now correctly uses PriceList **Name** instead of **ID**.
