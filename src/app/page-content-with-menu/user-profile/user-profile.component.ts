import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TabsModule } from 'primeng/tabs';
import { GenericService } from '../../_service/generic/generic.service';
import { IlogiInputComponent } from "../../customInputComponents/ilogi-input/ilogi-input.component";
import { IlogiSelectComponent, SelectOption } from "../../customInputComponents/ilogi-select/ilogi-select.component";
import { LoaderService } from '../../_service/loader/loader.service';
import { finalize } from 'rxjs';

export interface BackendProfile {
  id?: number;
  name_of_enterprise: string;
  authorized_person_name: string;
  email_id: string;
  mobile_no: string;
  registered_enterprise_address: string;
  registered_enterprise_city: string;
  user_type?: string;
  department_id?: string | number;
  district_id?: string;
  subdivision_id?: string;
  ulb_id?: string;
  ward_id?: string;
  hierarchy_level?: string;
}


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
  selector: 'app-user-profile',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    TabsModule,
    IlogiInputComponent,
    IlogiSelectComponent
  ],
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.scss']
})
export class UserProfileComponent implements OnInit {
  profileForm!: FormGroup;
  passwordForm!: FormGroup;
  backendProfile!: BackendProfile;

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

  districts: SelectOption[] = [];
  subdivisions: SelectOption[] = [];
  ulbs: SelectOption[] = [];
  wards: SelectOption[] = [];
  departments: SelectOption[] = [];
  loadingDistricts = false;
  loadingSubdivisions = false;
  loadingUlbs = false;
  loadingWards = false;

  constructor(private genericService: GenericService, private fb: FormBuilder, private loaderService: LoaderService) { }

  ngOnInit(): void {
    this.initForms();
    this.getAllDepartmentList();
    this.loadDistricts();
    this.setupCascadingDropdowns();
    this.genericService.getProfile().pipe(finalize(()=>this.loaderService.hideLoader())).subscribe((res: any) => {
      if (res?.success || res?.status === 1) {
        this.backendProfile = {
          ...res.data,
          district_id: res.data.district_code,
          subdivision_id: res.data.subdivision_code,
          ulb_id: res.data.ulb_code,
          ward_id: res.data.ward_code
        };

        this.prefillFormOnceOptionsAreReady();
      }
    });
  }


  private prefillFormOnceOptionsAreReady(): void {
    const tryPatch = () => {
      const districtsReady = this.districts.length > 0;
      const departmentsReady = this.departments.length > 0;

      if (!districtsReady || !departmentsReady) {
        setTimeout(tryPatch, 100);
        return;
      }

      const profile = this.backendProfile;
      const [first, ...last] = (profile.authorized_person_name || '').split(' ');
      this.profileForm.patchValue({
        enterpriseName: profile.name_of_enterprise,
        authorized_person_name: profile.authorized_person_name || '',
        // lastName: last.join(' ') || '',
        email: profile.email_id,
        phone: profile.mobile_no,
        address: profile.registered_enterprise_address,
        city: profile.registered_enterprise_city,
        userType: profile.user_type,
        department_id: profile.department_id,
        hierarchy_level: profile.hierarchy_level || '',
        district_code: profile.district_id || '',
        subdivision_code: profile.subdivision_id || '',
        ulb_code: profile.ulb_id || '',
        ward_code: profile.ward_id || ''
      });
      if (profile.district_id) {
        this.loadSubdivisions(profile.district_id);
        setTimeout(() => {
          this.profileForm.patchValue({ subdivision_code: profile.subdivision_id || '' });
          if (profile.subdivision_id) {
            this.loadUlbs(profile.subdivision_id);
            setTimeout(() => {
              this.profileForm.patchValue({ ulb_code: profile.ulb_id || '' });
              if (profile.ulb_id) {
                this.loadWards(profile.ulb_id);
                setTimeout(() => {
                  this.profileForm.patchValue({ ward_code: profile.ward_id || '' });
                }, 200);
              }
            }, 200);
          }
        }, 200);
      }
    };
    tryPatch();
  }

