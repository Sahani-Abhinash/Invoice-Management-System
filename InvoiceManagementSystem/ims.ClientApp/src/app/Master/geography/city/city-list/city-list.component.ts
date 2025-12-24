import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { CityService, City } from '../city.service';

@Component({
  selector: 'app-city-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './city-list.component.html',
  styleUrls: []
})
export class CityListComponent implements OnInit {
  cities: City[] = [];

  constructor(
    private cityService: CityService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void { this.loadCities(); }

  loadCities() {
    this.cityService.getAll().subscribe(data => { this.cities = data; this.cdr.detectChanges(); },
      error => console.error('Error loading cities:', error));
  }

  deleteCity(id: string) {
    if (confirm('Delete this city?')) { this.cityService.delete(id).subscribe(() => this.loadCities()); }
  }

  editCity(id: string) { this.router.navigate(['/geography/cities/edit', id]); }
  createCity() { this.router.navigate(['/geography/cities/create']); }

  stateName(c: City): string { return (c as any)?.state?.name ?? '—'; }
}
