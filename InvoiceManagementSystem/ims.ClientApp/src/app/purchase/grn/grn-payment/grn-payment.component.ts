import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { finalize } from 'rxjs/operators';
import { GrnService, GrnPaymentDetails, RecordPaymentDto, PaymentMethod } from '../grn.service';

@Component({
    selector: 'app-grn-payment',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, RouterModule],
    templateUrl: './grn-payment.component.html',
    styleUrls: ['./grn-payment.component.css']
})
export class GrnPaymentComponent implements OnInit {
    paymentForm: FormGroup;
    grnId: string | null = null;
    grnDetails: GrnPaymentDetails | null = null;
    isLoading = true;
    isSubmitting = false;
    successMessage = '';
    errorMessage = '';
    
    PaymentMethod = PaymentMethod;
    
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
        private grnService: GrnService,
        private route: ActivatedRoute,
        private router: Router,
        private cdr: ChangeDetectorRef
    ) {
        this.paymentForm = this.fb.group({
            amount: ['', [Validators.required, Validators.min(0.01)]],
            method: [PaymentMethod.Cash, Validators.required],
            dueDate: [new Date().toISOString().split('T')[0], Validators.required]
        });
    }

    ngOnInit(): void {
        this.route.paramMap.subscribe(params => {
            this.grnId = params.get('id');

            if (!this.grnId) {
                this.errorMessage = 'Missing GRN id in route.';
                this.grnDetails = null;
                this.isLoading = false;
                this.cdr.detectChanges();
                return;
            }

            this.errorMessage = '';
            this.loadGrnDetails();
        });
    }

    loadGrnDetails(): void {
        if (!this.grnId) {
            this.errorMessage = 'Missing GRN id in route.';
            this.grnDetails = null;
            this.isLoading = false;
            this.cdr.detectChanges();
            return;
        }

        this.isLoading = true;

        this.grnService.getPaymentDetails(this.grnId).pipe(
            finalize(() => {
                this.isLoading = false;
                this.cdr.detectChanges();
            })
        ).subscribe({
            next: (details) => {
                this.grnDetails = details;
                // Auto-fill with balance due amount
                this.paymentForm.patchValue({
                    amount: details.balanceDue
                });
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
                console.error('Failed to load GRN details', err);
                this.errorMessage = 'Failed to load GRN details';
                this.grnDetails = null;
                this.cdr.detectChanges();
            }
        });
    }

    recordPayment(): void {
        if (!this.paymentForm.valid || !this.grnId || !this.grnDetails) {
            return;
        }

        this.isSubmitting = true;
        this.successMessage = '';
        this.errorMessage = '';

        const paymentDto: RecordPaymentDto = {
            amount: this.paymentForm.get('amount')?.value,
            method: this.paymentForm.get('method')?.value,
            dueDate: this.paymentForm.get('dueDate')?.value
        };

        this.grnService.recordPayment(this.grnId, paymentDto).subscribe({
            next: (payment) => {
                const methodName = this.grnService.getPaymentMethodName(payment.method);
                this.successMessage = `Payment of $${payment.amount.toFixed(2)} via ${methodName} recorded successfully!`;
                this.isSubmitting = false;
                this.paymentForm.reset({ method: PaymentMethod.Cash, dueDate: new Date().toISOString().split('T')[0] });
                this.cdr.detectChanges();
                
                // Show option to view receipt
                if (confirm('Payment recorded successfully! Would you like to view the payment receipt?')) {
                    this.router.navigate(['/grns', this.grnId, 'payment-receipt']);
                } else {
                    // Reload GRN details
                    setTimeout(() => {
                        this.loadGrnDetails();
                    }, 1500);
                }
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
        return this.grnDetails ? this.grnDetails.balanceDue > 0 : false;
    }

    getPaymentStatusColor(): string {
        if (!this.grnDetails) return 'text-secondary';
        
        switch (this.grnDetails.paymentStatus) {
            case 'FullyPaid':
                return 'text-success';
            case 'PartiallyPaid':
                return 'text-warning';
            case 'Unpaid':
                return 'text-danger';
            default:
                return 'text-secondary';
        }
    }

    getPaymentMethodName(method: PaymentMethod): string {
        return this.grnService.getPaymentMethodName(method);
    }

    goBack(): void {
        this.router.navigate(['/grns']);
    }
}
