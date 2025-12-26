import { Routes } from '@angular/router';
import { ItemListComponent } from './items/item-list/item-list.component';
import { ItemFormComponent } from './items/item-form/item-form.component';
import { ItemPriceListComponent } from './item-price/item-price-list/item-price-list.component';
import { ItemPriceFormComponent } from './item-price/item-price-form/item-price-form.component';
import { PriceListListComponent } from './price-list/price-list-list/price-list-list.component';
import { PriceListFormComponent } from './price-list/price-list-form/price-list-form.component';

export const PRODUCT_ROUTES: Routes = [
    { path: '', redirectTo: 'items', pathMatch: 'full' },
    { path: 'items', component: ItemListComponent },
    { path: 'items/create', component: ItemFormComponent },
    { path: 'items/edit/:id', component: ItemFormComponent },
    { path: 'prices', component: ItemPriceListComponent },
    { path: 'prices/create', component: ItemPriceFormComponent },
    { path: 'prices/edit/:id', component: ItemPriceFormComponent },
    { path: 'pricelists', component: PriceListListComponent },
    { path: 'pricelists/create', component: PriceListFormComponent },
    { path: 'pricelists/edit/:id', component: PriceListFormComponent }
];
