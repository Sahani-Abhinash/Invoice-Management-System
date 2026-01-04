import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { InvoiceService, CreateInvoiceDto } from '../invoice.service';
import { BranchService, Branch } from '../../companies/branch/branch.service';
import { ItemService, Item } from '../../product/items/item.service';
import { StockService, Stock } from '../../warehouse/stock.service';
import { CustomerService, Customer } from '../../companies/customer/customer.service';
import { AccountingService, Account } from '../../accounting/accounting.service';
import { PriceListService, PriceList } from '../../product/price-list/price-list.service';
import { ItemPriceService } from '../../product/item-price/item-price.service';
import { forkJoin, catchError, of } from 'rxjs';

@Component({
    selector: 'app-invoice-form',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, RouterModule],
    templateUrl: './invoice-form.component.html',
    styleUrls: ['./invoice-form.component.css']
})
export class InvoiceFormComponent implements OnInit {
    invoiceForm: FormGroup;
    isEdit = false;
    invoiceId: string | null = null;
    isLoading = true;
    branches: Branch[] = [];
    customers: Customer[] = [];
    items: Item[] = [];
    stocks: Stock[] = [];
    accounts: Account[] = [];
    priceLists: PriceList[] = [];
    itemsWithPrices: any[] = [];
    selectedPriceListId: string | null = null;
    selectedPriceListName: string | null = null;
    branchStockMap: { [key: string]: { [itemId: string]: number } } = {};
    today = new Date().toISOString().split('T')[0];

    constructor(
        private fb: FormBuilder,
        private invoiceService: InvoiceService,
        private branchService: BranchService,
        private customerService: CustomerService,
        private itemService: ItemService,
        private stockService: StockService,
        private accountingService: AccountingService,
        private priceListService: PriceListService,
        private itemPriceService: ItemPriceService,
        private route: ActivatedRoute,
        private router: Router,
        private cdr: ChangeDetectorRef
    ) {
        this.invoiceForm = this.fb.group({
            reference: ['', Validators.required],
            invoiceDate: [this.today, Validators.required],
            dueDate: [''],
            customerId: ['', Validators.required],
            branchId: ['', Validators.required],
            priceListId: ['', Validators.required],
            taxRate: [0, [Validators.required, Validators.min(0)]],
            lines: this.fb.array([], this.totalStockValidator())
        });

        // Watch for branch changes to refresh item lists if needed
        this.invoiceForm.get('branchId')?.valueChanges.subscribe(() => {
            console.log('Branch changed, re-validating stock...');
            this.validateAllLines();
            this.cdr.detectChanges();
        });
    }

    ngOnInit(): void {
        this.invoiceId = this.route.snapshot.paramMap.get('id');
        this.isEdit = !!this.invoiceId;
        this.loadInitialData();
    }

    get lines(): FormArray {
        return this.invoiceForm.get('lines') as FormArray;
    }

