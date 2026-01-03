import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { PostalCodeService } from '../postalcode.service';
import { City, CityService } from '../../city/city.service';

@Component({
  selector: 'app-postalcode-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './postalcode-form.component.html',
  styleUrls: []
})
export class PostalCodeFormComponent implements OnInit {
  form!: FormGroup;
  id: string | null = null;
  cities: City[] = [];
  private pendingCityId: string | null = null;
  private cdr = inject(ChangeDetectorRef);

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private postalCodeService: PostalCodeService,
    private cityService: CityService
  ) {
    this.form = this.fb.group({
      code: ['', Validators.required],
      cityId: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.id = this.route.snapshot.paramMap.get('id');
    this.loadCities();

    if (this.id) {
      this.postalCodeService.getById(this.id).subscribe(data => {
        this.pendingCityId = this.extractCityId(data);
        this.form.patchValue({
          code: (data as any)?.code ?? '',
          cityId: this.pendingCityId ?? ''
        });
        this.applyPendingCityId();
      });
    }
  }

  loadCities() {
    this.cityService.getAll().subscribe(data => {
      this.cities = data.map(c => ({ ...c, id: String((c as any).id) } as City));
      this.cdr.detectChanges();
      this.applyPendingCityId();
    }, error => console.error('Error loading cities:', error));
  }

  private extractCityId(data: any): string | null {
    const idCandidate = data?.cityId ?? data?.CityId ?? data?.city?.id;
    if (!idCandidate) return null;
    return String(idCandidate);
  }

  private applyPendingCityId() {
    if (this.pendingCityId && this.cities.length) {
      this.form.patchValue({ cityId: this.pendingCityId });
      this.pendingCityId = null;
    }
  }

  save() {
    if (this.form.invalid) return;

    if (this.id) {
      this.postalCodeService.update(this.id, this.form.value).subscribe(() => this.router.navigate(['/geography/postalcodes']));
    } else {
      this.postalCodeService.create(this.form.value).subscribe(() => this.router.navigate(['/geography/postalcodes']));
    }
  }
}