  initForms(): void {
    this.profileForm = this.fb.group({
      enterpriseName: ['', Validators.required],
      authorized_person_name: ['', Validators.required],
      // lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', Validators.required],
      address: ['', Validators.required],
      city: ['', Validators.required],
      userType: [{ value: '', disabled: true }],
      department_id: ['', Validators.required],
      hierarchy_level: [''],
      district_code: [''],
      subdivision_code: [''],
      ulb_code: [''],
      ward_code: ['']
    });

    this.passwordForm = this.fb.group({
      currentPassword: ['', Validators.required],
      newPassword: ['', Validators.required],
      confirmPassword: ['', Validators.required],
    });
  }

  get isProfileChanged(): boolean {
    return this.backendProfile
      ? !this.profileForm.pristine
      : false;
  }

  updateProfile(): void {
    this.loaderService.showLoader();
    const userId = Number(localStorage.getItem('userId'));
    const val = this.profileForm.getRawValue();

    let payload: BackendProfile = {
      id: userId,
      name_of_enterprise: val.enterpriseName,
      authorized_person_name: `${val.authorized_person_name}`.trim(),
      email_id: val.email,
      mobile_no: val.phone.toString(),
      registered_enterprise_address: val.address,
      registered_enterprise_city: val.city,
      user_type: val.userType,
      hierarchy_level: val.hierarchy_level,
      department_id: val.department_id
    };
    if (val.userType === 'individual') {
      delete payload.hierarchy_level;
      delete payload.department_id;
      if (val.district_code) {
        payload.district_id = val.district_code;
      }
      if (val.subdivision_code) {
        payload.subdivision_id = val.subdivision_code;
      }
      if (val.ulb_code) {
        payload.ulb_id = val.ulb_code;
      }
      if (val.ward_code) {
        payload.ward_id = val.ward_code;
      }
    }

    switch (val.hierarchy_level) {
      
      case 'district1':
        payload.district_id = val.district_code;
        break;
      case 'district2':
        payload.district_id = val.district_code;
        break;
      case 'district3':
        payload.district_id = val.district_code;
        break;
      case 'subdivision1':
        payload.district_id = val.district_code;
        payload.subdivision_id = val.subdivision_code;
        break;
      case 'subdivision2':
        payload.district_id = val.district_code;
        payload.subdivision_id = val.subdivision_code;
        break;
      case 'subdivision3':
        payload.district_id = val.district_code;
        payload.subdivision_id = val.subdivision_code;
        break;
      case 'block':
        payload.district_id = val.district_code;
        payload.subdivision_id = val.subdivision_code;
        payload.ulb_id = val.ulb_code;
        break;
      case 'ward':
        payload.district_id = val.district_code;
        payload.subdivision_id = val.subdivision_code;
        payload.ulb_id = val.ulb_code;
        payload.ward_id = val.ward_code;
        break;
    }

    this.genericService.updateProfile(payload).pipe(finalize(()=>this.loaderService.hideLoader())).subscribe({
      next: (res: any) => {
        if (res?.status === 1) {
          this.genericService.openSnackBar(res?.message || 'Profile updated successfully!', 'Success');
          this.profileForm.markAsPristine();
          // this.genericService.getProfile().subscribe((fresh: any) => {
          //   if (fresh?.success || fresh?.status === 1) {
          //     this.backendProfile = fresh.data;
          //     this.prefillFormOnceOptionsAreReady();
          //   }
          // });
        } else {
          this.genericService.openSnackBar(res?.message || 'Update failed', 'Error');
        }
      },
      error: (err: any) => {
        console.error('Profile update failed:', err);
        this.genericService.openSnackBar('Something went wrong while updating profile', 'Error');
      }
    });
  }

