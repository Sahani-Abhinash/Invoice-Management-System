# Option C Implementation - Quick Start Testing Guide

## 🚀 Quick Start (5 Minutes)

### Step 1: Start the Backend API
```bash
cd IMS.API
dotnet run
```
- Should start on `https://localhost:5001` or configured endpoint
- Verify API endpoints are accessible

### Step 2: Start the Angular Frontend
```bash
cd ims.ClientApp
npm start
```
- Should start on `http://localhost:4200`
- Angular dev server will open browser automatically

### Step 3: Navigate to Invoice Creation
```
URL: http://localhost:4200/invoices/create
```

---

## ✅ Test Scenario 1: Default Price List Selection (2 min)

### Expected Behavior:
1. Form loads
2. "Retail" price list is pre-selected (or your default)
3. Item dropdown shows prices (e.g., "Product A - $100")

### Test Steps:
1. Open form at `/invoices/create`
2. Look at "Price List" dropdown - should have default selected
3. Check item dropdown in line items - should show item names with prices
4. Verify prices match Retail pricing (not Wholesale)

### Success Criteria:
- ✅ Default price list visible and selected
- ✅ Items displayed with prices
- ✅ Prices match selected price list

---

## ✅ Test Scenario 2: Change Price List (3 min)

### Expected Behavior:
1. User changes price list dropdown
2. Items are re-loaded with new prices
3. Prices in dropdown update immediately

### Test Steps:
1. Start with form loaded (default Retail selected)
2. Notice item prices in dropdown (e.g., "Product A - $100")
3. Change "Price List" dropdown to "Wholesale"
4. Wait 1-2 seconds for items to load
5. Check item dropdown again - prices should change (e.g., "Product A - $90")

### Success Criteria:
- ✅ Price list dropdown changes without error
- ✅ Items re-load for new price list
- ✅ Prices update in item dropdown
- ✅ No console errors

---

## ✅ Test Scenario 3: Add Line Item with Auto-Price (2 min)

### Expected Behavior:
1. User selects item from dropdown
2. Price automatically populates in unit price field
3. Price matches selected price list

### Test Steps:
1. Keep form as is (with Wholesale selected)
2. Click "Add Line" button
3. Click on "Item / Description" dropdown
4. Select any product (e.g., "Product A")
5. Check "Unit Price" field - it should be auto-populated
6. Verify the price is Wholesale price (e.g., $90)

