import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { IlogiInputComponent } from '../../../customInputComponents/ilogi-input/ilogi-input.component';
import { IlogiSelectComponent, SelectOption } from '../../../customInputComponents/ilogi-select/ilogi-select.component';
import { Router } from '@angular/router';
import { GenericService } from '../../../_service/generic/generic.service';

interface District {
  district_code: string;
  district_name: string;
}

interface Subdivision {
  sub_division: string;
  sub_lgd_code: string;
}

interface ULB {
  ulb_lgd_code: string;
  ulb_name: string;
}

interface Ward {
  gp_vc_ward_lgd_code: string;
  name_of_gp_vc_or_ward: string;
}

@Component({
  selector: 'app-registration',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    IlogiInputComponent,
    IlogiSelectComponent
  ],
  templateUrl: './registration.component.html',
  styleUrls: ['./registration.component.scss']
})
export class RegistrationComponent implements OnInit {
  @Input() sourcePage: string | null = null;
  @Output() registrationSuccess = new EventEmitter<void>();
  isSpecialRequired(): boolean {
    return this.sourcePage === 'departmental-users';
  }
  registrationForm: FormGroup;
  districts: SelectOption[] = [];
  subdivisions: SelectOption[] = [];
  ulbs: SelectOption[] = [];
  wards: SelectOption[] = [];
  departments: SelectOption[] = [];
  loadingDistricts = false;
  loadingSubdivisions = false;
  loadingUlbs = false;
  loadingWards = false;
  hierarchyLevels = [
    { id: 'block', name: 'Block' },
    { id: 'subdivision', name: 'Subdivision' },
    { id: 'district', name: 'District' },
    { id: 'state1', name: 'State 1' },
    { id: 'state2', name: 'State 2' },
    { id: 'state3', name: 'State 3' },
  ];
  userTypeOptions = [
    { value: 'individual', name: 'Individual', id: 'individual' },
    { value: 'admin', name: 'Admin', id: 'admin' },
    { value: 'department', name: 'Department', id: 'department' },
  ];

  constructor(
    private fb: FormBuilder,
    private genericService: GenericService,  
    private router: Router
  ) {
    const isRequired = this.sourcePage === 'departmental-users';
    if (isRequired) {this.userTypeOptions.push({value: 'department',name: 'Department', id: 'department'}); }
    this.registrationForm = this.fb.group({
      name_of_enterprise: ['', []],
      authorized_person_name: ['', []], 
      email_id: ['', []],
      mobile_no: ['', []],
      user_name: ['', []],
      registered_enterprise_address: ['', []],
      registered_enterprise_city: ['', []],
      user_type: ['Individual', []], 
      password: ['', []],
      confirmPassword: ['', []],
      district_id: ['', []],
      subdivision_id: ['', []],
      ulb_id: ['', []],
      ward_id: ['', []],
    }, {
      validators: this.passwordMatchValidator
    });
    this.registrationForm.get('user_type')?.valueChanges.subscribe((value) => {
      if (value === 'department') {
        this.registrationForm.addControl('hierarchy_level', this.fb.control('', []));
        this.registrationForm.addControl('department_id', this.fb.control('', []));
        this.registrationForm.addControl('designation', this.fb.control('', []));
      } else {
        this.registrationForm.removeControl('hierarchy_level');
        this.registrationForm.removeControl('department_id');
        this.registrationForm.removeControl('designation');
      }
    });
  }

  ngOnInit(): void {
    this.loadDistricts();
    this.setupCascadingDropdowns();
    this.getAllDepartmentList();
  }

  setupCascadingDropdowns(): void {
    // When district changes, reset dependent fields and load subdivisions
    this.registrationForm.get('district_id')?.valueChanges.subscribe(district => {
      this.registrationForm.get('subdivision_id')?.reset();
      this.registrationForm.get('ulb_id')?.reset();
      this.registrationForm.get('ward_id')?.reset();
      this.subdivisions = [];
      this.ulbs = [];
      this.wards = [];
      
      if (district) {
        this.loadSubdivisions(district);
      }
    });

    // When subdivision changes, reset dependent fields and load ULBs
    this.registrationForm.get('subdivision_id')?.valueChanges.subscribe(subdivision => {
      this.registrationForm.get('ulb_id')?.reset();
      this.registrationForm.get('ward_id')?.reset();
      this.ulbs = [];
      this.wards = [];
      
      if (subdivision) {
        this.loadUlbs(subdivision);
      }
    });

    // When ULB changes, reset dependent field and load wards
    this.registrationForm.get('ulb_id')?.valueChanges.subscribe(ulb => {
      this.registrationForm.get('ward_id')?.reset();
      this.wards = [];
      
      if (ulb) {
        this.loadWards(ulb);
      }
    });
  }

