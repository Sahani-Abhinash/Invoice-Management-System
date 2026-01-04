import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Address, AddressService, CreateAddress, AddressType } from '../../../Master/geography/address/address.service';
import { CountryService, Country } from '../../../Master/geography/country/country.service';
import { StateService, State } from '../../../Master/geography/state/state.service';
import { CityService, City } from '../../../Master/geography/city/city.service';
import { PostalCodeService, PostalCode } from '../../../Master/geography/postalcode/postalcode.service';

interface AddressWithType {
  id: string;
  address: Address;
  type: AddressType;
  isPrimary: boolean;
}

@Component({
  selector: 'app-address-manager',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './address-manager.component.html',
  styleUrls: ['./address-manager.component.css']
})
export class AddressManagerComponent implements OnInit, OnChanges {
  @Input() entityId: string | null = null;
  @Input() entityType: 'User' | 'Branch' | 'Customer' | 'Company' | 'Vendor' | 'Warehouse' = 'Branch';
  @Output() addressesUpdated = new EventEmitter<AddressWithType[]>();

  addressForm!: FormGroup;
  managedAddresses: AddressWithType[] = [];
  availableAddresses: Address[] = [];
  countries: Country[] = [];
  states: State[] = [];
  cities: City[] = [];
  postalCodes: PostalCode[] = [];
  
