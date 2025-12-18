import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CompanyService } from '../company.service';

@Component({
  selector: 'app-company-form',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './company-form.component.html',
  styleUrls: ['./company-form.component.css']
})
export class CompanyFormComponent implements OnInit {
  form!: FormGroup;
  id: string | null = null;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private companyService: CompanyService
  ) {
    this.form = this.fb.group({
      name: ['', Validators.required],
      taxNumber: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.id = this.route.snapshot.paramMap.get('id');
    if(this.id){
      this.companyService.getById(this.id).subscribe(data => this.form.patchValue(data));
    }
  }

  save() {
    if(this.form.invalid) return;

    if(this.id){
      this.companyService.update(this.id, this.form.value).subscribe(() => this.router.navigate(['/companies']));
    } else {
      this.companyService.create(this.form.value).subscribe(() => this.router.navigate(['/companies']));
    }
  }
}
