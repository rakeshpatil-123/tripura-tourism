import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
} from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { IlogiInputComponent } from '../../../customInputComponents/ilogi-input/ilogi-input.component';
import {
  IlogiSelectComponent,
  SelectOption,
} from '../../../customInputComponents/ilogi-select/ilogi-select.component';
import { Router } from '@angular/router';
import { GenericService } from '../../../_service/generic/generic.service';
import { IlogiRadioComponent } from '../../../customInputComponents/ilogi-radio/ilogi-radio.component';

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
    IlogiSelectComponent,
    IlogiRadioComponent,
  ],
  templateUrl: './registration.component.html',
  styleUrls: ['./registration.component.scss'],
})
export class RegistrationComponent implements OnInit, OnChanges {
  @Input() sourcePage: string | null = null;
  @Output() registrationSuccess = new EventEmitter<void>();
  @Input() editMode: boolean = false;
  @Input() editData: any = null;
  isSpecialRequired(): boolean {
    return this.sourcePage === 'departmental-users';
  }
  selectedDistricts: Array<{ id: string; subdivisions: Array<{ id: string; blocks: string[] }> }> = [];
  registrationForm: FormGroup;
  districts: SelectOption[] = [];
  subdivisions: SelectOption[] = [];
  ulbs: SelectOption[] = [];
  wards: SelectOption[] = [];
  departments: SelectOption[] = [];
  otpControl!: FormControl;
  otpSent = false;
  otpVerified = false;
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
    this.registrationForm = this.fb.group(
      {
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
      },
      {
        validators: this.passwordMatchValidator,
      }
    );

