import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { finalize } from 'rxjs/operators';
import { InvoiceService, InvoicePaymentDetails, RecordPaymentDto, PaymentMethod } from '../invoice.service';

@Component({
    selector: 'app-payment-record',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, RouterModule],
    templateUrl: './payment-record.component.html',
    styleUrls: ['./payment-record.component.css']
})
export class PaymentRecordComponent implements OnInit {
    paymentForm: FormGroup;
    invoiceId: string | null = null;
    invoiceDetails: InvoicePaymentDetails | null = null;
    isLoading = true;
    isSubmitting = false;
    successMessage = '';
    errorMessage = '';
    
    PaymentMethod = PaymentMethod; // Expose enum to template
    
    paymentMethods = [
        { label: 'Cash', value: PaymentMethod.Cash },
        { label: 'Credit/Debit Card', value: PaymentMethod.Card },
        { label: 'Bank Transfer', value: PaymentMethod.BankTransfer },
        { label: 'Cheque', value: PaymentMethod.Cheque },
        { label: 'Mobile Payment', value: PaymentMethod.Mobile },
        { label: 'PayPal', value: PaymentMethod.Paypal },
        { label: 'Other', value: PaymentMethod.Other }
    ];

    constructor(
        private fb: FormBuilder,
        private invoiceService: InvoiceService,
        private route: ActivatedRoute,
        private router: Router,
        private cdr: ChangeDetectorRef
    ) {
        this.paymentForm = this.fb.group({
            amount: ['', [Validators.required, Validators.min(0.01)]],
            method: [PaymentMethod.Cash, Validators.required]
        });
    }

    ngOnInit(): void {
        this.route.paramMap.subscribe(params => {
            this.invoiceId = params.get('id');

            if (!this.invoiceId) {
                this.errorMessage = 'Missing invoice id in route.';
                this.invoiceDetails = null;
                this.isLoading = false;
                this.cdr.detectChanges();
                return;
            }

            this.errorMessage = '';
            this.loadInvoiceDetails();
        });
    }

    loadInvoiceDetails(): void {
        if (!this.invoiceId) {
            this.errorMessage = 'Missing invoice id in route.';
            this.invoiceDetails = null;
            this.isLoading = false;
            this.cdr.detectChanges();
            return;
        }

        this.isLoading = true;

        this.invoiceService.getPaymentDetails(this.invoiceId).pipe(
            finalize(() => {
                this.isLoading = false;
                this.cdr.detectChanges();
            })
        ).subscribe({
            next: (details) => {
                this.invoiceDetails = details;
                // Set max payment to balance due
                this.paymentForm.get('amount')?.setValidators([
                    Validators.required,
                    Validators.min(0.01),
                    Validators.max(details.balanceDue)
                ]);
                this.paymentForm.get('amount')?.updateValueAndValidity();
                this.cdr.detectChanges();
            },
            error: (err) => {
                console.error('Failed to load invoice details', err);
                this.errorMessage = 'Failed to load invoice details';
                this.invoiceDetails = null;
                this.cdr.detectChanges();
            }
        });
    }

    recordPayment(): void {
        if (!this.paymentForm.valid || !this.invoiceId || !this.invoiceDetails) {
            return;
        }

        this.isSubmitting = true;
        this.successMessage = '';
        this.errorMessage = '';

        const paymentDto: RecordPaymentDto = {
            amount: this.paymentForm.get('amount')?.value,
            method: this.paymentForm.get('method')?.value
        };

        this.invoiceService.recordPayment(this.invoiceId, paymentDto).subscribe({
            next: (payment) => {
                const methodName = this.invoiceService.getPaymentMethodName(payment.method);
                this.successMessage = `Payment of $${payment.amount.toFixed(2)} via ${methodName} recorded successfully!`;
                this.isSubmitting = false;
                this.paymentForm.reset({ method: PaymentMethod.Cash });
                this.cdr.detectChanges();
                
                // Reload invoice details
                setTimeout(() => {
                    this.loadInvoiceDetails();
                }, 1500);
            },
            error: (err) => {
                this.errorMessage = err.error?.message || err.error || 'Failed to record payment';
                this.isSubmitting = false;
                this.cdr.detectChanges();
                console.error('Payment recording failed', err);
            }
        });
    }

    canMakePayment(): boolean {
        return this.invoiceDetails ? this.invoiceDetails.balanceDue > 0 : false;
    }

    getPaymentStatusColor(): string {
        if (!this.invoiceDetails) return 'text-secondary';
        
        switch (this.invoiceDetails.paymentStatus) {
            case 'FullyPaid':
                return 'text-success';
            case 'PartiallyPaid':
                return 'text-warning';
            case 'Unpaid':
                return 'text-danger';
            case 'Overdue':
                return 'text-dark';
            default:
                return 'text-secondary';
        }
    }

    getPaymentMethodName(method: PaymentMethod): string {
        return this.invoiceService.getPaymentMethodName(method);
    }

    goBack(): void {
        this.router.navigate(['/invoices']);
    }
}