  showAddressForm = false;
  isCreatingAddress = false;
  addressTypeEnum = AddressType;
  addressTypeNames = {
    [AddressType.Other]: 'Other',
    [AddressType.Billing]: 'Billing',
    [AddressType.Shipping]: 'Shipping',
    [AddressType.HeadOffice]: 'Head Office',
    [AddressType.Branch]: 'Branch',
    [AddressType.Residence]: 'Residence',
    [AddressType.Office]: 'Office'
  };

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
      type: [AddressType.Billing]
    });
  }

  ngOnInit(): void {
    console.log('AddressManager ngOnInit - entityId:', this.entityId, 'entityType:', this.entityType);
    this.loadAddresses();
  }

  ngOnChanges(changes: SimpleChanges): void {
    console.log('AddressManager ngOnChanges called:', changes);
    
    // React to changes in entityId
    if (changes['entityId']) {
      const currentId = changes['entityId'].currentValue;
      const previousId = changes['entityId'].previousValue;
      
      console.log('EntityId change detected - Previous:', previousId, 'Current:', currentId);
      
      // Load entity addresses when entityId becomes available or changes
      if (currentId && currentId !== previousId) {
        console.log('EntityId is set, will load addresses for:', currentId);
        // Use setTimeout to ensure addresses are loaded first
        setTimeout(() => {
          console.log('Executing delayed loadEntityAddresses...');
          this.loadEntityAddresses();
        }, 200);
      } else if (!currentId) {
        console.log('EntityId is null/empty, clearing managed addresses');
        this.managedAddresses = [];
      }
    }
  }

  loadAddresses() {
    console.log('Loading all addresses...');
    this.addressService.getAll().subscribe({
      next: data => {
        console.log('All addresses loaded:', data.length);
        this.availableAddresses = data;
        
        // If we have an entityId and haven't loaded entity addresses yet, do it now
        if (this.entityId && this.managedAddresses.length === 0) {
          this.loadEntityAddresses();
        }
      },
      error: err => console.error('Error loading addresses:', err)
    });
  }

  loadEntityAddresses() {
    if (!this.entityId || !this.entityType) {
      console.log('Skip loading entity addresses - no entityId or entityType');
      return;
    }
    
    console.log(`Loading addresses for ${this.entityType} with ID: ${this.entityId}`);
    
    this.addressService.getForOwner(this.entityType, this.entityId).subscribe({
      next: addresses => {
        console.log('Loaded addresses for entity:', addresses.length, addresses);
        
        if (addresses.length === 0) {
          console.log('No addresses found for this entity');
          return;
        }
        
        // Convert loaded addresses to AddressWithType format
        this.managedAddresses = addresses.map((addr, index) => ({
          id: `${addr.id}-${addr.type || 0}`,
          address: addr,
          type: addr.type || AddressType.Billing,
          isPrimary: index === 0 // First address is primary by default
        }));
        
        console.log('Managed addresses after loading:', this.managedAddresses);
        
        // Remove loaded addresses from available list
        const loadedIds = addresses.map(a => a.id);
        this.availableAddresses = this.availableAddresses.filter(a => !loadedIds.includes(a.id));
        
        console.log('Available addresses after filtering:', this.availableAddresses.length);
        
        this.notifyUpdate();
      },
      error: err => {
        console.error('Error loading entity addresses:', err);
        console.error('Error details:', err.error);
      }
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

  toggleAddressForm() {
    console.log('Toggle address form clicked. Current state:', this.showAddressForm);
    this.showAddressForm = !this.showAddressForm;
    if (this.showAddressForm) {
      console.log('Form opened, loading geography data...');
      this.loadGeographyData();
      this.addressForm.reset({ type: AddressType.Billing });
    }
  }

  loadGeographyData() {
    console.log('Loading geography data...');
    this.countryService.getAll().subscribe({
      next: data => {
        console.log('Countries loaded:', data?.length || 0);
        this.countries = data;
      },
      error: err => console.error('Error loading countries:', err)
    });
    this.stateService.getAll().subscribe({
      next: data => {
        console.log('States loaded:', data?.length || 0);
        this.states = data;
      },
      error: err => console.error('Error loading states:', err)
    });
    this.cityService.getAll().subscribe({
      next: data => {
        console.log('Cities loaded:', data?.length || 0);
        this.cities = data;
      },
      error: err => console.error('Error loading cities:', err)
    });
    this.postalCodeService.getAll().subscribe({
      next: data => {
        console.log('Postal codes loaded:', data?.length || 0);
        this.postalCodes = data;
      },
      error: err => console.error('Error loading postal codes:', err)
    });
  }

  createNewAddress() {
    if (this.addressForm.invalid) {
      this.addressForm.markAllAsTouched();
      return;
    }

    this.isCreatingAddress = true;
    
    // Helper function to convert empty strings to null (backend expects null for optional GUIDs)
    const toNullIfEmpty = (value: any) => {
      if (value === '' || value === undefined || value === null) {
        return null;
      }
      return value;
    };
    
    const formValue = this.addressForm.value;
    
    const dto: any = {
      line1: formValue.line1?.trim() || '',
      line2: toNullIfEmpty(formValue.line2?.trim()),
      countryId: toNullIfEmpty(formValue.countryId),
      stateId: toNullIfEmpty(formValue.stateId),
      cityId: toNullIfEmpty(formValue.cityId),
      postalCodeId: toNullIfEmpty(formValue.postalCodeId),
      type: parseInt(formValue.type, 10) // Convert to integer
    };

    console.log('Creating address with payload:', JSON.stringify(dto, null, 2));
    console.log('Form value before processing:', JSON.stringify(formValue, null, 2));

    this.addressService.create(dto).subscribe({
      next: (newAddress) => {
        this.isCreatingAddress = false;
        console.log('Address created successfully:', newAddress);
        this.addAddressToManaged(newAddress, parseInt(formValue.type, 10));
        this.showAddressForm = false;
        this.addressForm.reset({ type: AddressType.Billing });
        this.loadAddresses(); // Reload addresses to update available list
      },
      error: (err) => {
        this.isCreatingAddress = false;
        console.error('Full error response:', err);
        console.error('Error status:', err.status);
        console.error('Error statusText:', err.statusText);
        console.error('Error body:', err.error);
        console.error('Validation errors detail:', JSON.stringify(err.error?.errors, null, 2));
        
        let errorMessage = 'Failed to create address';
        
        if (err.status === 400) {
          errorMessage = 'Invalid address data (400 Bad Request)';
          
          // Try to extract validation errors
          if (err.error?.errors) {
            const validationErrors = Object.entries(err.error.errors)
              .map(([field, messages]: [string, any]) => {
                const msgs = Array.isArray(messages) ? messages.join(', ') : messages;
                return `${field}: ${msgs}`;
              })
              .join('\n');
            errorMessage += '\n\nValidation Errors:\n' + validationErrors;
          } else if (err.error?.title) {
            errorMessage += '\n\n' + err.error.title;
          } else if (typeof err.error === 'string') {
            errorMessage += '\n\n' + err.error;
          }
        } else if (err.status === 0) {
          errorMessage = 'Cannot connect to server. Please check if the API is running.';
        }
        
        alert(errorMessage);
      }
    });
  }

  addExistingAddress(event: Event) {
    const select = event.target as HTMLSelectElement;
    const addressId = select.value;
    if (!addressId) return;

    const addr = this.availableAddresses.find(a => a.id === addressId);
    if (!addr) return;

    const addressType = AddressType.Billing;
    this.addAddressToManaged(addr, addressType);
    select.value = '';
  }

  addAddressToManaged(addr: Address, type: AddressType) {
    const isPrimary = this.managedAddresses.length === 0;
    const managed: AddressWithType = {
      id: `${addr.id}-${type}`,
      address: addr,
      type,
      isPrimary
    };

    this.managedAddresses.push(managed);
    this.availableAddresses = this.availableAddresses.filter(a => a.id !== addr.id);
    this.notifyUpdate();
  }

  removeAddress(managedId: string) {
    const managed = this.managedAddresses.find(m => m.id === managedId);
    if (managed) {
      this.managedAddresses = this.managedAddresses.filter(m => m.id !== managedId);
      this.availableAddresses.push(managed.address);

      // If removed was primary, mark first as primary
      if (managed.isPrimary && this.managedAddresses.length > 0) {
        this.managedAddresses[0].isPrimary = true;
      }

      this.notifyUpdate();
    }
  }

  setPrimary(managedId: string) {
    console.log('Setting primary address:', managedId);
    console.log('Addresses before update:', this.managedAddresses.map(m => ({ id: m.id, isPrimary: m.isPrimary })));
    
    this.managedAddresses.forEach(m => {
      m.isPrimary = m.id === managedId;
    });
    
    console.log('Addresses after update:', this.managedAddresses.map(m => ({ id: m.id, isPrimary: m.isPrimary })));
    this.notifyUpdate();
  }

  changeAddressType(managedId: string, event: Event) {
    const select = event.target as HTMLSelectElement;
    const newType = parseInt(select.value, 10) as AddressType;
    const managed = this.managedAddresses.find(m => m.id === managedId);
    if (managed) {
      managed.type = newType;
      this.notifyUpdate();
    }
  }

  cancelAddressForm() {
    this.showAddressForm = false;
    this.addressForm.reset({ type: AddressType.Billing });
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

  private notifyUpdate() {
    this.addressesUpdated.emit(this.managedAddresses);
  }
}