  loadDistricts(): void {
    this.loadingDistricts = true;
    this.genericService.getByConditions({}, 'api/tripura/get-all-districts').subscribe({
      next: (res: any) => {
        if (res?.status === 1 && Array.isArray(res.districts)) {
          this.districts = res.districts.map((d: District) => ({
            id: d.district_code,
            name: d.district_name
          }));
        }
        this.loadingDistricts = false;
      },
      error: (err: any) => {
        console.error('Failed to load districts:', err);
        this.genericService.openSnackBar('Failed to load districts', 'Error');
        this.loadingDistricts = false;
      }
    });
  }

  loadSubdivisions(districtCode: string): void {
    this.loadingSubdivisions = true;
    // Find district name by code
    const selectedDistrict = this.districts.find(d => d.id === districtCode);
    if (!selectedDistrict) {
      this.loadingSubdivisions = false;
      return;
    }

    const payload = { district: selectedDistrict.name };
    
    this.genericService.getByConditions(payload, 'api/tripura/get-sub-subdivisions').subscribe({
      next: (res: any) => {
        if (res?.status === 1 && Array.isArray(res.subdivision)) {
          this.subdivisions = res.subdivision.map((s: Subdivision) => ({
            id: s.sub_lgd_code,
            name: s.sub_division
          }));
        }
        this.loadingSubdivisions = false;
      },
      error: (err: any) => {
        console.error('Failed to load subdivisions:', err);
        this.genericService.openSnackBar('Failed to load subdivisions', 'Error');
        this.loadingSubdivisions = false;
      }
    });
  }

  loadUlbs(subdivision: string): void {
    this.loadingUlbs = true;
    const payload = { subdivision: subdivision };
    
    this.genericService.getByConditions(payload, 'api/tripura/get-block-names').subscribe({
      next: (res: any) => {
        if (res?.status === 1 && Array.isArray(res.ulbs)) {
          this.ulbs = res.ulbs.map((u: ULB) => ({
            id: u.ulb_lgd_code,
            name: u.ulb_name
          }));
        }
        this.loadingUlbs = false;
      },
      error: (err: any) => {
        console.error('Failed to load ULBs:', err);
        this.genericService.openSnackBar('Failed to load ULBs', 'Error');
        this.loadingUlbs = false;
      }
    });
  }

  loadWards(ulb: string): void {
    this.loadingWards = true;
    const payload = { ulb: ulb };
    
    this.genericService.getByConditions(payload, 'api/tripura/get-gp-vc-wards').subscribe({
      next: (res: any) => {
        if (res?.status === 1 && Array.isArray(res.ward)) {
          this.wards = res.ward.map((w: Ward) => ({
            id: w.gp_vc_ward_lgd_code,
            name: w.name_of_gp_vc_or_ward
          }));
        }
        this.loadingWards = false;
      },
      error: (err: any) => {
        console.error('Failed to load wards:', err);
        this.genericService.openSnackBar('Failed to load wards', 'Error');
        this.loadingWards = false;
      }
    });
  }

  passwordMatchValidator(form: FormGroup) {
    const password = form.get('password')?.value;
    const confirmPassword = form.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { mismatch: true };
  }

  onSubmit(): void {
    if (this.registrationForm.valid) {
      const { confirmPassword, ...payload } = this.registrationForm.value;

      this.genericService.registerUser(payload).subscribe({
        next: (res : any) => {
          console.log('Registration Success:', res);
          this.genericService.openSnackBar('Registration successful!', 'Success');
          this.registrationSuccess.emit();
          this.sourcePage === 'departmental-users' ? null : this.router.navigate(['page/login']);
          this.registrationForm.reset();
        },
        error: (err: any) => {
          console.error('Registration Failed:', err);

          let errorMessage = 'Registration failed. Try again.';
          if (err.error && err.error.errors) {
            const validationMessages = Object.values(err.error.errors)
              .flat()
              .join(', ');

            errorMessage = validationMessages || err.error.message || errorMessage;
          } else if (err.error && err.error.message) {
            errorMessage = err.error.message;
          }
          this.genericService.openSnackBar(errorMessage, 'Error');
        }
      });
    } else {
      this.genericService.openSnackBar('Please fill all required fields', 'Error');
    }
  }
  getAllDepartmentList(): void {
   this.genericService.getByConditions({}, 'api/department-get-all-departments').subscribe({
      next: (res: any) => {
        if (res?.status === 1 && Array.isArray(res.data)) {
          this.departments = res.data;
        } else {
          this.departments = [];
        }
      },
      error: (err) => {
        console.error('Error fetching departments:', err);
        this.departments = [];
      }
    });
  }
}