import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule, Router } from '@angular/router';
import { InvoiceService, Invoice, PaymentMethod } from '../invoice.service';
import { BranchService } from '../../companies/branch/branch.service';
import { ItemService, Item } from '../../product/items/item.service';
import { CustomerService, Customer } from '../../companies/customer/customer.service';
import { AddressService, Address } from '../../Master/geography/address/address.service';
import { PriceListService } from '../../product/price-list/price-list.service';
import { forkJoin } from 'rxjs';

@Component({
    selector: 'app-invoice-view',
    standalone: true,
    imports: [CommonModule, RouterModule],
    templateUrl: './invoice-view.component.html',
    styleUrls: ['./invoice-view.component.css']
})
export class InvoiceViewComponent implements OnInit {
    invoice: Invoice | null = null;
    isLoading = true;
    branchName = '';
    priceListName = '';
    itemsMap: Map<string, Item> = new Map();
    customer: Customer | null = null;
    shippingAddress: Address | null = null;

    constructor(
        private invoiceService: InvoiceService,
        private branchService: BranchService,
        private itemService: ItemService,
        private customerService: CustomerService,
        private addressService: AddressService,
        private priceListService: PriceListService,
        private route: ActivatedRoute,
        private router: Router,
        private cdr: ChangeDetectorRef
    ) { }

    ngOnInit(): void {
        const id = this.route.snapshot.paramMap.get('id');
        if (id) {
            this.loadData(id);
        }
    }

    loadData(id: string): void {
        this.isLoading = true;
        forkJoin({
            invoice: this.invoiceService.getById(id),
            items: this.itemService.getAll()
        }).subscribe({
            next: (data) => {
                this.invoice = data.invoice;
                console.log('Invoice data received:', data.invoice);
                data.items.forEach(i => {
                    if (i.id) this.itemsMap.set(i.id.toLowerCase(), i);
                });

                // Load branch, customer, and shipping address in parallel
                const requests: any = {};
                if (this.invoice.branchId) {
                    requests.branch = this.branchService.getById(this.invoice.branchId);
                }
                if (this.invoice.customerId) {
                    requests.customer = this.customerService.getById(this.invoice.customerId);
                    requests.addresses = this.addressService.getForOwner('Customer', this.invoice.customerId);
                }
                if (this.invoice.priceListId) {
                    console.log('Fetching price list with ID:', this.invoice.priceListId);
                    requests.priceList = this.priceListService.getById(this.invoice.priceListId);
                }

                if (Object.keys(requests).length > 0) {
                    forkJoin(requests).subscribe({
                        next: (result: any) => {
                            console.log('Additional data loaded:', result);
                            if (result.branch) {
                                this.branchName = result.branch.name;
                            }
                            if (result.priceList) {
                                console.log('Price list loaded:', result.priceList);
                                this.priceListName = result.priceList.name;
                            }
                            if (result.customer) {
                                this.customer = result.customer;
                            }
                            if (result.addresses && result.addresses.length > 0) {
                                // Get the primary address or first address
                                this.shippingAddress = result.addresses.find((a: any) => a.isPrimary) || result.addresses[0];
                            }
                            this.isLoading = false;
                            this.cdr.detectChanges();
                        },
                        error: (err) => {
                            console.error('Error loading additional data:', err);
                            this.isLoading = false;
                            this.cdr.detectChanges();
                        }
                    });
                } else {
                    this.isLoading = false;
                    this.cdr.detectChanges();
                }
            },
            error: (err) => {
                console.error('Error loading invoice:', err);
                this.isLoading = false;
                this.cdr.detectChanges();
            }
        });
    }

    getItemName(id: string): string {
        return this.itemsMap.get(id.toLowerCase())?.name || 'Unknown Item';
    }

    getItemSku(id: string): string {
        return this.itemsMap.get(id.toLowerCase())?.sku || '-';
    }

    getPaymentStatusClass(): string {
        if (!this.invoice) return 'text-secondary';
        
        switch (this.invoice.paymentStatus) {
            case 'FullyPaid':
                return 'badge bg-success';
            case 'PartiallyPaid':
                return 'badge bg-warning';
            case 'Unpaid':
                return 'badge bg-danger';
            case 'Overdue':
                return 'badge bg-dark';
            default:
                return 'badge bg-secondary';
        }
    }

    recordPayment(): void {
        if (this.invoice) {
            this.router.navigate(['/invoices/payment', this.invoice.id]);
        }
    }

    getPaymentMethodName(method: PaymentMethod): string {
        return this.invoiceService.getPaymentMethodName(method);
    }

    printInvoice(): void {
        window.print();
    }
}
