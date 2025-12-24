import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { StateService, State } from '../state.service';

@Component({
  selector: 'app-state-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './state-list.component.html',
  styleUrls: []
})
export class StateListComponent implements OnInit {
  states: State[] = [];

  constructor(
    private stateService: StateService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void { this.loadStates(); }

  loadStates() {
    this.stateService.getAll().subscribe(data => { this.states = data; this.cdr.detectChanges(); },
      error => console.error('Error loading states:', error));
  }

  deleteState(id: string) {
    if (confirm('Delete this state?')) { this.stateService.delete(id).subscribe(() => this.loadStates()); }
  }

  editState(id: string) { this.router.navigate(['/geography/states/edit', id]); }
  createState() { this.router.navigate(['/geography/states/create']); }

  countryName(s: State): string { return (s as any)?.country?.name ?? '—'; }
}