### Success Criteria:
- ✅ Item selection doesn't error
- ✅ Unit price auto-populates
- ✅ Price matches selected price list
- ✅ Unit price field is read-only (can't edit)

---

## ✅ Test Scenario 4: Multiple Line Items (3 min)

### Expected Behavior:
1. Add first item - price auto-populates from selected price list
2. Add second item - price auto-populates from same price list
3. Both items have consistent pricing

### Test Steps:
1. Start fresh form with Retail selected
2. Add first line: Select "Product A" - price should be $100
3. Add second line: Select "Product B" - price should be $150
4. Enter quantities (e.g., 2 and 3)
5. Check totals calculate correctly:
   - Line 1: 2 × $100 = $200
   - Line 2: 3 × $150 = $450
   - Subtotal: $650

### Success Criteria:
- ✅ Multiple items add without error
- ✅ Each item gets correct price from price list
- ✅ Totals calculate correctly
- ✅ All prices consistent with selected list

---

## ✅ Test Scenario 5: Switch Price List with Existing Items (3 min)

### Expected Behavior:
1. Add items with Retail pricing
2. Switch to Wholesale
3. All items update prices automatically

### Test Steps:
1. Form with Retail selected, 2 items added:
   - Product A: 2 × $100 = $200
   - Product B: 3 × $150 = $450
2. Change Price List dropdown to Wholesale
3. Wait for items to reload
4. Check prices in the line items table (Unit Price column)
5. Verify they changed to Wholesale prices
6. Check totals updated:
   - If Wholesale: $90 and $120
   - Line 1: 2 × $90 = $180
   - Line 2: 3 × $120 = $360
   - Subtotal: $540

### Success Criteria:
- ✅ Price list changes without clearing items
- ✅ All unit prices update automatically
- ✅ Totals recalculate
- ✅ No data loss

---

## ✅ Test Scenario 6: Form Submission (2 min)

### Expected Behavior:
1. Form submitted successfully
2. Invoice created with selected prices
3. Redirects to invoice list

### Test Steps:
1. Fill in form completely:
   - Select Customer (required)
   - Select Branch (required)
   - Price List: Wholesale (required)
   - Add 1-2 line items (prices auto-populated)
   - Enter Tax Rate (e.g., 5%)
2. Click "Save Invoice" button
3. Watch for:
   - Success message (if UI has one)
   - Redirect to `/invoices` (invoice list)
   - New invoice appears in list

### Success Criteria:
- ✅ Form validates required fields
- ✅ No errors on submission
- ✅ Redirects to invoice list
- ✅ New invoice visible with correct prices

---

## ✅ Test Scenario 7: Browser Console Checks (1 min)

### Expected Behavior:
- No JavaScript errors in console
- Debug logs showing price loading
- Network calls to correct endpoints

### Test Steps:
1. Open Browser DevTools (F12)
2. Go to Console tab
3. Reload form
4. Change price list
5. Look for:
   - No red error messages
   - See logs like: "Items loaded for price list: [...]"
   - No 404 errors in Network tab

### Success Criteria:
- ✅ No JavaScript errors
- ✅ Debug logs show data loading
- ✅ Network calls successful (200 status)
- ✅ No failed API calls

---

## ✅ Test Scenario 8: Edit Existing Invoice (Optional, 3 min)

### Expected Behavior:
1. Open existing invoice
2. Form pre-fills with original price list and prices
3. Can update while maintaining price consistency

### Test Steps:
1. Create invoice with Retail pricing (Scenario 6)
2. Navigate to `/invoices` (invoice list)
3. Find newly created invoice
4. Click Edit button
5. Form should load with:
   - Original price list selected
   - Original prices visible
   - Ability to add more items or adjust quantities
6. Change price list to Wholesale
7. See prices update
8. Save changes

### Success Criteria:
- ✅ Existing invoice loads correctly
- ✅ Original prices preserved
- ✅ Can change price list and see prices update
- ✅ Save updates invoice correctly

---

## 🐛 Troubleshooting

### Problem: Price List dropdown is empty
**Solution:**
- Check if API is running
- Check Network tab in DevTools for GET /api/pricelist
- Verify price lists exist in database
- Check console for API errors

### Problem: Items don't load when price list selected
**Solution:**
- Check Network tab for GET /api/itemprice/pricelist/{id}/items
- Verify response status is 200
- Check if items have prices for that price list
- Look at console for error messages

### Problem: Unit price doesn't auto-populate
**Solution:**
- Verify itemsWithPrices array is populated (check console)
- Check Network response for prices object
- Verify selected price list ID matches in prices object
- Clear browser cache and reload

### Problem: Prices don't update when switching price lists
**Solution:**
- Wait 2-3 seconds for items to load (network latency)
- Check console for loading status messages
- Verify Network tab shows successful requests
- Try changing price list again

### Problem: Form won't submit
**Solution:**
- Check all required fields filled:
  - Customer (required)
  - Branch (required)
  - Price List (required) ← Make sure this is filled!
  - At least one line item
- Look for validation error messages
- Check browser console for JavaScript errors

---

## 📊 Sample Data to Use

### Test with these items:
| Item | SKU | Retail Price | Wholesale Price |
|------|-----|-------------|-----------------|
| Product A | SKU001 | $100 | $90 |
| Product B | SKU002 | $150 | $120 |
| Product C | SKU003 | $200 | $160 |

### Test with these quantities:
- Product A: Qty 2-5
- Product B: Qty 1-3
- Product C: Qty 1-2

### Calculate expected totals:
**Retail Example:** 2 × $100 + 1 × $150 + 1 × $200 = $650
**Wholesale Example:** 2 × $90 + 1 × $120 + 1 × $160 = $530

---

## ✅ Quick Validation Checklist

Use this to mark off as you test:

### Loading
- [ ] Form loads without errors
- [ ] Price lists populated
- [ ] Default price list pre-selected
- [ ] Items loaded with prices

### Interaction
- [ ] Can change price list
- [ ] Items update when list changed
- [ ] Prices shown in dropdowns
- [ ] Can add multiple line items

### Data
- [ ] Prices auto-populate correctly
- [ ] Prices match selected price list
- [ ] Unit price field is read-only
- [ ] Totals calculate correctly

### Submission
- [ ] Form validates required fields
- [ ] Can submit successfully
- [ ] Redirects to invoice list
- [ ] New invoice appears with correct prices

### Errors
- [ ] No console errors
- [ ] API calls successful
- [ ] Error handling works (try disabling network)
- [ ] Form recovers from errors gracefully

---

## 📝 Test Report Template

```
Test Date: ___________
Tester: ___________
Browser: ___________

Scenario 1: Default Selection - [ ] PASS  [ ] FAIL
  Details: _________________________________

Scenario 2: Price List Change - [ ] PASS  [ ] FAIL
  Details: _________________________________

Scenario 3: Auto-Price Population - [ ] PASS  [ ] FAIL
  Details: _________________________________

Scenario 4: Multiple Items - [ ] PASS  [ ] FAIL
  Details: _________________________________

Scenario 5: Switch Pricing Mid-Entry - [ ] PASS  [ ] FAIL
  Details: _________________________________

Scenario 6: Form Submission - [ ] PASS  [ ] FAIL
  Details: _________________________________

Scenario 7: Console/Network - [ ] PASS  [ ] FAIL
  Details: _________________________________

Overall Status: [ ] ALL PASS  [ ] SOME ISSUES  [ ] MAJOR ISSUES

Issues Found:
1. ________________________________________
2. ________________________________________
3. ________________________________________

Notes:
_____________________________________________
_____________________________________________
```

---

## 🎯 Success Criteria Summary

**Form loads correctly** ✅
- Default price list visible
- Items shown with prices
- No console errors

**Price list selection works** ✅
- Can change from dropdown
- Items update with new prices
- Existing items update prices automatically

**Prices auto-populate** ✅
- Selecting item populates price
- Price matches selected price list
- Multiple items get different prices

**Form submission works** ✅
- Required fields validated
- priceListId sent to backend
- Invoice created with correct prices
- Redirects to invoice list

**No errors** ✅
- No JavaScript errors in console
- No API 404/500 errors
- Network calls succeed
- Error handling works

---

## 🚀 Next Steps After Testing

If all tests pass:
1. ✅ Implementation is complete and working
2. ✅ Ready for user acceptance testing
3. ✅ Ready for production deployment

If issues found:
1. Check console error messages
2. Check Network tab for API responses
3. Review code comments in component
4. Check backend logs for errors
5. Reach out for debugging support

---

**Estimated Total Testing Time: 15-20 minutes**

Good luck with testing! 🎉