    loadInitialData(): void {
        this.isLoading = true;
        console.log('Loading initial data for invoice form...');

        const requests: any = {
            branches: this.branchService.getAll().pipe(catchError(err => { console.error('Failed to load branches', err); return of([]); })),
            customers: this.customerService.getAll().pipe(catchError(err => { console.error('Failed to load customers', err); return of([]); })),
            items: this.itemService.getAll().pipe(catchError(err => { console.error('Failed to load items', err); return of([]); })),
            stocks: this.stockService.getAll().pipe(catchError(err => { console.error('Failed to load stocks', err); return of([]); })),
            accounts: this.accountingService.getAllAccounts().pipe(catchError(err => { console.error('Failed to load accounts', err); return of([]); })),
            priceLists: this.priceListService.getAll().pipe(catchError(err => { console.error('Failed to load price lists', err); return of([]); }))
        };

        if (this.isEdit && this.invoiceId) {
            requests.invoice = this.invoiceService.getById(this.invoiceId).pipe(catchError(err => { console.error('Failed to load invoice', err); return of(null); }));
        }

        forkJoin(requests).subscribe({
            next: (data: any) => {
                console.log('Data loaded successfully:', {
                    branches: data.branches?.length,
                    items: data.items?.length,
                    stocks: data.stocks?.length,
                    priceLists: data.priceLists?.length,
                    hasInvoice: !!data.invoice
                });

                this.branches = data.branches || [];
                this.items = data.items || [];
                this.stocks = data.stocks || [];
                this.accounts = data.accounts || [];
                this.priceLists = data.priceLists || [];
                this.customers = (data.customers || []).map((c: Customer) => ({
                    ...c,
                    id: (c.id || '').toString().toLowerCase()
                }));
                this.processStocks(this.stocks);

                // Set up price list dropdown listener after priceLists are loaded
                this.invoiceForm.get('priceListId')?.valueChanges.subscribe((priceListId) => {
                    if (priceListId) {
                        this.onPriceListSelected(priceListId);
                    }
                });

                // Auto-select default price list if available
                const defaultPriceList = this.priceLists.find(p => p.isDefault);
                if (defaultPriceList) {
                    this.invoiceForm.patchValue({ priceListId: defaultPriceList.id });
                    this.selectedPriceListId = defaultPriceList.id;
                    this.selectedPriceListName = defaultPriceList.name;
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

    onPriceListSelected(priceListId: string): void {
        if (!priceListId) {
            this.itemsWithPrices = [];
            this.selectedPriceListId = null;
            this.selectedPriceListName = null;
            return;
        }

        this.selectedPriceListId = priceListId;
        
        // Get the name of the selected price list
        const selectedPriceList = this.priceLists.find(p => p.id === priceListId);
        this.selectedPriceListName = selectedPriceList?.name || null;
        console.log('Loading items for price list:', priceListId, 'Name:', this.selectedPriceListName);

        this.itemPriceService.getItemsWithPricesForPriceList(priceListId).subscribe({
            next: (items: any[]) => {
                console.log('Items loaded for price list:', items);
                this.itemsWithPrices = items;
                
                // Reset quantities and prices for existing line items
                this.lines.controls.forEach((control) => {
                    const itemId = control.get('itemId')?.value;
                    if (itemId && this.selectedPriceListName) {
                        // Auto-populate price from new price list using the name
                        const itemWithPrices = this.itemsWithPrices.find(i => i.id === itemId);
                        if (itemWithPrices && itemWithPrices.prices && itemWithPrices.prices[this.selectedPriceListName]) {
                            control.patchValue({ 
                                unitPrice: itemWithPrices.prices[this.selectedPriceListName] 
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

    processStocks(stocks: Stock[]): void {
        console.log('Starting processStocks with:', stocks?.length, 'records');
        this.branchStockMap = {};
        if (!stocks) return;

        stocks.forEach((s, index) => {
            if (!s.warehouse || !s.item) {
                console.warn(`Stock record at index ${index} missing warehouse or item:`, s);
                return;
            }

            const bId = (s.warehouse.branchId || '').toLowerCase();
            const iId = (s.item.id || '').toLowerCase();
            const qty = s.quantity || 0;

            if (!bId || !iId) {
                console.warn(`Stock record at index ${index} missing IDs: bId=${bId}, iId=${iId}`);
                return;
            }

            if (!this.branchStockMap[bId]) {
                this.branchStockMap[bId] = {};
            }

            // Diagnostic: Check if these IDs actually exist in our local lists
            const branchExists = this.branches.some(b => (b.id || '').toLowerCase() === bId);
            const itemExists = this.items.some(i => (i.id || '').toLowerCase() === iId);

            if (!branchExists) console.warn(`Stock for Item ${s.item.name} refers to unknown Branch ID: ${bId}`);
            if (!itemExists) console.warn(`Stock record refers to unknown Item ID: ${iId}`);

            if (!this.branchStockMap[bId][iId]) {
                this.branchStockMap[bId][iId] = 0;
            }

            this.branchStockMap[bId][iId] += qty;
            console.log(`Mapped Item: ${s.item.name} (${iId}) to Branch ID: ${bId} with Qty: ${qty}`);
        });
        console.log('Final branchStockMap:', this.branchStockMap);
    }

    getAvailableStock(itemId: string): number {
        console.log('Getting available stock for itemId:', itemId);
        const branchId = (this.invoiceForm.get('branchId')?.value || '').toLowerCase();
        if (!branchId || !itemId) return 0;

        itemId = itemId.toLowerCase();
        return this.branchStockMap[branchId]?.[itemId] || 0;
    }

    getRemainingStock(itemId: string, excludeIndex: number = -1): number {
        const totalAvailable = this.getAvailableStock(itemId);

        let used = 0;
        this.lines.controls.forEach((control, index) => {
            if (index !== excludeIndex) {
                const lineItemId = control.get('itemId')?.value;
                if (lineItemId && lineItemId.toLowerCase() === itemId.toLowerCase()) {
                    used += (control.get('quantity')?.value || 0);
                }
            }
        });

        return totalAvailable - used;
    }

    getFilteredItems(): Item[] {
        const branchId = (this.invoiceForm.get('branchId')?.value || '').toLowerCase();
        if (!branchId) return [];

        return this.items.filter(item => {
            const stock = this.getAvailableStock(item.id || '');
            return stock > 0;
        });
    }

    patchForm(invoice: any): void {
        if (!invoice) return;

        this.invoiceForm.patchValue({
            reference: invoice.reference,
            invoiceDate: invoice.invoiceDate ? invoice.invoiceDate.split('T')[0] : this.today,
            dueDate: invoice.dueDate ? invoice.dueDate.split('T')[0] : '',
            customerId: (invoice.customerId || '').toString().toLowerCase(),
            branchId: (invoice.branchId || '').toString().toLowerCase(),
            taxRate: invoice.subTotal > 0 ? (invoice.tax / invoice.subTotal) * 100 : 0
        });

        // Clear existing lines
        while (this.lines.length) {
            this.lines.removeAt(0);
        }

        if (invoice.lines && invoice.lines.length > 0) {
            invoice.lines.forEach((line: any) => {
                this.addLine(line);
            });
        }
    }

    addLine(item?: any): void {
        // Determine initial unit price from itemsWithPrices or item parameter
        let initialPrice = item?.unitPrice || 0;
        
        if (!initialPrice && item?.itemId && this.selectedPriceListName) {
            // Look up price from itemsWithPrices for selected price list using name
            const itemWithPrices = this.itemsWithPrices.find(i => i.id === item.itemId);
            if (itemWithPrices && itemWithPrices.prices && itemWithPrices.prices[this.selectedPriceListName]) {
                initialPrice = itemWithPrices.prices[this.selectedPriceListName];
            }
        }

        const lineForm = this.fb.group({
            itemId: [(item?.itemId || '').toString().toLowerCase(), Validators.required],
            quantity: [item?.quantity || 1, [Validators.required, Validators.min(1)]],
            unitPrice: [{ value: initialPrice, disabled: true }, [Validators.required, Validators.min(0)]]
        });

        // When item changes, auto-populate price from selected price list using name
        lineForm.get('itemId')?.valueChanges.subscribe((itemId) => {
            if (itemId && this.selectedPriceListName) {
                const itemWithPrices = this.itemsWithPrices.find(i => i.id === itemId);
                if (itemWithPrices && itemWithPrices.prices && itemWithPrices.prices[this.selectedPriceListName]) {
                    lineForm.patchValue({ 
                        unitPrice: itemWithPrices.prices[this.selectedPriceListName] 
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

    private validateAllLines(): void {
        this.lines.controls.forEach(c => {
            const itemId = c.get('itemId')?.value;
            const available = this.getAvailableStock(itemId);

            let totalUsed = 0;
            this.lines.controls.forEach(other => {
                if (other.get('itemId')?.value === itemId) {
                    totalUsed += (other.get('quantity')?.value || 0);
                }
            });

            if (itemId && totalUsed > available) {
                c.get('quantity')?.setErrors({ insufficientStock: { available, totalUsed } });
            } else {
                const existing = c.get('quantity')?.errors;
                if (existing) {
                    delete existing['insufficientStock'];
                    if (Object.keys(existing).length === 0) {
                        c.get('quantity')?.setErrors(null);
                    } else {
                        c.get('quantity')?.setErrors(existing);
                    }
                }
            }
        });
    }

    private totalStockValidator(): ValidatorFn {
        return (control: AbstractControl): ValidationErrors | null => {
            const lines = control as FormArray;
            const usageMap: { [itemId: string]: number } = {};

            lines.controls.forEach(c => {
                const iId = c.get('itemId')?.value;
                if (iId) {
                    usageMap[iId] = (usageMap[iId] || 0) + (c.get('quantity')?.value || 0);
                }
            });

            for (const iId in usageMap) {
                const available = this.getAvailableStock(iId);
                if (usageMap[iId] > available) {
                    return { overStock: true };
                }
            }
            return null;
        };
    }

    removeLine(index: number): void {
        this.lines.removeAt(index);
        this.validateAllLines();
        this.cdr.detectChanges();
    }

    onItemChange(index: number): void {
        const line = this.lines.at(index);
        const itemId = line.get('itemId')?.value;
        const normalizedId = (itemId || '').toString().toLowerCase();
        const selectedItem = this.items.find(i => (i.id || '').toLowerCase() === normalizedId);

        if (selectedItem) {
            const price =
                selectedItem.price ??
                (selectedItem as any).unitPrice ??
                (selectedItem as any).salePrice ??
                0;

            line.patchValue({
                unitPrice: price
            });
        }

        this.validateAllLines();
    }

    getSubTotal(): number {
        return this.lines.controls.reduce((sum, control) => {
            const q = control.get('quantity')?.value || 0;
            const p = control.get('unitPrice')?.value || 0;
            return sum + (q * p);
        }, 0);
    }

    getTaxAmount(): number {
        const rate = this.invoiceForm.get('taxRate')?.value || 0;
        return this.getSubTotal() * (rate / 100);
    }

    getTotal(): number {
        return this.getSubTotal() + this.getTaxAmount();
    }

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
            priceListId: formValue.priceListId,
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

    incrementQuantity(index: number): void {
        const line = this.lines.at(index);
        if (line) {
            const currentQty = line.get('quantity')?.value || 0;
            line.patchValue({ quantity: currentQty + 1 });
        }
    }

    decrementQuantity(index: number): void {
        const line = this.lines.at(index);
        if (line) {
            const currentQty = line.get('quantity')?.value || 0;
            if (currentQty > 1) {
                line.patchValue({ quantity: currentQty - 1 });
            }
        }
    }}