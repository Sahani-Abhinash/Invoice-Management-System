import { Routes } from '@angular/router';
import { ItemListComponent } from './items/item-list/item-list.component';
import { ItemFormComponent } from './items/item-form/item-form.component';
import { ItemPriceListComponent } from './item-price/item-price-list/item-price-list.component';
import { ItemPriceFormComponent } from './item-price/item-price-form/item-price-form.component';
import { PriceListListComponent } from './price-list/price-list-list/price-list-list.component';
import { PriceListFormComponent } from './price-list/price-list-form/price-list-form.component';
import { ProductPropertyListComponent } from './product-property/product-property-list/product-property-list.component';
import { ProductPropertyFormComponent } from './product-property/product-property-form/product-property-form.component';
import { PropertyAttributeListComponent } from './property-attribute/property-attribute-list/property-attribute-list.component';
import { PropertyAttributeFormComponent } from './property-attribute/property-attribute-form/property-attribute-form.component';

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
    { path: 'pricelists/edit/:id', component: PriceListFormComponent },
    { path: 'properties', component: ProductPropertyListComponent },
    { path: 'properties/create', component: ProductPropertyFormComponent },
    { path: 'properties/edit/:id', component: ProductPropertyFormComponent },
    { path: 'attributes', component: PropertyAttributeListComponent },
    { path: 'attributes/create', component: PropertyAttributeFormComponent },
    { path: 'attributes/edit/:id', component: PropertyAttributeFormComponent }
];
