import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { PostalCodeService, PostalCode } from '../postalcode.service';

@Component({
  selector: 'app-postalcode-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './postalcode-list.component.html',
  styleUrls: []
})
export class PostalCodeListComponent implements OnInit {
  postalcodes: PostalCode[] = [];

  constructor(
    private postalCodeService: PostalCodeService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void { this.loadPostalCodes(); }

  loadPostalCodes() {
    this.postalCodeService.getAll().subscribe(data => { this.postalcodes = data; this.cdr.detectChanges(); },
      error => console.error('Error loading postal codes:', error));
  }

  deletePostalCode(id: string) {
    if (confirm('Delete this postal code?')) { this.postalCodeService.delete(id).subscribe(() => this.loadPostalCodes()); }
  }

  editPostalCode(id: string) { this.router.navigate(['/geography/postalcodes/edit', id]); }
  createPostalCode() { this.router.navigate(['/geography/postalcodes/create']); }

  cityName(pc: PostalCode): string { return (pc as any)?.city?.name ?? '—'; }
}
