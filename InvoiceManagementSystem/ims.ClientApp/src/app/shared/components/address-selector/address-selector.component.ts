import { Component, Input, Output, EventEmitter, OnInit, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { AddressService, Address, CreateAddress, AddressType } from '../../../Master/geography/address/address.service';
import { CountryService, Country } from '../../../Master/geography/country/country.service';
import { StateService, State } from '../../../Master/geography/state/state.service';
import { CityService, City } from '../../../Master/geography/city/city.service';
import { PostalCodeService, PostalCode } from '../../../Master/geography/postalcode/postalcode.service';

@Component({
  selector: 'app-address-selector',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './address-selector.component.html',
  styleUrls: ['./address-selector.component.css'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => AddressSelectorComponent),
      multi: true
    }
  ]
})
export class AddressSelectorComponent implements OnInit, ControlValueAccessor {
  @Input() label: string = 'Address';
  @Input() addressType: AddressType = AddressType.Other;
  @Input() required: boolean = false;
  @Output() addressCreated = new EventEmitter<Address>();

  addressForm!: FormGroup;
  addresses: Address[] = [];
  countries: Country[] = [];
  states: State[] = [];
  cities: City[] = [];
  postalCodes: PostalCode[] = [];
  showAddressForm = false;
  isCreatingAddress = false;

  selectedAddressId: string | null = null;
  private onChange: (value: string | null) => void = () => {};
  private onTouched: () => void = () => {};

  constructor(
    private fb: FormBuilder,
    private addressService: AddressService,
    private countryService: CountryService,
    private stateService: StateService,
    private cityService: CityService,
    private postalCodeService: PostalCodeService
  ) {
    this.addressForm = this.fb.group({
      line1: ['', Validators.required],
      line2: [''],
      countryId: [''],
      stateId: [''],
      cityId: [''],
      postalCodeId: [''],
      type: [this.addressType]
    });
  }

  ngOnInit(): void {
    this.loadAddresses();
  }

  // ControlValueAccessor implementation
  writeValue(value: string | null): void {
    this.selectedAddressId = value;
  }

  registerOnChange(fn: (value: string | null) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  onAddressChange(event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    this.selectedAddressId = selectElement.value || null;
    this.onChange(this.selectedAddressId);
    this.onTouched();
  }

  loadAddresses() {
    this.addressService.getAll().subscribe({
      next: data => this.addresses = data,
      error: err => console.error('Error loading addresses:', err)
    });
  }

  formatAddressShort(addr: Address): string {
    const parts = [];
    if (addr.line1) parts.push(addr.line1);
    if (addr.city?.name) parts.push(addr.city.name);
    if (addr.state?.name) parts.push(addr.state.name);
    return parts.length > 0 ? parts.join(', ') : 'Unknown Address';
  }

  formatAddressFull(addr: Address): string {
    const parts = [];
    if (addr.line1) parts.push(addr.line1);
    if (addr.line2) parts.push(addr.line2);
    if (addr.city?.name) parts.push(addr.city.name);
    if (addr.state?.name) parts.push(addr.state.name);
    if (addr.country?.name) parts.push(addr.country.name);
    if (addr.postalCode?.code) parts.push(addr.postalCode.code);
    return parts.length > 0 ? parts.join(', ') : 'Unknown Address';
  }

  getSelectedAddressDetails(): Address | undefined {
    return this.addresses.find(addr => addr.id === this.selectedAddressId);
  }

  toggleAddressForm() {
    this.showAddressForm = !this.showAddressForm;
    if (this.showAddressForm) {
      this.loadGeographyData();
      this.addressForm.reset({ type: this.addressType });
    }
  }

  loadGeographyData() {
    this.countryService.getAll().subscribe({
      next: data => this.countries = data,
      error: err => console.error('Error loading countries:', err)
    });
    this.stateService.getAll().subscribe({
      next: data => this.states = data,
      error: err => console.error('Error loading states:', err)
    });
    this.cityService.getAll().subscribe({
      next: data => this.cities = data,
      error: err => console.error('Error loading cities:', err)
    });
    this.postalCodeService.getAll().subscribe({
      next: data => this.postalCodes = data,
      error: err => console.error('Error loading postal codes:', err)
    });
  }

  createNewAddress() {
    if (this.addressForm.invalid) {
      this.addressForm.markAllAsTouched();
      return;
    }

    this.isCreatingAddress = true;
    const dto: CreateAddress = {
      line1: this.addressForm.value.line1,
      line2: this.addressForm.value.line2 || undefined,
      countryId: this.addressForm.value.countryId || null,
      stateId: this.addressForm.value.stateId || null,
      cityId: this.addressForm.value.cityId || null,
      postalCodeId: this.addressForm.value.postalCodeId || null,
      type: this.addressForm.value.type
    };

    this.addressService.create(dto).subscribe({
      next: (newAddress) => {
        this.isCreatingAddress = false;
        this.addresses.push(newAddress);
        this.selectedAddressId = newAddress.id;
        this.onChange(newAddress.id);
        this.showAddressForm = false;
        this.addressForm.reset({ type: this.addressType });
        this.addressCreated.emit(newAddress);
      },
      error: (err) => {
        this.isCreatingAddress = false;
        console.error('Error creating address:', err);
        alert('Failed to create address. Please try again.');
      }
    });
  }

  cancelAddressForm() {
    this.showAddressForm = false;
    this.addressForm.reset({ type: this.addressType });
  }

  getFilteredStates(): State[] {
    const countryId = this.addressForm.value.countryId;
    return countryId ? this.states.filter(s => s.countryId === countryId) : this.states;
  }

  getFilteredCities(): City[] {
    const stateId = this.addressForm.value.stateId;
    return stateId ? this.cities.filter(c => c.stateId === stateId) : this.cities;
  }

  getFilteredPostalCodes(): PostalCode[] {
    const cityId = this.addressForm.value.cityId;
    return cityId ? this.postalCodes.filter(pc => pc.cityId === cityId) : this.postalCodes;
  }

  onCountryChange() {
    this.addressForm.patchValue({ stateId: '', cityId: '', postalCodeId: '' });
  }

  onStateChange() {
    this.addressForm.patchValue({ cityId: '', postalCodeId: '' });
  }

  onCityChange() {
    this.addressForm.patchValue({ postalCodeId: '' });
  }
}
