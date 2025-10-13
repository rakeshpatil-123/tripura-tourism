import { Component, Inject, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import {
  MatDialogRef,
  MatDialogActions,
  MatDialogModule,
  MAT_DIALOG_DATA,
} from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { GenericService } from '../../_service/generic/generic.service';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { OverlayModule } from '@angular/cdk/overlay';
import {
  MatNativeDateModule,
  provideNativeDateAdapter,
} from '@angular/material/core';
import moment from 'moment';
import { MatMomentDateModule } from '@angular/material-moment-adapter';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';

export enum NocType {
  CFE = 'CFE',
  CFO = 'CFO',
  RENEWAL = 'Renewal',
  SPECIAL = 'Special',
  OTHERS = 'Others',
}

@Component({
  selector: 'app-add-service-dialog',
  standalone: true,
  providers: [provideNativeDateAdapter()],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCheckboxModule,
    MatDialogActions,
    OverlayModule,
    MatDialogModule,
    MatIconModule,
    MatNativeDateModule,
    MatMomentDateModule,
    MatDatepickerModule,
    MatSlideToggleModule
  ],
  templateUrl: './add-service-dialog.component.html',
  styleUrls: ['./add-service-dialog.component.scss'],
})
export class AddServiceDialogComponent implements OnInit {
  serviceForm: FormGroup;
  departments : any[] = [];
  selectedServices : any[] = [];
  nocTypes = Object.values(NocType);
  allServices: any[] = [];
  loadingServices = false;
  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<AddServiceDialogComponent>,
    private genericService: GenericService,
    @Inject(MAT_DIALOG_DATA) public data: any 
  ) {
    this.serviceForm = this.fb.group({
      department_id: ['', Validators.required],
      service_title_or_description: ['', Validators.required],
      noc_name: ['', Validators.required],
      noc_short_name: ['', Validators.required],
      noc_type: [NocType.CFE, Validators.required],
      noc_payment_type: ['Calculated', Validators.required],
      target_days: [15, Validators.required],

      has_input_form: [true],
      depends_on_services: [''],

      generate_id: [true],
      generate_pdf: [true],
      generated_id_format: [''],
      show_letter_date: [true],


      show_valid_till: [true],
      auto_renewal: [false],
      external_data_share: [true],

      noc_validity: [365],
      valid_for_upload: [true],

      nsw_license_id: [''],
      status: [true],
      allow_repeat_application: [true],
      service_mode: ['native'],
      third_party_portal_name: [''],
      third_party_redirect_url: [''],
      third_party_return_url: [''],
      third_party_status_api_url: [''],
      third_party_payment_mode: ['unified'],
      verification_token: [''],
      is_special: ['no'],
    });
  }

  ngOnInit(): void {
    this.loadServices();
    this.getAllDepartmentList();
    
    if (this.data?.id) {
      this.genericService
        .getUpdationDataServiceAdmin({ service_id: this.data.id })
        .subscribe((res: any) => {
          if (res?.status === 1 && res.data) {
            const s = res.data;
            this.serviceForm.patchValue({
              department_id: s.department_id,
              service_title_or_description: s.service_title_or_description,
              noc_name: s.noc_name,
              noc_short_name: s.noc_short_name,
              noc_type: s.noc_type,
              noc_payment_type: s.noc_payment_type,
              target_days: s.target_days,
              has_input_form: s.has_input_form === 'yes',
              depends_on_services: (() => { const deps = s.depends_on_services; if (!deps) return []; if (Array.isArray(deps)) return deps; try { const parsed = JSON.parse(deps); if (Array.isArray(parsed)) return parsed; } catch (e) { return deps.replace(/[\[\]"']/g, '').split(',').map((x: string) => x.trim()).filter((x: any) => x); } return [];})(),
              generate_id: s.generate_id === 'yes',
              generate_pdf: s.generate_pdf === 'yes',
              show_letter_date: s.show_letter_date === 'yes',
              generated_id_format: s.generated_id_format,
              show_valid_till: s.show_valid_till === 'yes',
              auto_renewal: s.auto_renewal === 'yes',
              external_data_share: s.external_data_share === 'yes',
              noc_validity: s.noc_validity,
              valid_for_upload: s.valid_for_upload === 'yes',
              nsw_license_id: s.nsw_license_id,
              status: s.status === 1,
              allow_repeat_application: s.allow_repeat_application === 'yes',
              service_mode: s.service_mode ?? 'native',
              third_party_portal_name: s.third_party_portal_name,
              third_party_redirect_url: s.third_party_redirect_url,
              third_party_return_url: s.third_party_return_url,
              third_party_status_api_url: s.third_party_status_api_url,
              third_party_payment_mode: s.third_party_payment_mode,
              verification_token: s.verification_token,
              is_special: s.is_special || 'no',
            });
          }
        });
    }
  }

  closeDialog(): void {
    this.dialogRef.close();
  }
  loadServices(): void {
    this.loadingServices = true;
    this.genericService.getAdminServices().subscribe({
      next: (res: any) => {
        if (res.status === 1 && Array.isArray(res.data)) {
          const mappedServices = res.data.map((item: any) => ({
            id: item.id,
            name: item.service_title_or_description,
            department_name: item.department_name || 'N/A',
          }));
          this.allServices = [
            { id: '', name: 'None', department_name: '' },
            ...mappedServices,
          ];
        } else {
          this.allServices = [{ id: '', name: 'None', department_name: '' }];
        }
        this.loadingServices = false;
      },
      error: (err) => {
        console.error('Error fetching services:', err);
        this.genericService.openSnackBar('Failed to load services', 'Error');
        this.loadingServices = false;

        this.allServices = [{ id: '', name: 'None', department_name: '' }];
      },
    });
  }

  getAllDepartmentList(): void {
    this.genericService.getAllDepartmentNames().subscribe({
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

  submit(isUpdate: boolean) {
    if (this.serviceForm.valid) {
      const formValue = this.serviceForm.value;
      const payload = {
        department_id: formValue.department_id,
        service_title_or_description: formValue.service_title_or_description,
        noc_name: formValue.noc_name,
        noc_short_name: formValue.noc_short_name,
        noc_type: formValue.noc_type,
        noc_payment_type: formValue.noc_payment_type,
        target_days: formValue.target_days,
        has_input_form: formValue.has_input_form ? 'yes' : 'no',
        dpends_on_services: Array.isArray(formValue.depends_on_services) ? formValue.depends_on_services.filter((s: any) => s !== '').map((s: any) => `${s}`) : formValue.depends_on_services,
        generate_id: formValue.generate_id ? 'yes' : 'no',
        generate_pdf: formValue.generate_pdf ? 'yes' : 'no',
        show_letter_date: formValue.show_letter_date ? 'yes' : 'no',
        show_valid_till: formValue.show_valid_till ? 'yes' : 'no',
        auto_renewal: formValue.auto_renewal ? 'yes' : 'no',
        external_data_share: formValue.external_data_share ? 'yes' : 'no',
        noc_validity: formValue.noc_validity,
        valid_for_upload: formValue.valid_for_upload ? 'yes' : 'no',
        nsw_license_id: formValue.nsw_license_id,
        status: formValue.status ? 1 : 0,
        allow_repeat_application: formValue.allow_repeat_application
          ? 'yes'
          : 'no',
        service_mode: formValue.service_mode,
        third_party_portal_name: formValue.third_party_portal_name,
        third_party_redirect_url: formValue.third_party_redirect_url,
        third_party_return_url: formValue.third_party_return_url,
        third_party_status_api_url: formValue.third_party_status_api_url,
        third_party_payment_mode: formValue.third_party_payment_mode,
        verification_token: formValue.verification_token,
        is_special: formValue.is_special,
      };
      if (isUpdate) {
        const finalPayload = { id: this.data.id, ...payload };
        this.genericService.updateAdminService(finalPayload).subscribe({
          next: () => {
            this.genericService.openSnackBar('Service updated successfully', 'Success');
            this.dialogRef.close('updated');
          },
          error: (err) => console.error(err),
        });
      } else {
        this.genericService.addNewService(payload).subscribe({
          next: () => {
            this.genericService.openSnackBar('Service created successfully', 'Success');
            this.dialogRef.close('created');
          },
          error: (err) => console.error(err),
        });
      }
    } else {
      this.serviceForm.markAllAsTouched();
    }
  }
}
