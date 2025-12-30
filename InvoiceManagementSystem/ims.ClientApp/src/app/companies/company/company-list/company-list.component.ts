import { Component, OnInit } from '@angular/core';
import { CompanyService, Company } from '../company.service';
import { Address, AddressService } from '../../../Master/geography/address/address.service';
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
  companyAddress: Address | null = null;

  constructor(private companyService: CompanyService,
    private addressService: AddressService,
    private router: Router, 
    private cdr: ChangeDetectorRef) { 
      
    }

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
        if (data.length > 0) {
          this.loadCompanyAddress(data[0].id);
        }
        this.cdr.detectChanges();
        console.log('Companies array updated:', this.companies);
      },
      error => {
        console.error('Error loading companies:', error);
      }
    );
  }

  loadCompanyAddress(companyId: string) {
    this.addressService.getForOwner('Company', companyId).subscribe(
      addresses => {
        if (addresses.length > 0) {
          this.companyAddress = addresses[0];
        } else {
          this.companyAddress = null;
        }
        this.cdr.detectChanges();
      },
      error => {
        console.error('Error loading company address:', error);
        this.companyAddress = null;
      }
    );
  }

  formatAddress(addr: Address): string {
    const parts = [];
    if (addr.country?.name) parts.push(addr.country.name);
    if (addr.state?.name) parts.push(addr.state.name);
    if (addr.city?.name) parts.push(addr.city.name);
    if (addr.postalCode?.code) parts.push(addr.postalCode.code);
    if (addr.line1) parts.push(addr.line1);
    if (addr.line2) parts.push(addr.line2);
    
    return parts.length > 0 ? parts.join(', ') : 'Not set';
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
