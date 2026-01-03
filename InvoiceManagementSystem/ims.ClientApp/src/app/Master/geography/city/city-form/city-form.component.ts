import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CityService } from '../city.service';
import { State, StateService } from '../../state/state.service';

@Component({
  selector: 'app-city-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './city-form.component.html',
  styleUrls: []
})
export class CityFormComponent implements OnInit {
  form!: FormGroup;
  id: string | null = null;
  states: State[] = [];
  private pendingStateId: string | null = null;
  private cdr = inject(ChangeDetectorRef);

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private cityService: CityService,
    private stateService: StateService
  ) {
    this.form = this.fb.group({
      name: ['', Validators.required],
      stateId: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.id = this.route.snapshot.paramMap.get('id');
    this.loadStates();

    if (this.id) {
      this.cityService.getById(this.id).subscribe(data => {
        this.pendingStateId = this.extractStateId(data);
        this.form.patchValue({
          name: (data as any)?.name ?? '',
          stateId: this.pendingStateId ?? ''
        });
        this.applyPendingStateId();
      });
    }
  }

  loadStates() {
    this.stateService.getAll().subscribe(data => {
      this.cdr.detectChanges();
      this.states = data.map(s => ({ ...s, id: String((s as any).id) } as State));
      this.applyPendingStateId();
    }, error => console.error('Error loading states:', error));
  }

  private extractStateId(data: any): string | null {
    const idCandidate = data?.stateId ?? data?.StateId ?? data?.state?.id;
    if (!idCandidate) return null;
    return String(idCandidate);
  }

  private applyPendingStateId() {
    if (this.pendingStateId && this.states.length) {
      this.form.patchValue({ stateId: this.pendingStateId });
      this.pendingStateId = null;
    }
  }

  save() {
    if (this.form.invalid) return;

    if (this.id) {
      this.cityService.update(this.id, this.form.value).subscribe(() => this.router.navigate(['/geography/cities']));
    } else {
      this.cityService.create(this.form.value).subscribe(() => this.router.navigate(['/geography/cities']));
    }
  }
}
