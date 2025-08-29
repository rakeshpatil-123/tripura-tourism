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
  ],
  templateUrl: './add-service-dialog.component.html',
  styleUrls: ['./add-service-dialog.component.scss'],
})
export class AddServiceDialogComponent implements OnInit {
  serviceForm: FormGroup;
  departments = [
    { id: 1, name: 'Municipal' },
    { id: 2, name: 'Energy' },
    { id: 3, name: 'Transport' },
    { id: 5, name: 'Labour' },
  ];
  nocTypes = Object.values(NocType);

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

      label_noc_date: [''],
      label_noc_doc: [''],
      label_noc_no: [''],
      label_valid_till: [new Date(), Validators.required],

      show_valid_till: [true],
      auto_renewal: [false],
      external_data_share: [true],

      noc_validity: [365, Validators.required],
      valid_for_upload: [true],

      nsw_license_id: [''],
      status: [1, Validators.required],
      allow_repeat_application: [true],
    });
  }

  ngOnInit(): void {
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
              depends_on_services: s.depends_on_services,
              generate_id: s.generate_id === 'yes',
              generate_pdf: s.generate_pdf === 'yes',
              show_letter_date: s.show_letter_date === 'yes',
              generated_id_format: s.generated_id_format,
              label_noc_date: s.label_noc_date,
              label_noc_doc: s.label_noc_doc,
              label_noc_no: s.label_noc_no,
              label_valid_till: s.label_valid_till
                ? new Date(s.label_valid_till)
                : null,
              show_valid_till: s.show_valid_till === 'yes',
              auto_renewal: s.auto_renewal === 'yes',
              external_data_share: s.external_data_share === 'yes',
              noc_validity: s.noc_validity,
              valid_for_upload: s.valid_for_upload === 'yes',
              nsw_license_id: s.nsw_license_id,
              status: s.status ?? 1,
              allow_repeat_application: s.allow_repeat_application === 'yes',
            });
          }
        });
    }
  }

  closeDialog(): void {
    this.dialogRef.close();
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
        depends_on_services: formValue.depends_on_services,
        generate_id: formValue.generate_id ? 'yes' : 'no',
        generate_pdf: formValue.generate_pdf ? 'yes' : 'no',
        show_letter_date: formValue.show_letter_date ? 'yes' : 'no',
        generated_id_format: formValue.generated_id_format,
        label_noc_date: formValue.label_noc_date,
        label_noc_doc: formValue.label_noc_doc,
        label_noc_no: formValue.label_noc_no,
        label_valid_till: formValue.label_valid_till
          ? moment(formValue.label_valid_till).format('YYYY-MM-DD')
          : null,
        show_valid_till: formValue.show_valid_till ? 'yes' : 'no',
        auto_renewal: formValue.auto_renewal ? 'yes' : 'no',
        external_data_share: formValue.external_data_share ? 'yes' : 'no',
        noc_validity: formValue.noc_validity,
        valid_for_upload: formValue.valid_for_upload ? 'yes' : 'no',
        nsw_license_id: formValue.nsw_license_id,
        status: formValue.status ?? 1,
        allow_repeat_application: formValue.allow_repeat_application
          ? 'yes'
          : 'no',
      };

      if (isUpdate) {
        const finalPayload = { id: this.data.id, ...payload };
        this.genericService.updateAdminService(finalPayload).subscribe({
          next: () => this.dialogRef.close('updated'),
          error: (err) => console.error(err),
        });
      } else {
        this.genericService.addNewService(payload).subscribe({
          next: () => this.dialogRef.close('created'),
          error: (err) => console.error(err),
        });
      }
    } else {
      this.serviceForm.markAllAsTouched();
    }
  }
}
