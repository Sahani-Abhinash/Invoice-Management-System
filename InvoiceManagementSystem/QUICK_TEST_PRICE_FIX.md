# Quick Test - Price List Bug Fix Verification

## 🧪 Test in 5 Minutes

### Step 1: Load the Form (1 min)
1. Open the application
2. Navigate to `/invoices/create`
3. **Expected:** Form loads with default price list selected (e.g., "Retail")

### Step 2: Check Item Prices (1 min)
1. Look at the "Item / Description" dropdown in line items
2. **Expected:** See prices next to items (e.g., "Product A - $100")
3. **Verify:** The price shown matches the selected price list

### Step 3: Switch Price List (1 min)
1. Change "Price List" dropdown to "Wholesale"
2. Wait 1-2 seconds for items to load
3. Look at the "Item / Description" dropdown again
4. **Expected:** Prices changed (e.g., "Product A - $90")
5. **Verify:** The price is DIFFERENT from Retail price

### Step 4: Add Line Items and Verify (2 min)
1. With "Wholesale" selected, add a line item:
   - Item: "Product A"
   - Quantity: 1
2. **Expected:** Unit Price field auto-populated with $90 (Wholesale price)
3. Change Price List back to "Retail"
4. **Expected:** Unit Price should auto-update to $100 (Retail price)
5. **Verify:** Price changed when price list changed ✅

---

## ✅ Success Criteria

After this quick test, you should see:

| Scenario | Expected | Status |
|----------|----------|--------|
| Load form | Default price list pre-selected | ✅ |
| Check item prices | Prices shown in dropdown | ✅ |
| Switch to Wholesale | Prices update to wholesale | ✅ |
| Add item | Price auto-populates | ✅ |
| Change price list | Unit price updates automatically | ✅ |

---

## 🐛 If Prices Are Still the Same

**Issue:** Prices for Retail and Wholesale are identical

**Check:**
1. Open Browser DevTools (F12)
2. Go to Network tab
3. Change Price List dropdown
4. Look for the API call: `GET /api/itemprice/pricelist/{id}/items`
5. Click on it and check the Response
6. Look at the JSON structure - prices should be different:
   ```json
   {
     "id": "item-001",
     "name": "Product A",
     "prices": {
       "Retail": 100,      // Should be different value
       "Wholesale": 90     // Should be different value
     }
   }
   ```

**If Response Shows Same Prices:**
→ Backend issue, not frontend
→ Check ItemPriceService in backend

**If Response Shows Different Prices but UI Doesn't:**
→ Cache issue
→ Clear browser cache: Ctrl+Shift+Del → Clear all → Reload

---

## 📋 Sample Test Data

Use these items for testing:

| Item | Retail | Wholesale |
|------|--------|-----------|
| Product A | 100 | 90 |
| Product B | 150 | 120 |
| Product C | 200 | 160 |

---

## 🎯 Expected Behavior After Fix

1. **Default Load:** "Retail" selected
   - Item dropdown shows: "Product A - $100"

2. **Switch to Wholesale:**
   - Item dropdown updates to: "Product A - $90"

3. **Add Product A (Wholesale):**
   - Unit Price = $90

4. **Change back to Retail:**
   - Item dropdown shows: "Product A - $100"
   - Unit Price updates to = $100

5. **Switch to Wholesale again:**
   - All prices update back to wholesale values

---

## 📝 Test Report

```
Test Date: ___________
Tester: ___________

Item Prices Display Correctly for Each Price List?  [ ] YES  [ ] NO
Prices Update When Changing Price List?             [ ] YES  [ ] NO
Unit Price Auto-Populates on Item Selection?        [ ] YES  [ ] NO
Prices Update When Switching Between Lists?         [ ] YES  [ ] NO

Overall Result: [ ] PASS  [ ] FAIL

Notes:
_________________________________________________
_________________________________________________
```

---

**Quick Test Duration: 5 minutes**
**Expected Result: All items should show different prices for different price lists**
