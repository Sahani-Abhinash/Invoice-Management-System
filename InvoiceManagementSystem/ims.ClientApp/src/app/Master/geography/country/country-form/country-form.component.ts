import { Component, OnInit } from '@angular/core';
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

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private countryService: CountryService
  ) {
    this.form = this.fb.group({
      name: ['', Validators.required],
      code: ['']
    });
  }

  ngOnInit(): void {
    this.id = this.route.snapshot.paramMap.get('id');
    if (this.id) {
      this.countryService.getById(this.id).subscribe(data => this.form.patchValue(data));
    }
  }

  save() {
    if (this.form.invalid) return;
    if (this.id) {
      this.countryService.update(this.id, this.form.value).subscribe(() => this.router.navigate(['/geography/countries']));
    } else {
      this.countryService.create(this.form.value).subscribe(() => this.router.navigate(['/geography/countries']));
    }
  }
}
