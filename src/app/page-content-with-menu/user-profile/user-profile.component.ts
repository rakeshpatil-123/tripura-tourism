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
  selectedDistricts: Array<{
    id: string;
    subdivisions: Array<{ id: string; blocks: string[] }>;
  }> = [];
  private _lastProfileLocations: any[] = [];
  isDepartmentUser = false;
  multipleDistricts = false;
  multipleSubdivisions = false;
  multipleUlbs = false;

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
      this.loaderService.showLoader();
         this.genericService.getProfile().pipe(finalize(()=>this.loaderService.hideLoader())).subscribe((res: any) => {
      if (res?.success || res?.status === 1) {
        this.backendProfile = {
          ...res.data,
          district_id: res.data.district_code,
          subdivision_id: res.data.subdivision_code,
          ulb_id: res.data.ulb_code,
          ward_id: res.data.ward_code
        };
        this._lastProfileLocations = Array.isArray(res.locations) ? res.locations : [];
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
        email: profile.email_id,
        phone: profile.mobile_no,
        address: profile.registered_enterprise_address,
        city: profile.registered_enterprise_city,
        userType: profile.user_type,
        department_id: profile.department_id,
        hierarchy_level: profile.hierarchy_level || ''
      });
      this.isDepartmentUser = String(localStorage.getItem('userRole')) === 'department';
      const backendLocations: any[] = (this as any).backendLocations || [];
      if ((window as any) && (this as any).backendProfile && Array.isArray((this as any).backendProfile.locations)) {
      }
      const serverLocations: any[] = (this as any)._lastProfileLocations ?? (this as any).backendLocations ?? [];

      if (this.isDepartmentUser && Array.isArray(serverLocations) && serverLocations.length > 0) {
        const grouped: { [k: string]: any } = {};
        serverLocations.forEach(loc => {
          const d = String(loc.district_id);
          const s = String(loc.subdivision_id);
          const b = String(loc.block_id);
          if (!grouped[d]) grouped[d] = { id: d, subdivisionsMap: {} };
          if (!grouped[d].subdivisionsMap[s]) grouped[d].subdivisionsMap[s] = { id: s, blocksMap: {} };
          grouped[d].subdivisionsMap[s].blocksMap[b] = true;
        });

        this.selectedDistricts = Object.keys(grouped).map(dKey => {
          const subdivs = Object.keys(grouped[dKey].subdivisionsMap).map(sKey => ({
            id: sKey,
            blocks: Object.keys(grouped[dKey].subdivisionsMap[sKey].blocksMap)
          }));
          return { id: dKey, subdivisions: subdivs };
        });
        const districtIds = this.selectedDistricts.map(d => d.id);
        const subdivisionIds = Array.from(new Set(this.selectedDistricts.flatMap(d => d.subdivisions.map(s => s.id))));
        const blockIds = Array.from(new Set(this.selectedDistricts.flatMap(d => d.subdivisions.flatMap(s => s.blocks))));
        this.multipleDistricts = districtIds.length > 1;
        this.multipleSubdivisions = subdivisionIds.length > 1;
        this.multipleUlbs = blockIds.length > 1;
        this.profileForm.patchValue({
          district_code: districtIds,
          subdivision_code: subdivisionIds,
          ulb_code: blockIds
        });
        if (districtIds.length > 0) {
          this.loadSubdivisions(districtIds);
        }
        if (subdivisionIds.length > 0) {
          this.loadUlbs(subdivisionIds);
        }
      } else {
        this.multipleDistricts = false;
        this.multipleSubdivisions = false;
        this.multipleUlbs = false;

        this.profileForm.patchValue({
          district_code: profile.district_id || '',
          subdivision_code: profile.subdivision_id || '',
          ulb_code: profile.ulb_id || '',
          ward_code: profile.ward_id || ''
        });

        if (profile.district_id) {
          this.loadSubdivisions(String(profile.district_id));
          setTimeout(() => {
            this.profileForm.patchValue({ subdivision_code: profile.subdivision_id || '' });
            if (profile.subdivision_id) {
              this.loadUlbs(String(profile.subdivision_id));
              setTimeout(() => {
                this.profileForm.patchValue({ ulb_code: profile.ulb_id || '' });
                if (profile.ulb_id) {
                  this.loadWards(String(profile.ulb_id));
                  setTimeout(() => {
                    this.profileForm.patchValue({ ward_code: profile.ward_id || '' });
                  }, 200);
                }
              }, 200);
            }
          }, 200);
        }

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

    let payload: BackendProfile | any = {
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
    } else {
      const isDeptRole = String(localStorage.getItem('userRole')) === 'department';
      if (isDeptRole) {
        payload.locations = this.getLocationsPayload();
        this.profileForm.get('district_code')?.value
        this.profileForm.get('ulb_code')?.value
        delete payload.district_id;
        delete payload.subdivision_id;
        delete payload.ulb_id;
        delete payload.ward_id;
      } else {
      }
    }
    if (!((String(localStorage.getItem('userRole')) === 'department'))) {
      switch (val.hierarchy_level) {
        case 'district1':
        case 'district2':
        case 'district3':
          payload.district_id = val.district_code;
          break;
        case 'subdivision1':
        case 'subdivision2':
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
    }

    this.genericService.updateProfile(payload).pipe(finalize(() => this.loaderService.hideLoader())).subscribe({
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
  getLocationsPayload(): any[] {
    const locations: Array<{ district_id: number | null; subdivision_id: number | null; block_id: number | null }> = [];
    const rawDistrict = this.profileForm.get('district_code')?.value;
    const rawSubdivision = this.profileForm.get('subdivision_code')?.value;
    const rawUlb = this.profileForm.get('ulb_code')?.value;

    const toArr = (v: any): string[] => {
      if (Array.isArray(v)) return v.map(x => String(x)).filter(Boolean);
      if (v === undefined || v === null || String(v).trim() === '') return [];
      return [String(v).trim()];
    };

    const distArr = toArr(rawDistrict);
    const subArr = toArr(rawSubdivision);
    const blockArr = toArr(rawUlb);
    const subdivToDistrict = new Map<string, string>();
    (this.subdivisions || []).forEach((s: any) => {
      if (s && s.id) subdivToDistrict.set(String(s.id), String((s as any).district_code ?? ''));
    });

    const ulbToSubdivision = new Map<string, string>();
    (this.ulbs || []).forEach((u: any) => {
      if (u && u.id) ulbToSubdivision.set(String(u.id), String((u as any).subdivision_code ?? ''));
    });

    if (distArr.length > 0 && subArr.length > 0 && blockArr.length > 0) {
      distArr.forEach(d => {
        subArr.forEach(s => {
          blockArr.forEach(b => {
            locations.push({ district_id: Number(d), subdivision_id: Number(s), block_id: Number(b) });
          });
        });
      });
    } else if (distArr.length > 0 && subArr.length > 0) {
      distArr.forEach(d => {
        subArr.forEach(s => {
          locations.push({ district_id: Number(d), subdivision_id: Number(s), block_id: null });
        });
      });
    } else if (subArr.length > 0 && blockArr.length > 0) {
      subArr.forEach(s => {
        const resolvedDistrict = subdivToDistrict.get(String(s)) ?? null;
        blockArr.forEach(b => {
          const blockParentSub = ulbToSubdivision.get(String(b));
          const finalSub = blockParentSub ?? s;
          const finalDistrict = subdivToDistrict.get(String(finalSub)) ?? resolvedDistrict ?? null;
          locations.push({
            district_id: finalDistrict ? Number(finalDistrict) : null,
            subdivision_id: finalSub ? Number(finalSub) : Number(s),
            block_id: Number(b)
          });
        });
      });
    } else if (blockArr.length > 0 && distArr.length > 0) {
      blockArr.forEach(b => {
        const resolvedSub = ulbToSubdivision.get(String(b)) ?? null;
        distArr.forEach(d => {
          const resolvedDistrict = resolvedSub ? (subdivToDistrict.get(String(resolvedSub)) ?? null) : d;
          locations.push({
            district_id: resolvedDistrict ? Number(resolvedDistrict) : Number(d),
            subdivision_id: resolvedSub ? Number(resolvedSub) : null,
            block_id: Number(b)
          });
        });
      });
    } else if (blockArr.length > 0) {
      blockArr.forEach(b => {
        const resolvedSub = ulbToSubdivision.get(String(b)) ?? null;
        const resolvedDistrict = resolvedSub ? (subdivToDistrict.get(String(resolvedSub)) ?? null) : null;
        locations.push({
          district_id: resolvedDistrict ? Number(resolvedDistrict) : null,
          subdivision_id: resolvedSub ? Number(resolvedSub) : null,
          block_id: Number(b)
        });
      });
    } else if (subArr.length > 0) {
      subArr.forEach(s => {
        const resolvedDistrict = subdivToDistrict.get(String(s)) ?? null;
        locations.push({ district_id: resolvedDistrict ? Number(resolvedDistrict) : null, subdivision_id: Number(s), block_id: null });
      });
    } else if (distArr.length > 0) {
      distArr.forEach(d => locations.push({ district_id: Number(d), subdivision_id: null, block_id: null }));
    }

    const uniq = new Map<string, { district_id: number | null; subdivision_id: number | null; block_id: number | null }>();
    locations.forEach(loc => {
      const key = `${loc.district_id ?? ''}|${loc.subdivision_id ?? ''}|${loc.block_id ?? ''}`;
      if (!uniq.has(key)) {
        uniq.set(key, {
          district_id: loc.district_id === null ? null : Number(loc.district_id),
          subdivision_id: loc.subdivision_id === null ? null : Number(loc.subdivision_id),
          block_id: loc.block_id === null ? null : Number(loc.block_id)
        });
      }
    });

    return Array.from(uniq.values());
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
    this.profileForm.get('district_code')?.valueChanges.subscribe((district: string | string[] | null) => {
      this.profileForm.get('subdivision_code')?.reset();
      this.profileForm.get('ulb_code')?.reset();
      this.profileForm.get('ward_code')?.reset();
      this.subdivisions = [];
      this.ulbs = [];
      this.wards = [];
      if (district) {
        this.loadSubdivisions(district as string | string[]);
      }
    });

    this.profileForm.get('subdivision_code')?.valueChanges.subscribe(subdivision => {
      this.profileForm.get('ulb_code')?.reset();
      this.profileForm.get('ward_code')?.reset();
      this.ulbs = [];
      this.wards = [];
      if (subdivision) this.loadUlbs(subdivision);
    });

    this.profileForm.get('ulb_code')?.valueChanges.subscribe((ulb: string | string[] | null) => {
      this.profileForm.get('ward_code')?.reset();
      this.wards = [];

      const isDept = String(localStorage.getItem('userRole')) === 'department';
      if (!ulb) return;

      if (isDept) {
        this.loadingWards = false;
        return;
      }
      this.loadWards(ulb as string);
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

  loadSubdivisions(districtCodeOrCodes: string | string[]): void {
    this.loaderService.showLoader();
    this.loadingSubdivisions = true;

    const codes = Array.isArray(districtCodeOrCodes) ? districtCodeOrCodes : [districtCodeOrCodes];
    if (codes.length > 1) {
      const payload = { districts: codes.map(c => String(c)) };
      this.genericService.getByConditions(payload, 'api/tripura/get-multiple-subdivisions')
        .pipe(finalize(() => this.loaderService.hideLoader()))
        .subscribe({
          next: (res: any) => {
            const list = res?.subdivisions ?? [];
            if (res?.status === 1 && Array.isArray(list)) {
              this.subdivisions = list.map((s: any) => ({
                id: String(s.sub_division_code ?? s.subdivision_code ?? s.sub_lgd_code ?? ''),
                name: String(s.sub_division_name ?? s.subdivision_name ?? s.sub_division ?? ''),
                district_code: String(s.district_code ?? '')
              }));
            } else {
              this.subdivisions = [];
            }
            this.loadingSubdivisions = false;
          },
          error: (err: any) => {
            console.error('Failed to load subdivisions (multiple):', err);
            this.genericService.openSnackBar('Failed to load subdivisions', 'Error');
            this.loadingSubdivisions = false;
          }
        });
    } else {
      const selectedDistrict = this.districts.find(d => d.id === codes[0]);
      if (!selectedDistrict) {
        this.loadingSubdivisions = false;
        this.loaderService.hideLoader();
        return;
      }
      const payload = { district: selectedDistrict.name };
      this.genericService.getByConditions(payload, 'api/tripura/get-sub-subdivisions')
        .pipe(finalize(() => this.loaderService.hideLoader()))
        .subscribe({
          next: (res: any) => {
            if (res?.status === 1 && Array.isArray(res.subdivision)) {
              this.subdivisions = res.subdivision.map((s: Subdivision) => ({
                id: s.sub_lgd_code,
                name: s.sub_division
              }));
            } else {
              this.subdivisions = [];
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
  }


  loadUlbs(subdivisionOrCodes: string | string[]): void {
    this.loaderService.showLoader();
    this.loadingUlbs = true;

    const codes = Array.isArray(subdivisionOrCodes) ? subdivisionOrCodes : [subdivisionOrCodes];

    if (codes.length > 1) {
      const payload = { subdivisions: codes.map(c => String(c)) };
      this.genericService.getByConditions(payload, 'api/tripura/get-multiple-block')
        .pipe(finalize(() => this.loaderService.hideLoader()))
        .subscribe({
          next: (res: any) => {
            const list = res?.ulbs ?? [];
            if (res?.status === 1 && Array.isArray(list)) {
              this.ulbs = list.map((u: any) => ({
                id: String(u.block_code ?? u.ulb_lgd_code ?? u.id ?? ''),
                name: String(u.block_name ?? u.ulb_name ?? u.name ?? ''),
                subdivision_code: String(u.subdivision_code ?? u.sub_division_code ?? '')
              }));
            } else {
              this.ulbs = [];
            }
            this.loadingUlbs = false;
          },
          error: (err: any) => {
            console.error('Failed to load ULBs (multiple):', err);
            this.genericService.openSnackBar('Failed to load ULBs', 'Error');
            this.loadingUlbs = false;
          }
        });
    } else {
      const payload = { subdivision: codes[0] };
      this.genericService.getByConditions(payload, 'api/tripura/get-block-names')
        .pipe(finalize(() => this.loaderService.hideLoader()))
        .subscribe({
          next: (res: any) => {
            if (res?.status === 1 && Array.isArray(res.ulbs)) {
              this.ulbs = res.ulbs.map((u: ULB) => ({
                id: u.ulb_lgd_code,
                name: u.ulb_name
              }));
            } else {
              this.ulbs = [];
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
  }

  loadWards(ulbCodes: string | string[]): void {
    const isDept = String(localStorage.getItem('userRole')) === 'department';
    if (isDept) {
      this.loadingWards = false;
      return;
    }

    this.loadingWards = true;
    this.loaderService.showLoader();

    const codes = Array.isArray(ulbCodes) ? ulbCodes : [ulbCodes];
    const payload = codes.length === 1 ? { ulb: codes[0] } : { ulb: codes };

    this.genericService.getByConditions(payload, 'api/tripura/get-gp-vc-wards')
      .pipe(finalize(() => this.loaderService.hideLoader()))
      .subscribe({
        next: (res: any) => {
          if (res?.status === 1 && Array.isArray(res.ward)) {
            this.wards = res.ward.map((w: Ward) => ({
              id: w.gp_vc_ward_lgd_code,
              name: w.name_of_gp_vc_or_ward
            }));
          } else {
            this.wards = [];
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
