import { Component, OnInit } from '@angular/core';
import { CompanyService, Company } from '../company.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-company-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './company-list.component.html',
  styleUrls: ['./company-list.component.scss']
})

export class CompanyListComponent implements OnInit {

  companies: Company[] = [];

  constructor(private companyService: CompanyService, private router: Router, private cdr: ChangeDetectorRef) { }

  ngOnInit(): void {
    console.log('CompanyListComponent initialized');
    this.loadCompanies();
  }

  loadCompanies() {
    console.log('loadCompanies called');
    this.companyService.getAll().subscribe(
      data => {
        console.log('Data received from service:', data);
        this.companies = data;
        this.cdr.detectChanges();
        console.log('Companies array updated:', this.companies);
      },
      error => {
        console.error('Error loading companies:', error);
      }
    );
  }

  deleteCompany(id: string) {
    if(confirm('Are you sure to delete this company?')) {
      this.companyService.delete(id).subscribe(() => this.loadCompanies());
    }
  }

  editCompany(id: string) {
    this.router.navigate(['/companies/edit', id]);
  }

  createCompany() {
    this.router.navigate(['/companies/create']);
  }

}
