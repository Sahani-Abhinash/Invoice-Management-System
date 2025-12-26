import { Routes } from '@angular/router';
import { GrnListComponent } from './grn-list/grn-list.component';
import { GrnViewComponent } from './grn-view/grn-view.component';
import { GrnFormComponent } from './grn-form/grn-form.component';

export const GRN_ROUTES: Routes = [
    { path: '', component: GrnListComponent },
    { path: 'create', component: GrnFormComponent },
    { path: 'edit/:id', component: GrnFormComponent },
    { path: 'view/:id', component: GrnViewComponent }
];
