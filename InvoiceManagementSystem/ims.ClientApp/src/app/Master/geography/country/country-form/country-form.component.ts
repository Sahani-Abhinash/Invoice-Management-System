import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CountryService } from '../country.service';

@Component({
  selector: 'app-country-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './country-form.component.html',
  styleUrls: []
})
export class CountryFormComponent implements OnInit {
  form!: FormGroup;
  id: string | null = null;
  loading = false;
  error: string | null = null;
  success = false;
  private cdr = inject(ChangeDetectorRef);

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private countryService: CountryService
  ) {
    this.form = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      isoCode: ['', Validators.minLength(2)]
    });
  }

  ngOnInit(): void {
    this.id = this.route.snapshot.paramMap.get('id');
    console.log('Country Form - ID from route:', this.id);
    if (this.id) {
      this.loading = true;
      console.log('Fetching country data for ID:', this.id);
      this.countryService.getById(this.id).subscribe({
        next: (data) => {
          console.log('Country data received:', data);
          this.form.patchValue(data);
          this.cdr.detectChanges();
        },
        error: (err: any) => {
          this.error = 'Failed to load country: ' + err.message;
          this.loading = false;
          this.cdr.detectChanges();
          console.error('Error loading country:', err);
        }
      });
    }
  }

  save() {
    if (this.form.invalid) {
      this.error = 'Please fill in all required fields correctly';
      return;
    }

    this.loading = true;
    this.error = null;
    this.success = false;

    const formData = this.form.value;
    console.log('Saving country with data:', formData);
    console.log('ID:', this.id);

    const saveOperation = this.id
      ? this.countryService.update(this.id, formData)
      : this.countryService.create(formData);

    saveOperation.subscribe({
      next: (response) => {
        console.log('Save successful, response:', response);
        this.success = true;
        this.loading = false;
        setTimeout(() => {
          this.router.navigate(['/geography/countries']);
        }, 1500);
      },
      error: (err) => {
        console.error('Save error:', err);
        this.error = err?.error?.message || 'Failed to save country. Please try again.';
        this.loading = false;
        console.error('Error saving country:', err);
      }
    });
  }
}

