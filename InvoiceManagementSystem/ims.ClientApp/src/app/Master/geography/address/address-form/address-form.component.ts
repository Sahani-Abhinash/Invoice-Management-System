import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AddressService, AddressType, CreateAddress } from '../address.service';
import { Country, CountryService } from '../../country/country.service';
import { State, StateService } from '../../state/state.service';
import { City, CityService } from '../../city/city.service';
import { PostalCode, PostalCodeService } from '../../postalcode/postalcode.service';

@Component({
  selector: 'app-address-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './address-form.component.html',
  styleUrls: []
})
export class AddressFormComponent implements OnInit {
  form!: FormGroup;
  id: string | null = null;
  loading = false;
  error: string | null = null;
  success = false;

  countries: Country[] = [];
  states: State[] = [];
  cities: City[] = [];
  postalCodes: PostalCode[] = [];

  // Filtered lists for cascading dropdowns
  filteredStates: State[] = [];
  filteredCities: City[] = [];
  filteredPostalCodes: PostalCode[] = [];

  addressTypes = [
    { label: 'Other', value: AddressType.Other },
    { label: 'Billing', value: AddressType.Billing },
    { label: 'Shipping', value: AddressType.Shipping },
    { label: 'Head Office', value: AddressType.HeadOffice },
    { label: 'Branch', value: AddressType.Branch },
    { label: 'Residence', value: AddressType.Residence },
    { label: 'Office', value: AddressType.Office },
  ];
  private cdr = inject(ChangeDetectorRef);

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private addressService: AddressService,
    private countryService: CountryService,
    private stateService: StateService,
    private cityService: CityService,
    private postalCodeService: PostalCodeService
  ) {
    this.form = this.fb.group({
      line1: ['', [Validators.required, Validators.minLength(3)]],
      line2: [''],
      countryId: [null, [Validators.required]],
      stateId: [{ value: null, disabled: true }],
      cityId: [{ value: null, disabled: true }, [Validators.required]],
      postalCodeId: [{ value: null, disabled: true }, [Validators.required]],
      latitude: [null],
      longitude: [null],
      type: [AddressType.Other]
    });
  }

  ngOnInit(): void {
    this.id = this.route.snapshot.paramMap.get('id');
    this.loadDropdowns();
    this.setupCascadingDropdowns();
    
    if (this.id) {
      this.loading = true;
      this.addressService.getById(this.id).subscribe({
        next: (data) => {
          // Map API AddressDto to form structure (CreateAddress)
          const dto: CreateAddress = {
            line1: data.line1,
            line2: data.line2,
            countryId: data.countryId ?? data.country?.id ?? null,
            stateId: data.stateId ?? data.state?.id ?? null,
            cityId: data.cityId ?? data.city?.id ?? null,
            postalCodeId: data.postalCodeId ?? data.postalCode?.id ?? null,
            latitude: data.latitude ?? undefined,
            longitude: data.longitude ?? undefined,
            type: (data.type ?? AddressType.Other)
          };
          this.form.patchValue(dto);
          // Manually trigger filtering after patching values
          this.filterStatesByCountry();
          this.filterCitiesByState();
          this.filterPostalCodesByCity();
          this.loading = false;
        },
        error: (err) => {
          this.error = 'Failed to load address: ' + err.message;
          this.loading = false;
          console.error('Error loading address:', err);
        }
      });
    }
  }

  private loadDropdowns() {
    console.log('=== loadDropdowns() START ===');
    this.countryService.getAll().subscribe({ 
      next: d => {
        console.log('✅ Countries loaded:', d.length);
        console.table(d);
        this.countries = d;
        this.cdr.detectChanges();
        this.filterStatesByCountry();
      },
      error: err => console.error('❌ Error loading countries:', err)
    });
    this.stateService.getAll().subscribe({ 
      next: d => {
        console.log('States loaded:', d.length, d);
        this.states = d;
        this.cdr.detectChanges();
        this.filterStatesByCountry();
      },
      error: err => console.error('Error loading states:', err)
    });
    this.cityService.getAll().subscribe({ 
      next: d => {
        console.log('Cities loaded:', d.length, d);
        this.cities = d;
        this.cdr.detectChanges();
        this.filterCitiesByState();
      },
      error: err => console.error('Error loading cities:', err)
    });
    this.postalCodeService.getAll().subscribe({ 
      next: d => {
        console.log('Postal codes loaded:', d.length, d);
        this.postalCodes = d;
        this.cdr.detectChanges();
        this.filterPostalCodesByCity();
      },
      error: err => console.error('Error loading postal codes:', err)
    });
  }

  private setupCascadingDropdowns() {
    console.log('=== setupCascadingDropdowns() ===');
    // When country changes, filter states and reset dependent fields
    this.form.get('countryId')?.valueChanges.subscribe(countryId => {
      console.log('\n🔔 COUNTRY CHANGED EVENT 🔔');
      console.log('New countryId value:', countryId, 'Type:', typeof countryId);
      console.log('Full form value:', this.form.value);
      console.log('Form raw value:', this.form.getRawValue());
      console.log('States available:', this.states.length);
      
      const currentStateId = this.form.get('stateId')?.value;
      const currentCityId = this.form.get('cityId')?.value;
      const currentPostalCodeId = this.form.get('postalCodeId')?.value;
      
      this.filterStatesByCountry();
      console.log('After filtering - filteredStates count:', this.filteredStates.length);
      
      // Enable/disable stateId control
      if (countryId && this.filteredStates.length > 0) {
        this.form.get('stateId')?.enable({ emitEvent: false });
      } else {
        this.form.get('stateId')?.disable({ emitEvent: false });
      }
      
      // Only reset if current values are not in filtered list
      if (currentStateId && !this.filteredStates.find(s => s.id === currentStateId)) {
        console.log('Resetting dependent fields because current state not in filtered list');
        this.form.patchValue({ stateId: null, cityId: null, postalCodeId: null }, { emitEvent: false });
        this.filteredCities = [];
        this.filteredPostalCodes = [];
        this.form.get('cityId')?.disable({ emitEvent: false });
        this.form.get('postalCodeId')?.disable({ emitEvent: false });
      }
    });

    // When state changes, filter cities and reset dependent fields
    this.form.get('stateId')?.valueChanges.subscribe(stateId => {
      const currentCityId = this.form.get('cityId')?.value;
      const currentPostalCodeId = this.form.get('postalCodeId')?.value;
      
      this.filterCitiesByState();
      
      // Enable/disable cityId control
      if (stateId && this.filteredCities.length > 0) {
        this.form.get('cityId')?.enable({ emitEvent: false });
      } else {
        this.form.get('cityId')?.disable({ emitEvent: false });
      }
      
      // Only reset if current values are not in filtered list
      if (currentCityId && !this.filteredCities.find(c => c.id === currentCityId)) {
        this.form.patchValue({ cityId: null, postalCodeId: null }, { emitEvent: false });
        this.filteredPostalCodes = [];
        this.form.get('postalCodeId')?.disable({ emitEvent: false });
      }
    });

    // When city changes, filter postal codes
    this.form.get('cityId')?.valueChanges.subscribe(cityId => {
      const currentPostalCodeId = this.form.get('postalCodeId')?.value;
      
      this.filterPostalCodesByCity();
            // Enable/disable postalCodeId control
      if (cityId && this.filteredPostalCodes.length > 0) {
        this.form.get('postalCodeId')?.enable({ emitEvent: false });
      } else {
        this.form.get('postalCodeId')?.disable({ emitEvent: false });
      }
            // Only reset if current value is not in filtered list
      if (currentPostalCodeId && !this.filteredPostalCodes.find(p => p.id === currentPostalCodeId)) {
        this.form.patchValue({ postalCodeId: null }, { emitEvent: false });
      }
    });
  }

  private filterStatesByCountry() {
    const countryId = this.form.get('countryId')?.value;
    
    // SUPER VISIBLE DEBUG
    console.log('\n\n');
    console.log('═══════════════════════════════════════════════════════');
    console.log('DEBUGGING STATE FILTER');
    console.log('═══════════════════════════════════════════════════════');
    console.log('COUNTRY ID SELECTED:', countryId);
    console.log('COUNTRY ID TYPE:', typeof countryId);
    console.log('TOTAL STATES LOADED:', this.states.length);
    console.table(this.states.slice(0, 5)); // Show first 5 states in table format
    console.log('═══════════════════════════════════════════════════════\n');
    
    if (countryId && this.states.length) {
      this.filteredStates = this.states.filter(s => {
        const match = s.countryId === countryId;
        if (!match) {
          console.log(`❌ NO MATCH: State "${s.name}" has countryId="${s.countryId}" (${typeof s.countryId}) vs selected="${countryId}" (${typeof countryId})`);
        } else {
          console.log(`✅ MATCH: State "${s.name}"`);
        }
        return match;
      });
      console.log('\n🎯 FILTERED RESULT:', this.filteredStates.length, 'states');
      console.table(this.filteredStates);
    } else {
      this.filteredStates = [];
      console.warn('⚠️ SKIPPED FILTERING - countryId:', countryId, 'states:', this.states.length);
    }
  }

  private filterCitiesByState() {
    const stateId = this.form.get('stateId')?.value;
    console.log('Filtering cities for stateId:', stateId);
    if (stateId && this.cities.length) {
      this.filteredCities = this.cities.filter(c => {
        const cityStateId = (c as any).stateId || (c as any).StateId;
        return cityStateId === stateId || cityStateId === String(stateId);
      });
      console.log('Filtered cities:', this.filteredCities);
    } else {
      this.filteredCities = [];
    }
  }

  private filterPostalCodesByCity() {
    const cityId = this.form.get('cityId')?.value;
    console.log('Filtering postal codes for cityId:', cityId);
    if (cityId && this.postalCodes.length) {
      this.filteredPostalCodes = this.postalCodes.filter(p => {
        const postalCityId = (p as any).cityId || (p as any).CityId;
        return postalCityId === cityId || postalCityId === String(cityId);
      });
      console.log('Filtered postal codes:', this.filteredPostalCodes);
    } else {
      this.filteredPostalCodes = [];
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

    const rawValue = this.form.getRawValue();
    
    // Clean up the DTO - convert empty strings to null for optional fields, and type to number
    const dto: CreateAddress = {
      line1: rawValue.line1,
      line2: rawValue.line2 ? rawValue.line2.trim() : null,
      countryId: rawValue.countryId,
      stateId: rawValue.stateId,
      cityId: rawValue.cityId,
      postalCodeId: rawValue.postalCodeId,
      latitude: rawValue.latitude,
      longitude: rawValue.longitude,
      type: rawValue.type ? Number(rawValue.type) : undefined
    };
    
    console.log('📤 Sending DTO to API:', dto);
    console.log('📤 DTO JSON:', JSON.stringify(dto));

    const saveOperation = this.id
      ? this.addressService.update(this.id, dto)
      : this.addressService.create(dto);

    saveOperation.subscribe({
      next: () => {
        this.success = true;
        this.loading = false;
        setTimeout(() => this.router.navigate(['/geography/addresses']), 1000);
      },
      error: (err) => {
        this.error = err?.error?.message || 'Failed to save address. Please try again.';
        this.loading = false;
        console.error('Error saving address:', err);
        console.error('Error details:', err.error);
        console.error('🚨 Validation errors:', err.error?.errors);
      }
    });
  }
}
