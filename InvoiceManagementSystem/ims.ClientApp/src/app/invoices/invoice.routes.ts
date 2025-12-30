import { Routes } from '@angular/router';
import { InvoiceListComponent } from './invoice-list/invoice-list.component';
import { InvoiceFormComponent } from './invoice-form/invoice-form.component';
import { InvoiceViewComponent } from './invoice-view/invoice-view.component';
import { PaymentRecordComponent } from './payment-record/payment-record.component';

export const INVOICE_ROUTES: Routes = [
    { path: '', component: InvoiceListComponent },
    { path: 'create', component: InvoiceFormComponent },
    { path: 'edit/:id', component: InvoiceFormComponent },
    { path: 'view/:id', component: InvoiceViewComponent },
    { path: 'payment/:id', component: PaymentRecordComponent }
];
