import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CountryListComponent } from './country/country-list/country-list.component';
import { CountryFormComponent } from './country/country-form/country-form.component';
import { StateListComponent } from './state/state-list/state-list.component';
import { StateFormComponent } from './state/state-form/state-form.component';
import { CityListComponent } from './city/city-list/city-list.component';
import { CityFormComponent } from './city/city-form/city-form.component';
import { PostalCodeListComponent } from './postalcode/postalcode-list/postalcode-list.component';
import { PostalCodeFormComponent } from './postalcode/postalcode-form/postalcode-form.component';

const routes: Routes = [
  { path: '', redirectTo: 'countries', pathMatch: 'full' },
  { path: 'countries', component: CountryListComponent },
  { path: 'countries/create', component: CountryFormComponent },
  { path: 'countries/edit/:id', component: CountryFormComponent },

  { path: 'states', component: StateListComponent },
  { path: 'states/create', component: StateFormComponent },
  { path: 'states/edit/:id', component: StateFormComponent },

  { path: 'cities', component: CityListComponent },
  { path: 'cities/create', component: CityFormComponent },
  { path: 'cities/edit/:id', component: CityFormComponent },

  { path: 'postalcodes', component: PostalCodeListComponent },
  { path: 'postalcodes/create', component: PostalCodeFormComponent },
  { path: 'postalcodes/edit/:id', component: PostalCodeFormComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class GeographyRoutingModule {}
