import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { StateService } from '../state.service';
import { Country, CountryService } from '../../country/country.service';

@Component({
  selector: 'app-state-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './state-form.component.html',
  styleUrls: []
})
export class StateFormComponent implements OnInit {
  form!: FormGroup;
  id: string | null = null;
  countries: Country[] = [];
  private pendingCountryId: string | null = null;
  private cdr = inject(ChangeDetectorRef);

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private stateService: StateService,
    private countryService: CountryService
  ) {
    this.form = this.fb.group({
      name: ['', Validators.required],
      countryId: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.id = this.route.snapshot.paramMap.get('id');
    this.loadCountries();

    if (this.id) {
      this.stateService.getById(this.id).subscribe(data => {
        this.pendingCountryId = this.extractCountryId(data);
        this.form.patchValue({
          name: (data as any)?.name ?? '',
          countryId: this.pendingCountryId ?? ''
        });
        this.applyPendingCountryId();
      });
    }
  }

  loadCountries() {
    this.countryService.getAll().subscribe(data => {
      this.countries = data.map(c => ({ ...c, id: String((c as any).id) } as Country));
      this.cdr.detectChanges();
      this.applyPendingCountryId();
    }, error => console.error('Error loading countries:', error));
  }

  private extractCountryId(data: any): string | null {
    const idCandidate = data?.countryId ?? data?.CountryId ?? data?.country?.id;
    if (!idCandidate) return null;
    return String(idCandidate);
  }

  private applyPendingCountryId() {
    if (this.pendingCountryId && this.countries.length) {
      this.form.patchValue({ countryId: this.pendingCountryId });
      this.pendingCountryId = null;
    }
  }

  save() {
    if (this.form.invalid) return;

    if (this.id) {
      this.stateService.update(this.id, this.form.value).subscribe(() => this.router.navigate(['/geography/states']));
    } else {
      this.stateService.create(this.form.value).subscribe(() => this.router.navigate(['/geography/states']));
    }
  }
}
