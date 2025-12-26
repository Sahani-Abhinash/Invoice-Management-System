import { Routes } from '@angular/router';
import { PurchaseOrderListComponent } from './purchase-order-list/purchase-order-list.component';
import { PurchaseOrderFormComponent } from './purchase-order-form/purchase-order-form.component';
import { PurchaseOrderViewComponent } from './purchase-order-view/purchase-order-view.component';

export const PURCHASE_ORDER_ROUTES: Routes = [
    { path: '', component: PurchaseOrderListComponent },
    { path: 'create', component: PurchaseOrderFormComponent },
    { path: 'edit/:id', component: PurchaseOrderFormComponent },
    { path: 'view/:id', component: PurchaseOrderViewComponent }
];