  changePassword(): void {
    if (this.passwordForm.invalid) {
      this.genericService.openSnackBar('Please fill all required fields', 'Error');
      return;
    }
    const { newPassword, confirmPassword } = this.passwordForm.value;
    if (newPassword !== confirmPassword) {
      this.genericService.openSnackBar('Passwords do not match', 'Error');
      return;
    }

    const userId = Number(localStorage.getItem('userId'));
    const payload = {
      id: userId,
      old_password: this.passwordForm.value.currentPassword,
      new_password: newPassword
    };
    this.loaderService.showLoader();
    this.genericService.changePassword(payload).pipe(finalize(()=>this.loaderService.hideLoader())).subscribe({
      next: (res: any) => {
        if (res?.success === true) {
          this.genericService.openSnackBar('Password changed successfully!', 'Success');
          this.passwordForm.reset();
        } else if (res?.success === false && res?.message) {
          this.genericService.openSnackBar(res.message, 'Error');
        } else {
          this.genericService.openSnackBar(res?.message || 'Password change failed', 'Error');
        }
      },
      error: (err: any) => {
        console.error('Password change failed:', err);
        this.genericService.openSnackBar(err.error?.message || 'Password change failed', 'Error');
      }
    });
  }

  setupCascadingDropdowns(): void {
    this.profileForm.get('district_code')?.valueChanges.subscribe(district => {
      this.profileForm.get('subdivision_code')?.reset();
      this.profileForm.get('ulb_code')?.reset();
      this.profileForm.get('ward_code')?.reset();
      this.subdivisions = [];
      this.ulbs = [];
      this.wards = [];
      if (district) this.loadSubdivisions(district);
    });

    this.profileForm.get('subdivision_code')?.valueChanges.subscribe(subdivision => {
      this.profileForm.get('ulb_code')?.reset();
      this.profileForm.get('ward_code')?.reset();
      this.ulbs = [];
      this.wards = [];
      if (subdivision) this.loadUlbs(subdivision);
    });

    this.profileForm.get('ulb_code')?.valueChanges.subscribe(ulb => {
      this.profileForm.get('ward_code')?.reset();
      this.wards = [];
      if (ulb) this.loadWards(ulb);
    });
  }

  getAllDepartmentList(): void {
    this.loaderService.showLoader();
    this.genericService.getByConditions({}, 'api/department-get-all-departments').pipe(finalize(()=>this.loaderService.hideLoader())).subscribe({
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

  loadDistricts(): void {
    this.loadingDistricts = true;
    this.loaderService.showLoader();
    this.genericService.getByConditions({}, 'api/tripura/get-all-districts').pipe(finalize(()=>this.loaderService.hideLoader())).subscribe({
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
    this.loaderService.showLoader();
    this.loadingSubdivisions = true;
    const selectedDistrict = this.districts.find(d => d.id === districtCode);
    if (!selectedDistrict) {
      this.loadingSubdivisions = false;
      return;
    }
    const payload = { district: selectedDistrict.name };
    this.genericService.getByConditions(payload, 'api/tripura/get-sub-subdivisions').pipe(finalize(()=>this.loaderService.hideLoader())).subscribe({
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
    this.loaderService.showLoader();
    this.loadingUlbs = true;
    const payload = { subdivision: subdivision };
    this.genericService.getByConditions(payload, 'api/tripura/get-block-names').pipe(finalize(()=>this.loaderService.hideLoader())).subscribe({
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
    this.loaderService.showLoader();
    const payload = { ulb: ulb };
    this.genericService.getByConditions(payload, 'api/tripura/get-gp-vc-wards').pipe(finalize(()=>this.loaderService.hideLoader())).subscribe({
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

  shouldShow(field: string): boolean {
    const h = this.profileForm.get('hierarchy_level')?.value;
    const u = this.profileForm.get('userType')?.value;
    if (u === 'individual') return true;
    if (['state1', 'state2', 'state3'].includes(h)) return false;

    if (h === 'district1' || h === 'district2' || h === 'district3') return field === 'district';
    if (h === 'subdivision1' || h === 'subdivision2' || h === 'subdivision3') return ['district', 'subdivision'].includes(field);
    if (h === 'block') return ['district', 'subdivision', 'block'].includes(field);
    if (h === 'ward') return ['district', 'subdivision', 'block', 'ward'].includes(field);

    return false;
  }
}