    this.otpControl = this.fb.control('', [
      Validators.required,
      Validators.pattern(/^\d{6}$/),
    ]);
  }

  ngOnInit(): void {
    this.loadDistricts();
    this.getAllDepartmentList();
    if (this.sourcePage === 'departmental-users') {
      this.registrationForm.patchValue({ user_type: 'department' });
      ['district_id', 'subdivision_id', 'ulb_id', 'ward_id'].forEach((ctrl) => {
        if (this.registrationForm.contains(ctrl)) {
          this.registrationForm.removeControl(ctrl);
        }
        this.registrationForm.addControl(ctrl, this.fb.control([]));
      });
      if (!this.registrationForm.contains('inspector')) {
        this.registrationForm.addControl('inspector', this.fb.control('0'));
      }
      if (!this.registrationForm.contains('hierarchy_level')) {
        this.registrationForm.addControl('hierarchy_level', this.fb.control(''));
      }
      if (!this.registrationForm.contains('department_id')) {
        this.registrationForm.addControl('department_id', this.fb.control(''));
      }
      if (!this.registrationForm.contains('designation')) {
      this.registrationForm.addControl('designation', this.fb.control(''));
      }
    } else {
      this.registrationForm.patchValue({ user_type: 'individual' });
      ['hierarchy_level', 'inspector', 'department_id', 'designation'].forEach(
        (ctrl) => {
          if (this.registrationForm.contains(ctrl)) {
            this.registrationForm.removeControl(ctrl);
          }
        }
      );
      ['district_id', 'subdivision_id', 'ulb_id', 'ward_id'].forEach((ctrl) => {
        if (this.registrationForm.contains(ctrl)) {
          this.registrationForm.removeControl(ctrl);
        }
        this.registrationForm.addControl(ctrl, this.fb.control(''));
      });
    }
    this.setupCascadingDropdowns();
    this.registrationForm.get('hierarchy_level')?.valueChanges.subscribe(() => {
      this.onHierarchyChange();
    });

    this.registrationForm.get('mobile_no')?.valueChanges.subscribe(() => {
      this.otpSent = false;
      this.otpVerified = false;
      this.otpControl.reset();
    });
  }
  ngOnChanges(changes: any): void {
    if (changes['editData'] && this.editData && this.editMode) {
      // Ensure prefill runs after ngOnInit has created/adjusted form controls
      setTimeout(() => {
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
      }, 0);
    }
  }
    /**
   * Called whenever hierarchy_level changes.
   * Resets district_id, subdivision_id, ulb_id and ward_id controls in a way
   * that plays well with both single-value selects and multi-select arrays
   * (departmental-users uses arrays).
   */
  onHierarchyChange(): void {
    // Reset only the 3 controls requested: district_id, subdivision_id, ulb_id
    const keys = ['district_id', 'subdivision_id', 'ulb_id'];

    keys.forEach(key => {
      const ctrl = this.registrationForm.get(key);
      if (!ctrl) return;

      const current = ctrl.value;
      // department mode uses arrays -> reset to empty array; otherwise reset to empty string
      if (Array.isArray(current)) {
        ctrl.setValue([], { emitEvent: true });
      } else {
        ctrl.setValue('', { emitEvent: true });
      }
      ctrl.updateValueAndValidity({ onlySelf: true, emitEvent: false });
    });

    // Clear dependent option lists so UI updates correctly
    this.subdivisions = [];
    this.ulbs = [];
    // clearing wards is safe (they exist) because ULB changed
    this.wards = [];
    
    // do NOT reference undefined properties like multipleSubdivisions/multipleUlbs here
    // selectedDistricts exists on the component; clearing it is safe but optional:
    this.selectedDistricts = [];
  }



  private normalizeToArray(v: any): string[] {
    if (v === null || v === undefined) return [];
    if (Array.isArray(v)) return v.map((x) => String(x));
    if (typeof v === 'string') {
      const trimmed = v.trim();
      if (!trimmed) return [];
      if (trimmed.includes(',')) {
        return trimmed.split(',').map((x) => x.trim()).filter(Boolean);
      }
      return [trimmed];
    }
    return [String(v)];
  }
  prefillEditData(): void {
    const data = this.editData;
    if (!data) return;
    const ensureControl = (name: string, defaultValue: any = '') => {
      if (!this.registrationForm.contains(name)) {
        this.registrationForm.addControl(name, this.fb.control(defaultValue));
      }
    };
    ['district_id', 'subdivision_id', 'ulb_id', 'ward_id', 'hierarchy_level', 'department_id', 'designation', 'inspector'].forEach(c => ensureControl(c));

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
      district_id: data.district_code ?? data.district_ids ?? '',
      subdivision_id: data.subdivision_code ?? data.subdivision_ids ?? '',
      ulb_id: data.ulb_code ?? data.ulb_ids ?? '',
      ward_id: data.ward_code ?? data.ward_ids ?? '',
      user_type: data.user_type || 'department',
      inspector: data.inspector === 'yes' ? '1' : '0',
    };
    const { hierarchy_level, ...otherFields } = prefill;
    this.registrationForm.patchValue(otherFields);
    this.registrationForm.get('hierarchy_level')?.setValue(prefill.hierarchy_level, { emitEvent: false });

    const districtArrLegacy = this.normalizeToArray(prefill.district_id);
    const subdivisionArrLegacy = this.normalizeToArray(prefill.subdivision_id);
    const ulbArrLegacy = this.normalizeToArray(prefill.ulb_id);
    const wardArrLegacy = this.normalizeToArray(prefill.ward_id);
    const locations: any[] = Array.isArray(data.locations) ? data.locations : [];

    const setArrayControlWhenReady = (
      controlName: string,
      ids: string[],
      optionList: Array<{ id: string; name?: string }>,
      triggerLoad?: (codes: string | string[]) => void,
      maxAttempts = 25,
      intervalMs = 200
    ) => {
      if (!ids || ids.length === 0) return;

      ids = ids.map((id: any) => String(id));

      const allPresent = () => ids.every(id => optionList.some(o => String(o.id) === String(id)));

      if (allPresent()) {
        this.registrationForm.get(controlName)?.setValue(ids);
        this.registrationForm.get(controlName)?.updateValueAndValidity();
        return;
      }
      if (typeof triggerLoad === 'function') {
        try { triggerLoad(ids); } catch (_e) { }
      }
      const missing = ids.filter(id => !optionList.some(o => String(o.id) === id));
      if (missing.length > 0) {
        const placeholderPrefix = controlName.includes('district') ? 'District' :
          controlName.includes('subdivision') ? 'Subdivision' :
            controlName.includes('ulb') ? 'ULB' : 'Item';
        missing.forEach(mid => {
          if (!optionList.some(o => String(o.id) === mid)) {
            optionList.push({ id: mid, name: `${placeholderPrefix} ${mid}` });
          }
        });
        this.registrationForm.get(controlName)?.setValue(ids);
        this.registrationForm.get(controlName)?.updateValueAndValidity();
      }
      let attempts = 0;
      const iv = setInterval(() => {
        attempts++;
        if (allPresent()) {
          clearInterval(iv);
          this.registrationForm.get(controlName)?.setValue(ids);
          this.registrationForm.get(controlName)?.updateValueAndValidity();
          return;
        }
        if (attempts >= maxAttempts) {
          clearInterval(iv);
          const available = ids.filter(id => optionList.some(o => String(o.id) === String(id)));
          if (available.length > 0) {
            this.registrationForm.get(controlName)?.setValue(available);
            this.registrationForm.get(controlName)?.updateValueAndValidity();
          }
        }
      }, intervalMs);
    };

    if (this.sourcePage === 'departmental-users' && locations.length > 0) {
      const districtSet = new Set<string>();
      const subdivisionSet = new Set<string>();
      const blockSet = new Set<string>();
      const grouped: Record<string, { id: string; name?: string; subdivisionsMap: Record<string, { name?: string; blocks: Map<string, { name?: string }> }> }> = {};

      locations.forEach((loc: any) => {
        const dId = loc.district_id !== undefined && loc.district_id !== null ? String(loc.district_id) : '';
        const sId = loc.subdivision_id !== undefined && loc.subdivision_id !== null ? String(loc.subdivision_id) : '';
        const bId = loc.block_id !== undefined && loc.block_id !== null ? String(loc.block_id) : '';

        const dName = loc.district_name ?? loc.district ?? undefined;
        const sName = loc.subdivision_name ?? loc.subdivision ?? loc.sub_division ?? undefined;
        const bName = loc.block_name ?? loc.block ?? loc.ulb_name ?? undefined;

        if (dId) districtSet.add(dId);
        if (sId) subdivisionSet.add(sId);
        if (bId) blockSet.add(bId);

        if (dId) {
          if (!grouped[dId]) {
            grouped[dId] = { id: dId, name: dName, subdivisionsMap: {} };
          } else if (!grouped[dId].name && dName) {
            grouped[dId].name = dName;
          }
        }

        if (dId && sId) {
          if (!grouped[dId].subdivisionsMap[sId]) {
            grouped[dId].subdivisionsMap[sId] = { name: sName, blocks: new Map() };
          } else if (!grouped[dId].subdivisionsMap[sId].name && sName) {
            grouped[dId].subdivisionsMap[sId].name = sName;
          }

          const blocksMap = grouped[dId].subdivisionsMap[sId].blocks;
          if (bId) {
            if (!blocksMap.has(bId)) {
              blocksMap.set(bId, { name: bName });
            } else {
              const existing = blocksMap.get(bId);
              if (!existing?.name && bName) {
                blocksMap.set(bId, { name: bName });
              }
            }
          }
        }
      });

      const districtIds = Array.from(districtSet).map(String);
      const subdivisionIds = Array.from(subdivisionSet).map(String);
      const ulbIds = Array.from(blockSet).map(String);

      districtIds.forEach((dId) => {
        if (!this.districts.some((d) => String(d.id) === dId)) {
          const name = grouped[dId]?.name ?? `District ${dId}`;
          this.districts.push({ id: dId, name });
        }
      });

      subdivisionIds.forEach((sId) => {
        const sNameCandidate = (() => {
          for (const dKey of Object.keys(grouped)) {
            const sm = grouped[dKey].subdivisionsMap[sId];
            if (sm && sm.name) return sm.name;
          }
          return `Subdivision ${sId}`;
        })();
        if (!this.subdivisions.some((s) => String(s.id) === sId)) {
          this.subdivisions.push({ id: sId, name: sNameCandidate });
        }
      });

      ulbIds.forEach((uId) => {
        const uNameCandidate = (() => {
          for (const dKey of Object.keys(grouped)) {
            for (const sKey of Object.keys(grouped[dKey].subdivisionsMap)) {
              const b = grouped[dKey].subdivisionsMap[sKey].blocks.get(uId);
              if (b && b.name) return b.name;
            }
          }
          return `ULB ${uId}`;
        })();
        if (!this.ulbs.some((u) => String(u.id) === uId)) {
          this.ulbs.push({ id: uId, name: uNameCandidate });
        }
      });

      this.selectedDistricts = Object.keys(grouped).map(dKey => {
        const subdivs = Object.keys(grouped[dKey].subdivisionsMap).map(sKey => {
          const blocks = Array.from(grouped[dKey].subdivisionsMap[sKey].blocks.keys());
          return { id: sKey, blocks };
        });
        return { id: dKey, subdivisions: subdivs };
      });
      if (districtIds.length) this.loadSubdivisions(districtIds);
      if (subdivisionIds.length) this.loadUlbs(subdivisionIds);
      setArrayControlWhenReady('district_id', districtIds, this.districts, (ids) => this.loadSubdivisions(ids));
      setArrayControlWhenReady('subdivision_id', subdivisionIds, this.subdivisions, (ids) => this.loadUlbs(ids));
      setArrayControlWhenReady('ulb_id', ulbIds, this.ulbs);
      const wardIdsFromLocations: string[] = (locations.filter(l => l.ward_id).map(l => String(l.ward_id)));
      if (wardIdsFromLocations.length > 0) {
        const uniqueWardIds = Array.from(new Set(wardIdsFromLocations));
        uniqueWardIds.forEach(wId => {
          if (!this.wards.some(w => String(w.id) === wId)) {
            const wName = (locations.find(l => String(l.ward_id) === wId)?.ward_name) ?? `Ward ${wId}`;
            this.wards.push({ id: wId, name: wName });
          }
        });
        this.registrationForm.get('ward_id')?.setValue(uniqueWardIds);
        this.registrationForm.get('ward_id')?.updateValueAndValidity();
      }

    } else {
      districtArrLegacy.forEach((dCode) => {
        if (!this.districts.some((d) => String(d.id) === String(dCode))) {
          this.districts.push({
            id: dCode,
            name: data.district || `District ${dCode}`,
          });
        }
      });

      if (this.sourcePage === 'departmental-users') {
        this.registrationForm.get('district_id')?.setValue(districtArrLegacy);
        this.registrationForm.get('district_id')?.updateValueAndValidity();

        if (districtArrLegacy.length > 0) {
          this.loadSubdivisions(districtArrLegacy);
          const subInterval = setInterval(() => {
            if (this.subdivisions.length > 0) {
              clearInterval(subInterval);
              subdivisionArrLegacy.forEach((sCode) => {
                if (!this.subdivisions.some((s) => String(s.id) === String(sCode))) {
                  this.subdivisions.push({ id: sCode, name: data.subdivision || `Subdivision ${sCode}` });
                }
              });
              this.registrationForm.get('subdivision_id')?.setValue(subdivisionArrLegacy);
              this.registrationForm.get('subdivision_id')?.updateValueAndValidity();

              if (subdivisionArrLegacy.length > 0) {
                this.loadUlbs(subdivisionArrLegacy);
                const ulbInterval = setInterval(() => {
                  if (this.ulbs.length > 0) {
                    clearInterval(ulbInterval);
                    ulbArrLegacy.forEach((uCode) => {
                      if (!this.ulbs.some((u) => String(u.id) === String(uCode))) {
                        this.ulbs.push({ id: uCode, name: data.ulb || `ULB ${uCode}` });
                      }
                    });
                    this.registrationForm.get('ulb_id')?.setValue(ulbArrLegacy);
                    this.registrationForm.get('ulb_id')?.updateValueAndValidity();

                    wardArrLegacy.forEach((wCode) => {
                      if (!this.wards.some((w) => String(w.id) === String(wCode))) {
                        this.wards.push({ id: wCode, name: data.ward || `Ward ${wCode}` });
                      }
                    });
                    this.registrationForm.get('ward_id')?.setValue(wardArrLegacy);
                    this.registrationForm.get('ward_id')?.updateValueAndValidity();
                  }
                }, 300);
              }
            }
          }, 300);
        }
      } else {
        this.registrationForm.patchValue({
          district_id: districtArrLegacy[0] ?? '',
        });

        if (districtArrLegacy[0]) {
          this.loadSubdivisions(districtArrLegacy[0]);
          const subInterval = setInterval(() => {
            if (this.subdivisions.length > 0) {
              clearInterval(subInterval);
              if (subdivisionArrLegacy[0] && !this.subdivisions.some((s) => s.id === subdivisionArrLegacy[0])) {
                this.subdivisions.push({
                  id: subdivisionArrLegacy[0],
                  name: data.subdivision || `Subdivision ${subdivisionArrLegacy[0]}`,
                });
              }
              this.registrationForm.patchValue({ subdivision_id: subdivisionArrLegacy[0] ?? '' });
              if (subdivisionArrLegacy[0]) {
                this.loadUlbs(subdivisionArrLegacy[0]);
                const ulbInterval = setInterval(() => {
                  if (this.ulbs.length > 0) {
                    clearInterval(ulbInterval);
                    if (ulbArrLegacy[0] && !this.ulbs.some((u) => u.id === ulbArrLegacy[0])) {
                      this.ulbs.push({
                        id: ulbArrLegacy[0],
                        name: data.ulb || `ULB ${ulbArrLegacy[0]}`,
                      });
                    }
                    this.registrationForm.patchValue({ ulb_id: ulbArrLegacy[0] ?? '' });
                    if (ulbArrLegacy[0]) {
                      this.loadWards(ulbArrLegacy[0]);
                      const wardInterval = setInterval(() => {
                        if (this.wards.length > 0) {
                          clearInterval(wardInterval);
                          if (wardArrLegacy[0] && !this.wards.some((w) => w.id === wardArrLegacy[0])) {
                            this.wards.push({
                              id: wardArrLegacy[0],
                              name: data.ward || `Ward ${wardArrLegacy[0]}`,
                            });
                          }
                          this.registrationForm.patchValue({ ward_id: wardArrLegacy[0] ?? '' });
                        }
                      }, 300);
                    }
                  }
                }, 300);
              }
            }
          }, 300);
        }
      }
    }
    const departmentExists = this.departments.some(
      (dep) => String(dep.id) === String(prefill.department_id)
    );
    if (!departmentExists && prefill.department_id) {
      this.departments.push({
        id: String(prefill.department_id),
        name: data.department_name || `Department ${prefill.department_id}`,
      });
    }
    setTimeout(() => {
      this.registrationForm.patchValue({
        name_of_enterprise: prefill.name_of_enterprise,
        authorized_person_name: prefill.authorized_person_name,
        email_id: prefill.email_id,
        mobile_no: prefill.mobile_no,
        user_name: prefill.user_name,
        registered_enterprise_address: prefill.registered_enterprise_address,
        registered_enterprise_city: prefill.registered_enterprise_city,
        department_id: prefill.department_id,
        designation: prefill.designation,
        user_type: prefill.user_type,
        inspector: prefill.inspector,
      });
      this.registrationForm.get('hierarchy_level')?.setValue(prefill.hierarchy_level, { emitEvent: false });
    }, 800);
  }

  setupCascadingDropdowns(): void {
    this.registrationForm.get('district_id')?.valueChanges.subscribe((district) => {
      if (Array.isArray(district)) {
        this.registrationForm.get('subdivision_id')?.setValue([]);
        this.registrationForm.get('ulb_id')?.setValue([]);
        this.registrationForm.get('ward_id')?.setValue([]);
      } else {
        this.registrationForm.get('subdivision_id')?.reset();
        this.registrationForm.get('ulb_id')?.reset();
        this.registrationForm.get('ward_id')?.reset();
      }
      this.subdivisions = [];
      this.ulbs = [];
      this.wards = [];

      if (district && (Array.isArray(district) ? district.length > 0 : true)) {
        this.loadSubdivisions(district);
      }
    });
    this.registrationForm.get('subdivision_id')?.valueChanges.subscribe((subdivision) => {
      if (Array.isArray(subdivision)) {
        this.registrationForm.get('ulb_id')?.setValue([]);
        this.registrationForm.get('ward_id')?.setValue([]);
      } else {
        this.registrationForm.get('ulb_id')?.reset();
        this.registrationForm.get('ward_id')?.reset();
      }

      this.ulbs = [];
      this.wards = [];

      if (subdivision && (Array.isArray(subdivision) ? subdivision.length > 0 : true)) {
        this.loadUlbs(subdivision);
      }
    });
    this.registrationForm.get('ulb_id')?.valueChanges.subscribe((ulb) => {
      if (Array.isArray(ulb)) {
        this.registrationForm.get('ward_id')?.setValue([]);
      } else {
        this.registrationForm.get('ward_id')?.reset();
      }
      this.wards = [];

      if (ulb && (Array.isArray(ulb) ? ulb.length > 0 : true)) {
        if (this.sourcePage === 'departmental-users') {
        } else {
          this.loadWards(ulb);
        }
      }
    });
  }

  loadDistricts(): void {
    this.loadingDistricts = true;
    this.genericService
      .getByConditions({}, 'api/tripura/get-all-districts')
      .subscribe({
        next: (res: any) => {
          if (res?.status === 1 && Array.isArray(res.districts)) {
            this.districts = res.districts.map((d: District) => ({
              id: d.district_code,
              name: d.district_name,
            }));
          }
          this.loadingDistricts = false;
        },
        error: (err: any) => {
          console.error('Failed to load districts:', err);
          this.genericService.openSnackBar('Failed to load districts', 'Error');
          this.loadingDistricts = false;
        },
      });
  }

  loadSubdivisions(districtCodes: string | string[]): void {
    this.loadingSubdivisions = true;
    const codes = Array.isArray(districtCodes) ? districtCodes : [districtCodes];

    let payload: any;
    let endpoint = 'api/tripura/get-sub-subdivisions';

    if (this.sourcePage === 'departmental-users' && codes.length > 1) {
      payload = { districts: codes.map((c) => Number(c)) };
      endpoint = 'api/tripura/get-multiple-subdivisions';
    } else {
      payload = { district: codes[0] };
      endpoint = 'api/tripura/get-sub-subdivisions';
    }

    this.genericService.getByConditions(payload, endpoint).subscribe({
      next: (res: any) => {
        const list = res?.subdivision ?? res?.subdivisions ?? [];
        if (res?.status === 1 && Array.isArray(list)) {
          this.subdivisions = list.map((s: any) => ({
            id:
              String(s.sub_lgd_code ?? s.sub_division_code ?? s.subdivision_code ?? s.id ?? ''),
            name:
              String(s.sub_division ?? s.sub_division_name ?? s.subdivision_name ?? s.name ?? ''),
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
      },
    });
  }



  loadUlbs(subdivisionCodes: string | string[]): void {
    this.loadingUlbs = true;
    const codes = Array.isArray(subdivisionCodes) ? subdivisionCodes : [subdivisionCodes];

    let payload: any;
    let endpoint = 'api/tripura/get-block-names';

    if (this.sourcePage === 'departmental-users' && codes.length > 1) {
      payload = { subdivisions: codes.map((c) => Number(c)) };
      endpoint = 'api/tripura/get-multiple-block';
    } else {
      payload = { subdivision: codes[0] };
      endpoint = 'api/tripura/get-block-names';
    }

    this.genericService.getByConditions(payload, endpoint).subscribe({
      next: (res: any) => {
        const list = res?.ulbs ?? res?.blocks ?? res?.data ?? [];
        if (res?.status === 1 && Array.isArray(list)) {
          this.ulbs = list.map((u: any) => ({
            id: String(u.ulb_lgd_code ?? u.block_code ?? u.block_lgd_code ?? u.id ?? ''),
            name: String(u.ulb_name ?? u.block_name ?? u.block_name ?? u.name ?? ''),
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
      },
    });
  }



  loadWards(ulbCodes: string | string[]): void {
    this.loadingWards = true;
    const codes = Array.isArray(ulbCodes) ? ulbCodes : [ulbCodes];
    const payload =
      codes.length === 1
        ? { ulb: codes[0] }
        : { ulb: codes };

    this.genericService
      .getByConditions(payload, 'api/tripura/get-gp-vc-wards')
      .subscribe({
        next: (res: any) => {
          if (res?.status === 1 && Array.isArray(res.ward)) {
            this.wards = res.ward.map((w: Ward) => ({
              id: w.gp_vc_ward_lgd_code,
              name: w.name_of_gp_vc_or_ward,
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
        },
      });
  }

  passwordMatchValidator(form: FormGroup) {
    const password = form.get('password')?.value;
    const confirmPassword = form.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { mismatch: true };
  }

  onSubmit(): void {
    if (
      !this.editMode &&
      this.sourcePage !== 'departmental-users' &&
      !this.otpVerified
    ) {
      this.genericService.openSnackBar(
        'Please verify your mobile number with OTP.',
        'Error'
      );
      return;
    }

    if (!this.registrationForm.valid) {
      this.genericService.openSnackBar('Please fill all required fields.', 'Error');
      return;
    }
    try {
      const { confirmPassword, ...raw } = this.registrationForm.value;
      const payload: any = { ...raw }
      if (payload.hasOwnProperty('inspector')) {
        const ins = payload.inspector;
        if (ins === '1' || ins === 1 || String(ins).toLowerCase() === 'yes') {
          payload.inspector = 'yes';
        } else {
          payload.inspector = 'no';
        }
      }

      const cascadeFields = ['district_id', 'subdivision_id', 'ulb_id', 'ward_id'];
      const hierarchy = this.registrationForm.get('hierarchy_level')?.value;
      const isStateLevel = ['state1', 'state2', 'state3'].includes(hierarchy);

      if (this.sourcePage === 'departmental-users') {
        if (isStateLevel) {
          if (payload.hasOwnProperty('locations')) delete payload.locations;
          cascadeFields.forEach((f) => {
            if (payload.hasOwnProperty(f)) delete payload[f];
          });
        } else {
          let locations: any[] = [];
          if (typeof (this as any).getLocationsPayload === 'function') {
            locations = (this as any).getLocationsPayload();
          }

          if (!Array.isArray(locations) || locations.length === 0) {
            const showDistrict = this.shouldShow('district');
            const showSubdivision = this.shouldShow('subdivision');
            const showBlock = this.shouldShow('block');
            const distArr = showDistrict ? this.normalizeToArray(payload.district_id) : [null];
            const subArr = showSubdivision ? this.normalizeToArray(payload.subdivision_id) : [null];
            const blockArr = showBlock ? this.normalizeToArray(payload.ulb_id) : [null];
            const built: any[] = [];
            distArr.forEach((d) => {
              subArr.forEach((s) => {
                blockArr.forEach((b) => {
                  built.push({
                    district_id: d ? Number(d) : null,
                    subdivision_id: s ? Number(s) : null,
                    block_id: b ? Number(b) : null,
                  });
                });
              });
            });
            const filtered = built.filter(
              (loc) => loc.district_id !== null || loc.subdivision_id !== null || loc.block_id !== null
            );
            const uniq = new Map<string, any>();
            filtered.forEach((loc) => {
              const key = `${loc.district_id ?? ''}|${loc.subdivision_id ?? ''}|${loc.block_id ?? ''}`;
              if (!uniq.has(key)) uniq.set(key, loc);
            });
            locations = Array.from(uniq.values());
          }
          if (Array.isArray(locations) && locations.length > 0) {
            payload.locations = locations;
          } else {
            if (payload.hasOwnProperty('locations')) delete payload.locations;
          }

          cascadeFields.forEach((f) => {
            if (payload.hasOwnProperty(f)) delete payload[f];
          });
        }
      } else {
        if (isStateLevel) {
          if (payload.hasOwnProperty('locations')) delete payload.locations;
          cascadeFields.forEach((f) => {
            if (payload.hasOwnProperty(f)) delete payload[f];
          });
        } else {
          cascadeFields.forEach((field) => {
            const v = payload[field];
            if (Array.isArray(v)) {
              payload[field] = v.length > 0 ? String(v[0]).trim() : '';
            } else if (v === null || v === undefined) {
              payload[field] = '';
            } else {
              payload[field] = String(v).trim();
            }
          });
        }
      }

      if (payload.user_type === 'individual') {
        delete payload.department_id;
        delete payload.designation;
        delete payload.hierarchy_level;
        delete payload.inspector;
      }
      const hierarchyFields = ['district_id', 'subdivision_id', 'ulb_id', 'ward_id'];
      const fieldToCheck: Record<string, string> = {
        district_id: 'district',
        subdivision_id: 'subdivision',
        ulb_id: 'block',
        ward_id: 'ward',
      };
      hierarchyFields.forEach((field) => {
        const check = fieldToCheck[field];
        if (!this.shouldShow(check) && payload.hasOwnProperty(field)) {
          delete payload[field];
        }
      });

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
          },
        });
      } else {
        this.registerNewUser(payload);
      }
    } catch (ex) {
      this.genericService.openSnackBar('Something went wrong. Please try again.', 'Error');
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
            user_type: 'department',
          });
          this.registrationForm.get('hierarchy_level')?.setValue('');
          this.registrationForm.get('department_id')?.setValue('');
          this.registrationForm.get('designation')?.setValue('');
        } else {
          this.registrationForm.patchValue({
            user_type: 'individual',
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
      },
    });
  }
  getLocationsPayload(): any[] {
    const locations: Array<{ district_id: number | null; subdivision_id: number | null; block_id: number | null }> = [];
    const rawDistrict = this.registrationForm.get('district_id')?.value;
    const rawSubdivision = this.registrationForm.get('subdivision_id')?.value;
    const rawUlb = this.registrationForm.get('ulb_id')?.value;
    const toArr = (v: any): string[] => {
      if (v === null || v === undefined) return [];
      if (Array.isArray(v)) return v.map(x => String(x)).filter(Boolean);
      const s = String(v).trim();
      if (!s) return [];
      return s.includes(',') ? s.split(',').map(x => x.trim()).filter(Boolean) : [s];
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
    }
    else if (distArr.length > 0 && subArr.length > 0) {
      distArr.forEach(d => {
        subArr.forEach(s => locations.push({ district_id: Number(d), subdivision_id: Number(s), block_id: null }));
      });
    }
    else if (subArr.length > 0 && blockArr.length > 0) {
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
    }
    else if (blockArr.length > 0) {
      blockArr.forEach(b => {
        const resolvedSub = ulbToSubdivision.get(String(b)) ?? null;
        const resolvedDistrict = resolvedSub ? (subdivToDistrict.get(String(resolvedSub)) ?? null) : null;
        locations.push({
          district_id: resolvedDistrict ? Number(resolvedDistrict) : null,
          subdivision_id: resolvedSub ? Number(resolvedSub) : null,
          block_id: Number(b)
        });
      });
    }
    else if (subArr.length > 0) {
      subArr.forEach(s => {
        const resolvedDistrict = subdivToDistrict.get(String(s)) ?? null;
        locations.push({ district_id: resolvedDistrict ? Number(resolvedDistrict) : null, subdivision_id: Number(s), block_id: null });
      });
    }
    else if (distArr.length > 0) {
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
    this.genericService
      .getByConditions({}, 'api/department-get-all-departments')
      .subscribe({
        next: (res: any) => {
          if (res?.status === 1 && Array.isArray(res.data)) {
            this.departments = res.data.map((d: any) => ({
              id: String(d.id ?? d.department_id),
              name: d.name ?? d.department_name ?? 'Unnamed Department',
            }));
          } else {
            this.departments = [];
          }
        },
        error: (err) => {
          console.error('Error fetching departments:', err);
          this.departments = [];
        },
      });
  }
shouldShow(field: string): boolean {
  const h = this.registrationForm.get('hierarchy_level')?.value;
  const u = this.registrationForm.get('user_type')?.value;
  if (field === 'ulb') field = 'block';
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
    if (field === 'ward') return true;
    return ['district', 'subdivision', 'block'].includes(field);
  }

  return false;
}

  getRadioOptions() {
    return [
      { label: 'Yes', value: 'yes' },
      { label: 'No', value: 'no' },
    ];
  }

  sendOtp(): void {
    const mobile = this.registrationForm.get('mobile_no')?.value;
    if (!mobile) {
      this.genericService.openSnackBar(
        'Please enter a valid mobile number.',
        'Error'
      );
      return;
    }

    this.genericService
      .getByConditions({ mobile_no: mobile }, 'api/user/send-otp')
      .subscribe({
        next: (res: any) => {
          if (res?.status === 1) {
            this.otpSent = true;
            if (res.message.includes('already verified')) {
              this.otpVerified = true;
              this.genericService.openSnackBar(
                'Mobile already verified.',
                'Success'
              );
            } else {
              this.genericService.openSnackBar(
                'OTP sent successfully.',
                'Success'
              );
            }
          }
        },
        error: (err: any) => {
          const message = this.extractErrorMessage(err);
          this.genericService.openSnackBar(message, 'Error');
          this.otpSent = false;
        },
      });
  }

  verifyOtp(): void {
    const mobile = this.registrationForm.get('mobile_no')?.value;
    const otp = this.otpControl.value;

    if (!mobile || !otp) {
      this.genericService.openSnackBar('Please enter mobile and OTP.', 'Error');
      return;
    }

    this.genericService
      .getByConditions(
        { mobile_no: mobile, otp_code: otp },
        'api/user/verify-otp'
      )
      .subscribe({
        next: (res: any) => {
          if (res?.status === 1) {
            this.otpVerified = true;
            this.genericService.openSnackBar(
              'OTP verified successfully!',
              'Success'
            );
          }
        },
        error: (err: any) => {
          const message = this.extractErrorMessage(err);
          this.genericService.openSnackBar(message, 'Error');
        },
      });
  }
}
