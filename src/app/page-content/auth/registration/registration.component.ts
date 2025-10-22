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
  @Input() editMode: boolean = false;
  @Input() editData: any = null;
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
    { id: 'subdivision1', name: 'Subdivision 1' },
    { id: 'subdivision2', name: 'Subdivision 2' },
    { id: 'subdivision3', name: 'Subdivision 3' },
    { id: 'district1', name: 'District 1' },
    { id: 'district2', name: 'District 2' },
    { id: 'district3', name: 'District 3' },
    { id: 'state1', name: 'State 1' },
    { id: 'state2', name: 'State 2' },
    { id: 'state3', name: 'State 3' },
  ];
  userTypeOptions = [
    { value: 'department', name: 'Department', id: 'department' },
  ];

  constructor(
    private fb: FormBuilder,
    private genericService: GenericService,  
    private router: Router
  ) {
    this.registrationForm = this.fb.group({
      name_of_enterprise: ['', []],
      authorized_person_name: ['', []], 
      email_id: ['', []],
      mobile_no: ['', []],
      user_name: ['', []],
      registered_enterprise_address: ['', []],
      registered_enterprise_city: ['', []],
      user_type: ['individual', []], 
      password: ['', []],
      confirmPassword: ['', []],
      district_id: ['', []],
      subdivision_id: ['', []],
      ulb_id: ['', []],
      ward_id: ['', []],
      hierarchy_level: [''],
      department_id: [''],
      designation: [''],
    }, {
      validators: this.passwordMatchValidator
    });
  }

  ngOnInit(): void {
    this.loadDistricts();
    this.setupCascadingDropdowns();
    this.getAllDepartmentList();
    if (this.sourcePage === 'departmental-users') {
      this.registrationForm.patchValue({ user_type: 'department' });
      this.registrationForm.addControl('hierarchy_level', this.fb.control('', []));
      this.registrationForm.addControl('department_id', this.fb.control('', []));
      this.registrationForm.addControl('designation', this.fb.control('', []));
    } else {
      this.registrationForm.patchValue({ user_type: 'individual' });
      ['hierarchy_level', 'department_id', 'designation'].forEach(ctrl => {
        if (this.registrationForm.contains(ctrl)) {
          this.registrationForm.removeControl(ctrl);
        }
      });
    }
  }
  ngOnChanges(changes: any): void {
    if (changes['editData'] && this.editData && this.editMode) {
      if (this.sourcePage === 'departmental-users') {
        if (!this.departments || this.departments.length === 0) {
          this.getAllDepartmentList();
          const interval = setInterval(() => {
            if (this.departments.length > 0) {
              clearInterval(interval);
              this.prefillEditData();
            }
          }, 200);
        } else {
          this.prefillEditData();
        }
      } else {
        this.prefillEditData();
      }
    }
  }

  prefillEditData(): void {
    const data = this.editData;
    if (!data) return;

    const prefill = {
      name_of_enterprise: data.name_of_enterprise || '',
      authorized_person_name: data.authorized_person_name || '',
      email_id: data.email_id || '',
      mobile_no: data.mobile_no || '',
      user_name: data.user_name || '',
      registered_enterprise_address: data.registered_enterprise_address || '',
      registered_enterprise_city: data.registered_enterprise_city || '',
      hierarchy_level: data.hierarchy_level || '',
      department_id: String(data.department_id) || '',
      designation: data.designation || '',
      district_id: String(data.district_code) || '',
      subdivision_id: String(data.subdivision_code) || '',
      ulb_id: String(data.ulb_code) || '',
      ward_id: String(data.ward_code) || '',
      user_type: data.user_type || 'department'
    };

    this.registrationForm.patchValue(prefill);
    const districtExists = this.districts.some(d => d.id === prefill.district_id);
    if (!districtExists && prefill.district_id) {
      this.districts.push({
        id: prefill.district_id,
        name: data.district || `District ${prefill.district_id}`
      });
    }
    if (prefill.district_id) {
      this.loadSubdivisions(prefill.district_id);
      const subInterval = setInterval(() => {
        if (this.subdivisions.length > 0) {
          clearInterval(subInterval);

          const subExists = this.subdivisions.some(s => s.id === prefill.subdivision_id);
          if (!subExists && prefill.subdivision_id) {
            this.subdivisions.push({
              id: prefill.subdivision_id,
              name: data.subdivision || `Subdivision ${prefill.subdivision_id}`
            });
          }
          this.registrationForm.patchValue({ subdivision_id: prefill.subdivision_id });
          this.loadUlbs(prefill.subdivision_id);
          const ulbInterval = setInterval(() => {
            if (this.ulbs.length > 0) {
              clearInterval(ulbInterval);

              const ulbExists = this.ulbs.some(u => u.id === prefill.ulb_id);
              if (!ulbExists && prefill.ulb_id) {
                this.ulbs.push({
                  id: prefill.ulb_id,
                  name: data.ulb || `ULB ${prefill.ulb_id}`
                });
              }
              this.registrationForm.patchValue({ ulb_id: prefill.ulb_id });
              this.loadWards(prefill.ulb_id);
              const wardInterval = setInterval(() => {
                if (this.wards.length > 0) {
                  clearInterval(wardInterval);

                  const wardExists = this.wards.some(w => w.id === prefill.ward_id);
                  if (!wardExists && prefill.ward_id) {
                    this.wards.push({
                      id: prefill.ward_id,
                      name: data.ward || `Ward ${prefill.ward_id}`
                    });
                  }

                  this.registrationForm.patchValue({ ward_id: prefill.ward_id });
                }
              }, 300);
            }
          }, 300);
        }
      }, 300);
    }
    const departmentExists = this.departments.some(dep => String(dep.id) === String(prefill.department_id));
    if (!departmentExists && prefill.department_id) {
      this.departments.push({
        id: prefill.department_id,
        name: data.department_name || `Department ${prefill.department_id}`
      });
    }
    setTimeout(() => this.registrationForm.patchValue(prefill), 1000);
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
      const hierarchyFields = ['district_id', 'subdivision_id', 'ulb_id', 'ward_id'];
      hierarchyFields.forEach((field) => {
        const base = field.replace('_id', '');
        if (!this.shouldShow(base)) {
          delete payload[field];
        }
      });

      if (payload.user_type === 'individual') {
        delete payload.department_id;
        delete payload.designation;
        delete payload.hierarchy_level;
      }
      if (this.editMode && this.editData?.user_id) {
        const payloadWithId = { ...payload, id: this.editData.user_id };

        this.genericService.updateProfile(payloadWithId).subscribe({
          next: (res: any) => {
            this.genericService.openSnackBar('User updated successfully!', 'Success');
            this.registrationSuccess.emit();
          },
          error: (err: any) => {
            console.error('Update Failed:', err);
            const message = this.extractErrorMessage(err);
            this.genericService.openSnackBar(message, 'Error');
          }
        });
      } else {
        this.registerNewUser(payload);
      }
    } else {
      this.genericService.openSnackBar('Please fill all required fields.', 'Error');
    }
  }

  private registerNewUser(payload: any) {
      this.genericService.registerUser(payload).subscribe({
        next: (res: any) => {
          console.log('Registration Success:', res);
          this.genericService.openSnackBar('Registration successful!', 'Success');
          this.registrationForm.reset();
          if (this.sourcePage === 'departmental-users') {
            this.registrationForm.patchValue({
              user_type: 'department'
            });
            this.registrationForm.get('hierarchy_level')?.setValue('');
            this.registrationForm.get('department_id')?.setValue('');
            this.registrationForm.get('designation')?.setValue('');
          } else {
            this.registrationForm.patchValue({
              user_type: 'individual'
            });
          }
          this.registrationSuccess.emit();
        if (this.sourcePage !== 'departmental-users') {
          this.router.navigate(['page/login']);
        }
      },
        error: (err: any) => {
          console.error('Registration Failed:', err);
        const message = this.extractErrorMessage(err);
        this.genericService.openSnackBar(message, 'Error');
      }
    });
  }

  private extractErrorMessage(err: any): string {
    if (err?.error?.errors) {
      const messages: string[] = [];
      for (const key in err.error.errors) {
        if (err.error.errors.hasOwnProperty(key)) {
          const fieldErrors = err.error.errors[key];
          if (Array.isArray(fieldErrors)) {
            messages.push(...fieldErrors);
          }
        }
      }
      return messages.join(' ');
    }
    return err?.error?.message || 'Something went wrong. Please try again.';
  }
  getAllDepartmentList(): void {
   this.genericService.getByConditions({}, 'api/department-get-all-departments').subscribe({
      next: (res: any) => {
        if (res?.status === 1 && Array.isArray(res.data)) {
          this.departments = res.data.map((d: any) => ({
            id: String(d.id ?? d.department_id),
            name: d.name ?? d.department_name ?? 'Unnamed Department'
          }));
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
  shouldShow(field: string): boolean {
    const h = this.registrationForm.get('hierarchy_level')?.value;
    const u = this.registrationForm.get('user_type')?.value;

    if (u === 'individual') return true;
    if (['state1', 'state2', 'state3'].includes(h)) {
      return false;
    }
    if (h === 'district1' || h === 'district2' || h === 'district3') {
      return field === 'district';
    }
    if (h === 'subdivision1' || h === 'subdivision2' || h === 'subdivision3') {
      return ['district', 'subdivision'].includes(field);
    }
    if (h === 'block') {
      return ['district', 'subdivision', 'block'].includes(field);
    }
    return false;
  }
}