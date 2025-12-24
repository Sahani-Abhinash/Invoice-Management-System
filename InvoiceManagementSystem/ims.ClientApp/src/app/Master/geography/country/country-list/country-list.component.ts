import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { CountryService, Country } from '../country.service';

@Component({
  selector: 'app-country-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './country-list.component.html',
  styleUrls: []
})
export class CountryListComponent implements OnInit {
  countries: Country[] = [];

  constructor(
    private countryService: CountryService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void { this.loadCountries(); }

  loadCountries() {
    this.countryService.getAll().subscribe(data => { this.countries = data; this.cdr.detectChanges(); },
      error => console.error('Error loading countries:', error));
  }

  deleteCountry(id: string) {
    if (confirm('Delete this country?')) { this.countryService.delete(id).subscribe(() => this.loadCountries()); }
  }

  editCountry(id: string) { this.router.navigate(['/geography/countries/edit', id]); }
  createCountry() { this.router.navigate(['/geography/countries/create']); }
}
