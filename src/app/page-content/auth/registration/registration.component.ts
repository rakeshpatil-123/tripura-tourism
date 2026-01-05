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
  FormControl,AbstractControl,
  ValidationErrors,
   ValidatorFn,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { of } from 'rxjs';
import {
  debounceTime,
  map,
  distinctUntilChanged,
  filter,
  switchMap,
  finalize,
  catchError,
  tap,
} from 'rxjs/operators';
import Swal from 'sweetalert2';
import { CommonModule } from '@angular/common';
import { IlogiInputComponent } from '../../../customInputComponents/ilogi-input/ilogi-input.component';
import {
  IlogiSelectComponent,
  SelectOption,
} from '../../../customInputComponents/ilogi-select/ilogi-select.component';
import { Router } from '@angular/router';
import { GenericService } from '../../../_service/generic/generic.service';
import { IlogiRadioComponent } from '../../../customInputComponents/ilogi-radio/ilogi-radio.component';
import { LoaderService } from '../../../_service/loader/loader.service';

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
  mobileStatusMessage: string = '';
  mobileStatusType: 'success' | 'error' | 'info' | '' = '';
  selectedDistricts: Array<{
    id: string;
    subdivisions: Array<{ id: string; blocks: string[] }>;
  }> = [];
  registrationForm: FormGroup;
  districts: SelectOption[] = [];
  subdivisions: SelectOption[] = [];
  ulbs: SelectOption[] = [];
  subdivisionsRaw: any[] = [];
  ulbsRaw: any[] = [];
  private PAN_REGEX = /^[A-Z]{5}[0-9]{4}[A-Z]$/;
  wards: SelectOption[] = [];
  departments: SelectOption[] = [];
  otpControl!: FormControl;
  otpSent = false;
  otpVerified = false;
  mobileChecked = false;
  loadingDistricts = false;
  loadingSubdivisions = false;
  loadingUlbs = false;
  loadingWards = false;
  hideSendOtp: boolean = false;
  hideVerify: boolean = false;
  private suppressCascading = false;
  private lastSubdivisionsKey = '';
  private lastUlbsKey = '';
  panStatusMessage: string = '';
  panStatusType: 'success' | 'error' | 'info' | '' = '';
  private departmentsLoaded = false;
  private loadingDepartments = false;
  whatsappSameAsMobile = true;
  errorMessage: string = '';
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
    private router: Router,
    private loaderService: LoaderService
  ) {
    this.registrationForm = this.fb.group(
      {
        name_of_enterprise: ['', []],
        authorized_person_name: ['', []],
        email_id: ['', []],
        pan: ['', [Validators.pattern(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/i)]],
        mobile_no: [''],
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
    this.registrationForm.setValidators(this.passwordMatchValidator);
    // create otp control as before
    this.otpControl = this.fb.control('', [
      Validators.required,
      Validators.pattern(/^\d{6}$/),
    ]);

    // IMPORTANT: ensure validators are correct for current sourcePage
    this.setPasswordValidators();

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
        this.registrationForm.addControl(
          'hierarchy_level',
          this.fb.control('')
        );
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

    this.registrationForm
      .get('pan')
      ?.valueChanges.pipe(
        map((v: string) => (v || '').toString().toUpperCase()),
        distinctUntilChanged(),
        tap((upper) => {
          const ctrl = this.registrationForm.get('pan');
          if (ctrl && ctrl.value !== upper) {
            ctrl.setValue(upper, { emitEvent: false });
          }
        }),
        debounceTime(500),
        tap((value: string) => {
          const panCtrl = this.registrationForm.get('pan');
          const panValue = value?.toString().trim();

          // CLEAR message & error immediately when PAN is empty or invalid
          if (!panValue || !this.PAN_REGEX.test(panValue)) {
            this.panStatusMessage = '';
            this.panStatusType = '';
            if (panCtrl?.hasError('registered')) {
              panCtrl.setErrors(null);
            }
          }
        }),
        filter((value: string) => this.PAN_REGEX.test(value)),
        switchMap((value: string) => {
          return this.genericService
            .getByConditions(
              { pan_no: value },
              'api/user/check-pan-resgistered'
            )
            .pipe(
              finalize(() => this.loaderService.hideLoader()),
              catchError((err) => {
                console.error('PAN check failed', err);
                return of(null);
              })
            );
        })
      )
      .subscribe((res: any) => {
        const panCtrl = this.registrationForm.get('pan');
        const panValue = panCtrl?.value?.toString().trim();
        if (!res) {
          this.panStatusMessage = '';
          this.panStatusType = '';
          const panCtrl = this.registrationForm.get('pan');
          if (panCtrl?.hasError('registered')) panCtrl.setErrors(null);
          return;
        }

        if (res.is_registered && panValue) {
          const message =
            res.message || 'Account already exists with this PAN number.';
          this.panStatusMessage = message;
          this.panStatusType = 'error';
          panCtrl?.setErrors({ registered: true });
        } else {
          this.panStatusMessage = res.message || '';
          this.panStatusType =
            res.status === 1 ? 'success' : res.status === 0 ? 'info' : '';
          const panCtrl = this.registrationForm.get('pan');
          if (panCtrl?.hasError('registered')) panCtrl.setErrors(null);
        }
      });
    const mobileCtrl = this.registrationForm.get('mobile_no');
    if (mobileCtrl && !(this.editMode && this.sourcePage === 'departmental-users' && this.editData)) {
      // immediate behavior on user edit (preserve existing behavior)
      mobileCtrl.valueChanges.subscribe((val: any) => {
        this.hideSendOtp = false;
        this.hideVerify = false;

        // clear mobile inline message when user edits (optional)
        this.mobileStatusMessage = '';
        this.mobileStatusType = '';

        // reset otp flags so user can request again
        this.otpSent = false;
        this.otpVerified = false;

        if (this.otpControl) {
          this.otpControl.reset();
        }
      });
      // validation pipeline: debounce + pattern + API check (runtime "is taken" feedback)
      mobileCtrl.valueChanges
        .pipe(
          map((v: any) => (v || '').toString().trim()),
          distinctUntilChanged(),
          debounceTime(500),
          filter((val: string) => /^[6-9]\d{9}$/.test(val)),
          switchMap((value: string) => {
            return this.genericService
              .getByConditions(
                { mobile_no: value },
                'api/user/check-mobile-resgistered'
              )
              .pipe(
                catchError((err) => {
                  console.error('Mobile check failed', err);
                  return of(null);
                })
              );
          })
        )
        .subscribe((res: any) => {
          // If API didn't return a useful payload, clear inline state and mark as not-checked
          if (!res) {
            this.mobileChecked = false;
            this.mobileStatusMessage = '';
            this.mobileStatusType = '';
            if (mobileCtrl?.hasError('taken')) mobileCtrl.setErrors(null);
            return;
          }

          // mark that we've got a definitive response for this value
          this.mobileChecked = true;

          const taken = !!(
            res.is_registered ||
            res.exists ||
            (res.status === 0 && !res.is_available)
          );
          if (taken) {
            const message =
              res.message || 'Account already exists with this mobile number.';
            this.mobileStatusMessage = message;
            this.mobileStatusType = 'error';
            mobileCtrl.setErrors({ taken: true });

            // hide OTP UI and reset any OTP state
            this.hideSendOtp = true;
            this.hideVerify = true;
            this.otpSent = false;

            // show one snackbar so user is aware
            this.genericService.openSnackBar(message, 'Close');
          } else {
            // available — show inline success/info and enable OTP UI
            this.mobileStatusMessage =
              res.message || 'Mobile number available.';
            this.mobileStatusType = res.status === 1 ? 'success' : 'info';

            this.hideSendOtp = false;
            this.hideVerify = false;

            if (mobileCtrl?.hasError('taken')) mobileCtrl.setErrors(null);
          }
        });
    }
  }
  ngOnChanges(changes: any): void {
    if (changes['sourcePage']) {
    // when sourcePage toggles, update validators
    this.setPasswordValidators();
  }
    if (changes['editData'] && this.editData && this.editMode) {
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
          setTimeout(() => {
            this.prefillEditData();
          }, 200);
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
    const keys = ['district_id', 'subdivision_id', 'ulb_id'];

    keys.forEach((key) => {
      const ctrl = this.registrationForm.get(key);
      if (!ctrl) return;

      const current = ctrl.value;
      // perform silent reset — don't emit valueChanges while programmatic
      if (Array.isArray(current)) {
        ctrl.setValue([], { emitEvent: false });
      } else {
        ctrl.setValue('', { emitEvent: false });
      }
      ctrl.updateValueAndValidity({ onlySelf: true, emitEvent: false });
    });

    this.subdivisions = [];
    this.ulbs = [];
    this.wards = [];

    // Clear selected districts grouping safely
    this.selectedDistricts = [];
  }

  private normalizeToArray(v: any): string[] {
    if (v === null || v === undefined) return [];
    if (Array.isArray(v)) return v.map((x) => String(x));
    if (typeof v === 'string') {
      const trimmed = v.trim();
      if (!trimmed) return [];
      if (trimmed.includes(',')) {
        return trimmed
          .split(',')
          .map((x) => x.trim())
          .filter(Boolean);
      }
      return [trimmed];
    }
    return [String(v)];
  }
  prefillEditData(): void {
    const data = this.editData;
    if (!data) return;
    this.suppressCascading = true;
    const ensureControl = (name: string, defaultValue: any = '') => {
      if (!this.registrationForm.contains(name)) {
        this.registrationForm.addControl(name, this.fb.control(defaultValue));
      }
    };
    [
      'district_id',
      'subdivision_id',
      'ulb_id',
      'ward_id',
      'hierarchy_level',
      'department_id',
      'designation',
      'inspector',
    ].forEach((c) => ensureControl(c));

    const prefill = {
      name_of_enterprise: data.name_of_enterprise || '',
      authorized_person_name: data.authorized_person_name || '',
      email_id: data.email_id || '',
      pan: data.pan || '',
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
    this.registrationForm
      .get('hierarchy_level')
      ?.setValue(prefill.hierarchy_level, { emitEvent: false });

    const districtArrLegacy = this.normalizeToArray(prefill.district_id);
    const subdivisionArrLegacy = this.normalizeToArray(prefill.subdivision_id);
    const ulbArrLegacy = this.normalizeToArray(prefill.ulb_id);
    const wardArrLegacy = this.normalizeToArray(prefill.ward_id);
    const locations: any[] = Array.isArray(data.locations)
      ? data.locations
      : [];

    const setArrayControlWhenReady = (
      controlName: string,
      ids: string[],
      optionList: Array<{ id: string; name?: string }>,
      triggerLoad?: (codes: string | string[]) => void,
      maxAttempts = 0,
      intervalMs = 0
    ) => {
      if (!ids || ids.length === 0) return;

      ids = ids.map((id: any) => String(id));

      const allPresent = () =>
        ids.every((id) => optionList.some((o) => String(o.id) === String(id)));

      if (allPresent()) {
        this.registrationForm.get(controlName)?.setValue(ids);
        this.registrationForm.get(controlName)?.updateValueAndValidity();
        return;
      }
      if (typeof triggerLoad === 'function') {
        try {
          triggerLoad(ids);
        } catch (_e) {}
      }
      const missing = ids.filter(
        (id) => !optionList.some((o) => String(o.id) === id)
      );
      if (missing.length > 0) {
        const placeholderPrefix = controlName.includes('district')
          ? 'District'
          : controlName.includes('subdivision')
          ? 'Subdivision'
          : controlName.includes('ulb')
          ? 'ULB'
          : 'Item';
        missing.forEach((mid) => {
          if (!optionList.some((o) => String(o.id) === mid)) {
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
          const available = ids.filter((id) =>
            optionList.some((o) => String(o.id) === String(id))
          );
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
      const grouped: Record<
        string,
        {
          id: string;
          name?: string;
          subdivisionsMap: Record<
            string,
            { name?: string; blocks: Map<string, { name?: string }> }
          >;
        }
      > = {};

      locations.forEach((loc: any) => {
        const dId =
          loc.district_id !== undefined && loc.district_id !== null
            ? String(loc.district_id)
            : '';
        const sId =
          loc.subdivision_id !== undefined && loc.subdivision_id !== null
            ? String(loc.subdivision_id)
            : '';
        const bId =
          loc.block_id !== undefined && loc.block_id !== null
            ? String(loc.block_id)
            : '';

        const dName = loc.district_name ?? loc.district ?? undefined;
        const sName =
          loc.subdivision_name ??
          loc.subdivision ??
          loc.sub_division ??
          undefined;
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
            grouped[dId].subdivisionsMap[sId] = {
              name: sName,
              blocks: new Map(),
            };
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

      this.selectedDistricts = Object.keys(grouped).map((dKey) => {
        const subdivs = Object.keys(grouped[dKey].subdivisionsMap).map(
          (sKey) => {
            const blocks = Array.from(
              grouped[dKey].subdivisionsMap[sKey].blocks.keys()
            );
            return { id: sKey, blocks };
          }
        );
        return { id: dKey, subdivisions: subdivs };
      });
      // if (districtIds.length) this.loadSubdivisions(districtIds);
      // if (subdivisionIds.length) this.loadUlbs(subdivisionIds);
      setArrayControlWhenReady(
        'district_id',
        districtIds,
        this.districts,
        (ids) => this.loadSubdivisions(ids)
      );
      setArrayControlWhenReady(
        'subdivision_id',
        subdivisionIds,
        this.subdivisions,
        (ids) => {
          this.loadUlbs(ids);
        }
      );
      setArrayControlWhenReady('ulb_id', ulbIds, this.ulbs);
      const wardIdsFromLocations: string[] = locations
        .filter((l) => l.ward_id)
        .map((l) => String(l.ward_id));
      if (wardIdsFromLocations.length > 0) {
        const uniqueWardIds = Array.from(new Set(wardIdsFromLocations));
        uniqueWardIds.forEach((wId) => {
          if (!this.wards.some((w) => String(w.id) === wId)) {
            const wName =
              locations.find((l) => String(l.ward_id) === wId)?.ward_name ??
              `Ward ${wId}`;
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
                if (
                  !this.subdivisions.some((s) => String(s.id) === String(sCode))
                ) {
                  this.subdivisions.push({
                    id: sCode,
                    name: data.subdivision || `Subdivision ${sCode}`,
                  });
                }
              });
              this.registrationForm
                .get('subdivision_id')
                ?.setValue(subdivisionArrLegacy);
              this.registrationForm
                .get('subdivision_id')
                ?.updateValueAndValidity();

              // if (subdivisionArrLegacy.length > 0) {
              //   this.loadUlbs(subdivisionArrLegacy);
              //   const ulbInterval = setInterval(() => {
              //     if (this.ulbs.length > 0) {
              //       clearInterval(ulbInterval);
              //       ulbArrLegacy.forEach((uCode) => {
              //         if (!this.ulbs.some((u) => String(u.id) === String(uCode))) {
              //           this.ulbs.push({ id: uCode, name: data.ulb || `ULB ${uCode}` });
              //         }
              //       });
              //       this.registrationForm.get('ulb_id')?.setValue(ulbArrLegacy);
              //       this.registrationForm.get('ulb_id')?.updateValueAndValidity();

              //       wardArrLegacy.forEach((wCode) => {
              //         if (!this.wards.some((w) => String(w.id) === String(wCode))) {
              //           this.wards.push({ id: wCode, name: data.ward || `Ward ${wCode}` });
              //         }
              //       });
              //       this.registrationForm.get('ward_id')?.setValue(wardArrLegacy);
              //       this.registrationForm.get('ward_id')?.updateValueAndValidity();
              //     }
              //   }, 200);
              // }
            }
          }, 200);
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
              if (
                subdivisionArrLegacy[0] &&
                !this.subdivisions.some((s) => s.id === subdivisionArrLegacy[0])
              ) {
                this.subdivisions.push({
                  id: subdivisionArrLegacy[0],
                  name:
                    data.subdivision ||
                    `Subdivision ${subdivisionArrLegacy[0]}`,
                });
              }
              this.registrationForm.patchValue({
                subdivision_id: subdivisionArrLegacy[0] ?? '',
              });
              // if (subdivisionArrLegacy[0]) {
              //   this.loadUlbs(subdivisionArrLegacy[0]);
              //   const ulbInterval = setInterval(() => {
              //     if (this.ulbs.length > 0) {
              //       clearInterval(ulbInterval);
              //       if (ulbArrLegacy[0] && !this.ulbs.some((u) => u.id === ulbArrLegacy[0])) {
              //         this.ulbs.push({
              //           id: ulbArrLegacy[0],
              //           name: data.ulb || `ULB ${ulbArrLegacy[0]}`,
              //         });
              //       }
              //       this.registrationForm.patchValue({ ulb_id: ulbArrLegacy[0] ?? '' });
              //       if (ulbArrLegacy[0]) {
              //         this.loadWards(ulbArrLegacy[0]);
              //         const wardInterval = setInterval(() => {
              //           if (this.wards.length > 0) {
              //             clearInterval(wardInterval);
              //             if (wardArrLegacy[0] && !this.wards.some((w) => w.id === wardArrLegacy[0])) {
              //               this.wards.push({
              //                 id: wardArrLegacy[0],
              //                 name: data.ward || `Ward ${wardArrLegacy[0]}`,
              //               });
              //             }
              //             this.registrationForm.patchValue({ ward_id: wardArrLegacy[0] ?? '' });
              //           }
              //         }, 300);
              //       }
              //     }
              //   }, 300);
              // }
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
        pan: prefill.pan,
        mobile_no: prefill.mobile_no,
        user_name: prefill.user_name,
        registered_enterprise_address: prefill.registered_enterprise_address,
        registered_enterprise_city: prefill.registered_enterprise_city,
        department_id: prefill.department_id,
        designation: prefill.designation,
        user_type: prefill.user_type,
        inspector: prefill.inspector,
      });
      this.registrationForm
        .get('hierarchy_level')
        ?.setValue(prefill.hierarchy_level, { emitEvent: false });
      this.suppressCascading = false;
    }, 500);
  }

  private areSameValues(a: any, b: any): boolean {
    if (Array.isArray(a) && Array.isArray(b)) {
      if (a.length !== b.length) return false;
      const A = [...a].map(String).sort();
      const B = [...b].map(String).sort();
      return A.every((v, i) => v === B[i]);
    }
    return String(a) === String(b);
  }

  setupCascadingDropdowns(): void {
    // this.registrationForm.get('district_id')?.valueChanges.subscribe((district) => {
    //   if (Array.isArray(district)) {
    //     this.registrationForm.get('subdivision_id')?.setValue([]);
    //     this.registrationForm.get('ulb_id')?.setValue([]);
    //     this.registrationForm.get('ward_id')?.setValue([]);
    //   } else {
    //     this.registrationForm.get('subdivision_id')?.reset();
    //     this.registrationForm.get('ulb_id')?.reset();
    //     this.registrationForm.get('ward_id')?.reset();
    //   }
    //   this.subdivisions = [];
    //   this.ulbs = [];
    //   this.wards = [];

    //   if (district && (Array.isArray(district) ? district.length > 0 : true)) {
    //     this.loadSubdivisions(district);
    //   }
    // });
    // this.registrationForm.get('subdivision_id')?.valueChanges.subscribe((subdivision) => {
    //   if (Array.isArray(subdivision)) {
    //     this.registrationForm.get('ulb_id')?.setValue([]);
    //     this.registrationForm.get('ward_id')?.setValue([]);
    //   } else {
    //     this.registrationForm.get('ulb_id')?.reset();
    //     this.registrationForm.get('ward_id')?.reset();
    //   }

    //   this.ulbs = [];
    //   this.wards = [];

    //   if (subdivision && (Array.isArray(subdivision) ? subdivision.length > 0 : true)) {
    //     this.loadUlbs(subdivision);
    //   }
    // });
    // this.registrationForm.get('ulb_id')?.valueChanges.subscribe((ulb) => {
    //   if (Array.isArray(ulb)) {
    //     this.registrationForm.get('ward_id')?.setValue([]);
    //   } else {
    //     this.registrationForm.get('ward_id')?.reset();
    //   }
    //   this.wards = [];

    //   if (ulb && (Array.isArray(ulb) ? ulb.length > 0 : true)) {
    //     if (this.sourcePage === 'departmental-users') {
    //     } else {
    //       this.loadWards(ulb);
    //     }
    //   }
    // });
    this.registrationForm
      .get('district_id')
      ?.valueChanges.pipe(
        distinctUntilChanged((a, b) => this.areSameValues(a, b))
      )
      .subscribe((district) => {
        if (this.suppressCascading) return;

        // reset request caches when parent changes
        this.lastSubdivisionsKey = '';
        this.lastUlbsKey = '';

        if (Array.isArray(district)) {
          this.registrationForm
            .get('subdivision_id')
            ?.setValue([], { emitEvent: false });
          this.registrationForm
            .get('ulb_id')
            ?.setValue([], { emitEvent: false });
          this.registrationForm
            .get('ward_id')
            ?.setValue([], { emitEvent: false });
        } else {
          this.registrationForm
            .get('subdivision_id')
            ?.reset({ emitEvent: false });
          this.registrationForm.get('ulb_id')?.reset({ emitEvent: false });
          this.registrationForm.get('ward_id')?.reset({ emitEvent: false });
        }

        this.subdivisions = [];
        this.ulbs = [];
        this.wards = [];

        if (
          district &&
          (Array.isArray(district) ? district.length > 0 : true)
        ) {
          this.loadSubdivisions(district);
        }
      });

    this.registrationForm
      .get('subdivision_id')
      ?.valueChanges.pipe(
        distinctUntilChanged((a, b) => this.areSameValues(a, b))
      )
      .subscribe((subdivision) => {
        if (this.suppressCascading) return;

        // reset ulb cache when subdivision changes
        this.lastUlbsKey = '';

        if (Array.isArray(subdivision)) {
          this.registrationForm
            .get('ulb_id')
            ?.setValue([], { emitEvent: false });
          this.registrationForm
            .get('ward_id')
            ?.setValue([], { emitEvent: false });
        } else {
          this.registrationForm.get('ulb_id')?.reset({ emitEvent: false });
          this.registrationForm.get('ward_id')?.reset({ emitEvent: false });
        }

        this.ulbs = [];
        this.wards = [];

        if (
          subdivision &&
          (Array.isArray(subdivision) ? subdivision.length > 0 : true)
        ) {
          this.loadUlbs(subdivision);
        }
      });

    this.registrationForm
      .get('ulb_id')
      ?.valueChanges.pipe(
        distinctUntilChanged((a, b) => this.areSameValues(a, b))
      )
      .subscribe((ulb) => {
        if (this.suppressCascading) return;

        if (Array.isArray(ulb)) {
          this.registrationForm
            .get('ward_id')
            ?.setValue([], { emitEvent: false });
        } else {
          this.registrationForm.get('ward_id')?.reset({ emitEvent: false });
        }
        this.wards = [];

        if (ulb && (Array.isArray(ulb) ? ulb.length > 0 : true)) {
          if (this.sourcePage === 'departmental-users') {
            // departmental-users handles wards differently — keep same logic
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
    const codesRaw = Array.isArray(districtCodes)
      ? districtCodes
      : [districtCodes];

    // normalize & remove falsy values
    const codes = codesRaw
      .map((c: any) => String(c).trim())
      .filter((c: string) => c !== '' && c !== 'null' && c !== 'undefined');

    // nothing valid to query
    if (codes.length === 0) {
      this.loadingSubdivisions = false;
      return;
    }

    // prevent duplicate identical requests (use normalized codes)
    const key = codes.map(String).sort().join(',');
    if (key === this.lastSubdivisionsKey) {
      this.loadingSubdivisions = false;
      return;
    }
    this.lastSubdivisionsKey = key;

    let payload: any;
    let endpoint = 'api/tripura/get-sub-subdivisions';

    if (this.sourcePage === 'departmental-users' && codes.length >= 1) {
      const numeric = codes.map((c) => Number(c)).filter((n) => !isNaN(n));
      if (numeric.length === 0) {
        this.loadingSubdivisions = false;
        return;
      }
      payload = { districts: numeric };
      endpoint = 'api/tripura/get-multiple-subdivisions';
    } else {
      payload = { district: codes[0] };
      endpoint = 'api/tripura/get-sub-subdivisions';
    }

    this.genericService.getByConditions(payload, endpoint).subscribe({
      next: (res: any) => {
        const list = res?.subdivision ?? res?.subdivisions ?? [];
        const incoming = Array.isArray(list) ? list : [];

        // helper to compute canonical id for a subdivision
        const subKey = (s: any) =>
          String(
            s?.sub_lgd_code ??
              s?.sub_division_code ??
              s?.subdivision_code ??
              s?.id ??
              ''
          ).trim();

        // Merge raw subdivisions into this.subdivisionsRaw (avoid overwriting previous batches)
        const mergedSubMap = new Map<string, any>();
        // start with existing raw items
        (this.subdivisionsRaw || []).forEach((s: any) => {
          const k = subKey(s);
          if (k) mergedSubMap.set(k, s);
        });
        // merge incoming, prefer incoming non-empty names to fill gaps
        incoming.forEach((s: any) => {
          const k = subKey(s);
          if (!k) return;
          const existing = mergedSubMap.get(k);
          if (!existing) {
            mergedSubMap.set(k, s);
          } else {
            // if existing has no sensible name but incoming has, replace
            const existingName = String(
              existing?.sub_division_name ??
                existing?.subdivision_name ??
                existing?.sub_division ??
                ''
            ).trim();
            const incomingName = String(
              s?.sub_division ??
                s?.sub_division_name ??
                s?.subdivision_name ??
                s?.name ??
                ''
            ).trim();
            if ((!existingName || existingName === '') && incomingName) {
              mergedSubMap.set(k, s);
            }
          }
        });
        this.subdivisionsRaw = Array.from(mergedSubMap.values());

        // Build UI-friendly subdivisions array and merge (avoid duplicates)
        const incomingOptions = incoming
          .map((s: any) => ({
            id: subKey(s),
            name: String(
              s.sub_division ??
                s.sub_division_name ??
                s.subdivision_name ??
                s.name ??
                ''
            ),
          }))
          .filter((o) => o.id);

        const uiMap = new Map<string, SelectOption>();
        (this.subdivisions || []).forEach((o: any) => {
          if (o && o.id) uiMap.set(String(o.id), o);
        });
        incomingOptions.forEach((o) => {
          if (!uiMap.has(o.id)) uiMap.set(o.id, o);
        });
        this.subdivisions = Array.from(uiMap.values());

        // if API returned empty but we have existing UI options, keep them (don't clear)
        if (
          !(res?.status === 1 && Array.isArray(list)) &&
          (!this.subdivisions || this.subdivisions.length === 0)
        ) {
          this.subdivisions = [];
        }

        this.loadingSubdivisions = false;
      },
      error: (err: any) => {
        console.error('Failed to load subdivisions:', err);
        this.genericService.openSnackBar(
          'Failed to load subdivisions',
          'Error'
        );
        this.loadingSubdivisions = false;
      },
    });
  }

  loadUlbs(subdivisionCodes: string | string[]): void {
    this.loadingUlbs = true;
    const codesRaw = Array.isArray(subdivisionCodes)
      ? subdivisionCodes
      : [subdivisionCodes];

    // normalize & remove falsy values
    const codes = codesRaw
      .map((c: any) => String(c).trim())
      .filter((c: string) => c !== '' && c !== 'null' && c !== 'undefined');

    // nothing valid to query
    if (codes.length === 0) {
      this.loadingUlbs = false;
      return;
    }

    // prevent duplicate identical requests (use normalized codes)
    const key = codes.map(String).sort().join(',');
    if (key === this.lastUlbsKey) {
      this.loadingUlbs = false;
      return;
    }
    this.lastUlbsKey = key;

    let payload: any;
    let endpoint = 'api/tripura/get-block-names';

    if (this.sourcePage === 'departmental-users' && codes.length >= 1) {
      const numeric = codes.map((c) => Number(c)).filter((n) => !isNaN(n));
      if (numeric.length === 0) {
        this.loadingUlbs = false;
        return;
      }
      payload = { subdivisions: numeric };
      endpoint = 'api/tripura/get-multiple-block';
    } else {
      payload = { subdivision: codes[0] };
      endpoint = 'api/tripura/get-block-names';
    }

    this.genericService.getByConditions(payload, endpoint).subscribe({
      next: (res: any) => {
        const list = res?.ulbs ?? res?.blocks ?? res?.data ?? [];
        const incoming = Array.isArray(list) ? list : [];

        // helper to compute canonical id for a ULB
        const ulKey = (u: any) =>
          String(
            u?.ulb_lgd_code ?? u?.block_code ?? u?.block_lgd_code ?? u?.id ?? ''
          ).trim();

        // Merge raw ulbs into this.ulbsRaw (preserve previously loaded ULBs)
        const mergedUlMap = new Map<string, any>();
        (this.ulbsRaw || []).forEach((u: any) => {
          const k = ulKey(u);
          if (k) mergedUlMap.set(k, u);
        });
        incoming.forEach((u: any) => {
          const k = ulKey(u);
          if (!k) return;
          const existing = mergedUlMap.get(k);
          if (!existing) {
            mergedUlMap.set(k, u);
          } else {
            // prefer incoming to fill missing name or parent info
            const existingName = String(
              existing?.ulb_name ?? existing?.block_name ?? existing?.name ?? ''
            ).trim();
            const incomingName = String(
              u?.ulb_name ?? u?.block_name ?? u?.name ?? ''
            ).trim();
            if ((!existingName || existingName === '') && incomingName) {
              mergedUlMap.set(k, u);
            }
          }
        });
        this.ulbsRaw = Array.from(mergedUlMap.values());

        // Build UI-friendly ULBs array and merge (avoid duplicates)
        const incomingOptions = incoming
          .map((u: any) => ({
            id: ulKey(u),
            name: String(u.ulb_name ?? u.block_name ?? u.name ?? ''),
          }))
          .filter((o) => o.id);

        const uiMap = new Map<string, SelectOption>();
        (this.ulbs || []).forEach((o: any) => {
          if (o && o.id) uiMap.set(String(o.id), o);
        });
        incomingOptions.forEach((o) => {
          if (!uiMap.has(o.id)) uiMap.set(o.id, o);
        });
        this.ulbs = Array.from(uiMap.values());

        // if API returned empty but we have existing UI options, keep them (don't clear)
        if (
          !(res?.status === 1 && Array.isArray(list)) &&
          (!this.ulbs || this.ulbs.length === 0)
        ) {
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
    const payload = codes.length === 1 ? { ulb: codes[0] } : { ulb: codes };

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

  // passwordMatchValidator(form: FormGroup) {
  //   const password = form.get('password')?.value;
  //   const confirmPassword = form.get('confirmPassword')?.value;
  //   return password === confirmPassword ? null : { mismatch: true };
  // }

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
      this.genericService.openSnackBar(
        'Please fill all required fields.',
        'Error'
      );
      return;
    }
    try {
      const {
        confirmPassword,
        whatsapp_no: formWhatsappNo,
        ...raw
      } = this.registrationForm.value;
      const payload: any = { ...raw };
      payload.whatsapp_no = this.whatsappSameAsMobile
        ? raw.mobile_no
        : formWhatsappNo;
      if (payload.hasOwnProperty('inspector')) {
        const ins = payload.inspector;
        if (ins === '1' || ins === 1 || String(ins).toLowerCase() === 'yes') {
          payload.inspector = 'yes';
        } else {
          payload.inspector = 'no';
        }
      }

      const cascadeFields = [
        'district_id',
        'subdivision_id',
        'ulb_id',
        'ward_id',
      ];
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
            const distArr = showDistrict
              ? this.normalizeToArray(payload.district_id)
              : [null];
            const subArr = showSubdivision
              ? this.normalizeToArray(payload.subdivision_id)
              : [null];
            const blockArr = showBlock
              ? this.normalizeToArray(payload.ulb_id)
              : [null];
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
              (loc) =>
                loc.district_id !== null ||
                loc.subdivision_id !== null ||
                loc.block_id !== null
            );
            const uniq = new Map<string, any>();
            filtered.forEach((loc) => {
              const key = `${loc.district_id ?? ''}|${
                loc.subdivision_id ?? ''
              }|${loc.block_id ?? ''}`;
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
      const hierarchyFields = [
        'district_id',
        'subdivision_id',
        'ulb_id',
        'ward_id',
      ];
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
      if (this.sourcePage === 'departmental-users' && payload.pan === '') {
        delete payload.pan;
      }

      if (this.editMode && this.editData?.user_id) {
        const payloadWithId = { ...payload, id: this.editData.user_id };

        this.loaderService.showLoader();
        this.genericService.updateProfile(payloadWithId).pipe(finalize(() => this.loaderService.hideLoader())).subscribe({
          next: (res: any) => {
            this.genericService.openSnackBar(
              'User updated successfully!',
              'Success'
            );
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
      this.genericService.openSnackBar(
        'Something went wrong. Please try again.',
        'Error'
      );
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
    const locations: Array<{
      district_id: number | null;
      subdivision_id: number | null;
      block_id: number | null;
    }> = [];
    const rawDistrict = this.registrationForm.get('district_id')?.value;
    const rawSubdivision = this.registrationForm.get('subdivision_id')?.value;
    const rawUlb = this.registrationForm.get('ulb_id')?.value;

    const toArr = (v: any): string[] => {
      if (v === null || v === undefined) return [];
      if (Array.isArray(v)) return v.map((x) => String(x)).filter(Boolean);
      const s = String(v).trim();
      if (!s) return [];
      return s.includes(',')
        ? s
            .split(',')
            .map((x) => x.trim())
            .filter(Boolean)
        : [s];
    };

    const distArr = toArr(rawDistrict); // selected district codes (strings)
    const subArr = toArr(rawSubdivision); // selected subdivision ids (strings)
    const blockArr = toArr(rawUlb); // selected block/ulb ids (strings)

    // helper: canonicalize possible id fields from API raw objects
    const getSubId = (s: any) =>
      String(
        s?.sub_lgd_code ??
          s?.sub_lgd ??
          s?.sub_division_code ??
          s?.subdivision_code ??
          s?.sub_division ??
          s?.id ??
          ''
      ).trim();
    const getSubDistrict = (s: any) =>
      String(
        s?.district_code ?? s?.district_id ?? s?.district_code ?? ''
      ).trim();
    const getUlId = (u: any) =>
      String(
        u?.ulb_lgd_code ?? u?.block_code ?? u?.block_lgd_code ?? u?.id ?? ''
      ).trim();
    const getUlSub = (u: any) =>
      String(
        u?.subdivision_code ??
          u?.sub_division_code ??
          u?.subdivision_id ??
          u?.sub_division ??
          ''
      ).trim();
    const getUlDistrict = (u: any) =>
      String(
        u?.district_code ?? u?.district_id ?? u?.district_code ?? ''
      ).trim();

    // Build maps from raw API responses (these raw arrays come from loadSubdivisions/loadUlbs)
    const subdivToDistrict = new Map<string, string>();
    (this.subdivisionsRaw || []).forEach((s: any) => {
      const sid = getSubId(s);
      const did = getSubDistrict(s);
      if (sid) subdivToDistrict.set(sid, did || '');
    });

    const ulbMap = new Map<string, any>(); // ulbId -> raw ulb object
    (this.ulbsRaw || []).forEach((u: any) => {
      const uid = getUlId(u);
      if (uid) ulbMap.set(uid, u);
    });

    // also create subdivision -> list of ulb ids (from ulbsRaw) for fast lookup
    const subdivToUlbs = new Map<string, string[]>();
    (this.ulbsRaw || []).forEach((u: any) => {
      const uid = getUlId(u);
      const sid = getUlSub(u);
      if (!uid || !sid) return;
      const arr = subdivToUlbs.get(sid) ?? [];
      if (!arr.includes(uid)) arr.push(uid);
      subdivToUlbs.set(sid, arr);
    });

    const selectedDistSet = new Set(distArr.map(String));
    const selectedSubSet = new Set(subArr.map(String));
    const selectedBlockSet = new Set(blockArr.map(String));

    // 1) If blocks are selected -> produce one location per selected block, resolved to its real parent subdivision & district
    if (blockArr.length > 0) {
      blockArr.forEach((bRaw) => {
        const b = String(bRaw);
        // find ulb raw entry
        const ulbRaw =
          ulbMap.get(b) ??
          (this.ulbsRaw || []).find((u: any) => getUlId(u) === b) ??
          null;

        // if found, get parent subdivision and district directly from it
        let parentSub = ulbRaw ? getUlSub(ulbRaw) || null : null;
        let parentDist = ulbRaw ? getUlDistrict(ulbRaw) || null : null;

        // if not found in ulbsRaw, attempt fallback via selectedDistricts grouping (prefill)
        if (
          !parentSub &&
          this.selectedDistricts &&
          this.selectedDistricts.length
        ) {
          for (const d of this.selectedDistricts) {
            for (const s of d.subdivisions || []) {
              const blocks = (s.blocks || []).map((x: any) => String(x));
              if (blocks.includes(b)) {
                parentSub = String(s.id);
                parentDist = String(d.id);
                break;
              }
            }
            if (parentSub) break;
          }
        }

        // if user explicitly selected subdivisions, ensure the block belongs to one of them
        if (selectedSubSet.size > 0) {
          if (!parentSub) return; // cannot confirm parent -> skip block
          if (!selectedSubSet.has(parentSub)) return; // block's sub not selected -> skip
        }

        // if parentSub still not found -> skip (safe, prevents cross-mapping)
        if (!parentSub) return;

        // if parentDist not present from ulbRaw, try subdivisionsRaw map
        if ((!parentDist || parentDist === '') && parentSub) {
          parentDist = subdivToDistrict.get(parentSub) ?? parentDist ?? null;
          if (
            (!parentDist || parentDist === '') &&
            this.subdivisionsRaw &&
            this.subdivisionsRaw.length
          ) {
            const found = this.subdivisionsRaw.find(
              (ss: any) => getSubId(ss) === parentSub
            );
            if (found) parentDist = getSubDistrict(found) || null;
          }
        }

        // if user explicitly selected districts, ensure this block belongs to one of them
        if (selectedDistSet.size > 0) {
          if (!parentDist) return; // cannot resolve district -> skip
          if (!selectedDistSet.has(parentDist)) return; // belongs to unselected district -> skip
        }

        locations.push({
          district_id: parentDist ? Number(parentDist) : null,
          subdivision_id: parentSub ? Number(parentSub) : null,
          block_id: Number(b),
        });
      });
    }
    // 2) No blocks selected but subdivisions selected -> output each selected subdivision paired with its actual district
    else if (subArr.length > 0) {
      subArr.forEach((sRaw) => {
        const s = String(sRaw);
        // resolve district from subdivisionsRaw map
        let parentDist = subdivToDistrict.get(s) ?? null;

        if (
          (!parentDist || parentDist === '') &&
          this.subdivisionsRaw &&
          this.subdivisionsRaw.length
        ) {
          const found = this.subdivisionsRaw.find(
            (ss: any) => getSubId(ss) === s
          );
          if (found) parentDist = getSubDistrict(found) || null;
        }

        // if the user explicitly selected districts, ensure this subdivision belongs to one of them
        if (selectedDistSet.size > 0) {
          if (!parentDist) return; // can't resolve district -> skip
          if (!selectedDistSet.has(parentDist)) return; // subdivision belongs to unselected district -> skip
        }

        locations.push({
          district_id: parentDist ? Number(parentDist) : null,
          subdivision_id: Number(s),
          block_id: null,
        });
      });
    }
    // 3) Only districts selected -> output district-only entries
    else if (distArr.length > 0) {
      distArr.forEach((d) => {
        locations.push({
          district_id: Number(d),
          subdivision_id: null,
          block_id: null,
        });
      });
    }

    // dedupe (same as before)
    const uniq = new Map<
      string,
      {
        district_id: number | null;
        subdivision_id: number | null;
        block_id: number | null;
      }
    >();
    locations.forEach((loc) => {
      const key = `${loc.district_id ?? ''}|${loc.subdivision_id ?? ''}|${
        loc.block_id ?? ''
      }`;
      if (!uniq.has(key)) {
        uniq.set(key, {
          district_id:
            loc.district_id === null ? null : Number(loc.district_id),
          subdivision_id:
            loc.subdivision_id === null ? null : Number(loc.subdivision_id),
          block_id: loc.block_id === null ? null : Number(loc.block_id),
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
    if (this.departmentsLoaded || this.loadingDepartments) return;
    this.loadingDepartments = true;

    this.genericService
      .getByConditions({}, 'api/department-get-all-departments')
      .subscribe({
        next: (res: any) => {
          if (res?.status === 1 && Array.isArray(res.data)) {
            this.departments = res.data.map((d: any) => ({
              id: String(d.id ?? d.department_id),
              name: d.name ?? d.department_name ?? 'Unnamed Department',
            }));
            this.departmentsLoaded = true;
          } else {
            this.departments = [];
          }
          this.loadingDepartments = false;
        },
        error: (err) => {
          console.error('Error fetching departments:', err);
          this.departments = [];
          this.loadingDepartments = false;
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
          // Reset inline message state first
          this.mobileStatusMessage = '';
          this.mobileStatusType = '';
          // Reset control-specific hide flags by default (will set below if needed)
          this.hideSendOtp = false;
          this.hideVerify = false;

          if (res?.status === 1) {
            // Successful flow from backend
            // Determine message text (backend-driven)
            const msg = (
              typeof res.message === 'string' ? res.message : ''
            ).trim();
            const msgLower = msg.toLowerCase();

            // OTP was actually sent by backend
            this.otpSent = true;
            this.mobileStatusMessage =
              msg || 'OTP sent successfully to your mobile number.';
            this.mobileStatusType = 'success';
            this.genericService.openSnackBar(
              this.mobileStatusMessage,
              'Success'
            );

            // If backend indicates number already verified/taken & verified, mark verified and hide verify controls
            if (msgLower.includes('already') && msgLower.includes('verified')) {
              // preserve otpVerified semantics
              this.otpVerified = true;
              this.hideVerify = true; // hide OTP input + Verify button
              this.hideSendOtp = true; // hide Send OTP (already verified)
            } else {
              // OTP was sent normally — hide the Send OTP button to avoid duplicate sends
              this.hideSendOtp = true;
              // keep hideVerify false so Verify UI appears when otpSent && !otpVerified
            }
          } else {
            // Backend returned a non-1 status — show backend message if any
            this.otpSent = false;
            this.mobileStatusMessage = res?.message || 'Unable to send OTP.';
            this.mobileStatusType = 'error';
            this.hideSendOtp = false; // allow user to try again unless message says otherwise
            this.genericService.openSnackBar(this.mobileStatusMessage, 'Error');

            // If backend explicitly says "already taken and verified" even with non-1, handle similarly:
            const msg = (
              typeof res?.message === 'string' ? res.message : ''
            ).trim();
            const msgLower = msg.toLowerCase();
            if (msgLower.includes('already') && msgLower.includes('verified')) {
              this.otpVerified = true;
              this.hideVerify = true;
              this.hideSendOtp = true;
            }
          }
        },
        error: (err: any) => {
          // Extract message using your existing helper (keeps parity)
          const message = this.extractErrorMessage(err);

          // Show inline error and snackbar (keeps existing behaviour)
          this.mobileStatusMessage =
            message || 'Failed to send OTP. Please try again.';
          this.mobileStatusType = 'error';
          this.genericService.openSnackBar(this.mobileStatusMessage, 'Error');

          // preserve flag behaviour
          this.otpSent = false;

          // ensure send otp remains available after error (unless backend said otherwise)
          this.hideSendOtp = false;
          this.hideVerify = false;
        },
      });
  }

  verifyOtp(): void {
    const mobile = this.registrationForm
      .get('mobile_no')
      ?.value?.toString()
      .trim();
    const otp = this.otpControl?.value?.toString().trim();

    // basic client-side checks
    if (!mobile || !/^[6-9]\d{9}$/.test(mobile)) {
      this.genericService.openSnackBar(
        'Please enter a valid 10-digit mobile number.',
        'Error'
      );
      return;
    }
    if (!otp || !/^\d{4,6}$/.test(otp)) {
      // accept 4-6 digit OTPs; adjust if your OTP length differs
      this.genericService.openSnackBar('Please enter the OTP.', 'Error');
      return;
    }

    // call backend (keeps the same genericService method you were using)
    this.genericService
      .getByConditions(
        { mobile_no: mobile, otp_code: otp },
        'api/user/verify-otp'
      )
      .subscribe({
        next: (res: any) => {
          // Successful verification
          if (res && res.status === 1) {
            // update flags and UI state
            this.otpVerified = true;
            this.hideVerify = true;
            this.otpSent = false;
            this.mobileChecked = true;

            // use server message if present
            this.mobileStatusMessage =
              res.message || 'OTP verified successfully.';
            this.mobileStatusType = 'success';

            // clear "taken" validation if present
            const mobileCtrl = this.registrationForm.get('mobile_no');
            if (mobileCtrl?.hasError('taken')) {
              mobileCtrl.setErrors(null);
            }

            // reset OTP control so user can't re-submit the same code
            if (this.otpControl) {
              this.otpControl.reset();
            }

            // notify user (keeps previous snackbar behaviour)
            this.genericService.openSnackBar(
              this.mobileStatusMessage,
              'Success'
            );
          } else {
            // handle explicit failure from server
            const errMsg =
              res && res.message ? res.message : 'OTP verification failed.';
            this.mobileStatusMessage = errMsg;
            this.mobileStatusType = 'error';
            this.genericService.openSnackBar(errMsg, 'Error');
          }
        },
        error: (err: any) => {
          // extractErrorMessage was used previously — keep using it if available
          const message =
            typeof this.extractErrorMessage === 'function'
              ? this.extractErrorMessage(err)
              : err?.message || 'Something went wrong. Please try again.';

          this.mobileStatusMessage = message;
          this.mobileStatusType = 'error';
          this.genericService.openSnackBar(message, 'Error');
        },
      });
  }

  toggleWhatsappSameAsMobile(event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    this.whatsappSameAsMobile = checked;

    if (checked) {
      this.registrationForm.removeControl('whatsapp_no');
    } else {
      this.registrationForm.addControl(
        'whatsapp_no',
        this.fb.control('', [
          Validators.required,
          Validators.pattern(/^\d{10}$/),
        ])
      );
    }
  }
  private getRedirectUrl(path: string): string {
    const { origin, pathname } = window.location;
    const basePath =
      pathname === '/' || pathname === ''
        ? ''
        : pathname.startsWith('/new')
        ? '/new'
        : '';
    const normalized = path.startsWith('/') ? path : `/${path}`;
    return `${origin}${basePath}${normalized}`;
  }

  goToLogin(): void {
    window.location.href = this.getRedirectUrl('/page/login');
  }
  /**
 * Update password & confirmPassword validators based on sourcePage and editMode.
 * - If sourcePage === 'departmental-users' => password NOT required.
 * - Otherwise => password required + minlength + pattern; confirmPassword required.
 * Also call updateValueAndValidity to refresh form validity state.
 */
private setPasswordValidators(): void {
  const pwdCtrl = this.registrationForm.get('password');
  const confCtrl = this.registrationForm.get('confirmPassword');

  if (!pwdCtrl || !confCtrl) return;

  if (this.sourcePage === 'departmental-users') {
    // departmental users: password optional
    pwdCtrl.clearValidators();
    pwdCtrl.setValidators([]); // optional
    // confirm password optional as well
    confCtrl.clearValidators();
    confCtrl.setValidators([]);
  } else {
    // normal users: password required
    pwdCtrl.clearValidators();
    pwdCtrl.setValidators([
      Validators.required,
      Validators.minLength(6),
      Validators.pattern(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).+$/
      ),
    ]);

    confCtrl.clearValidators();
    confCtrl.setValidators([Validators.required]);
  }

  pwdCtrl.updateValueAndValidity({ emitEvent: false });
  confCtrl.updateValueAndValidity({ emitEvent: false });

  // ensure group-level validator re-evaluates
  this.registrationForm.updateValueAndValidity({ onlySelf: false, emitEvent: false });
}

/**
 * ValidatorFn for password match. Compatible with Angular's ValidatorFn signature.
 * - If sourcePage === 'departmental-users' => skip validation.
 * - If both fields empty => skip validation (no error).
 * - Otherwise enforce equality.
 */
private passwordMatchValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  try {
    // skip entire check for departmental users
    if (this.sourcePage === 'departmental-users') return null;

    const form = control as FormGroup;
    const pwd = form.get('password')?.value;
    const conf = form.get('confirmPassword')?.value;

    // if both empty -> no error
    if ((pwd === null || pwd === '' || pwd === undefined) && (conf === null || conf === '' || conf === undefined)) {
      return null;
    }

    return pwd !== conf ? { passwordMismatch: true } : null;
  } catch (e) {
    return null;
  }
};

}