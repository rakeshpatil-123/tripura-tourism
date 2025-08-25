import { Component, Input, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { IlogiInputComponent } from '../../../../customInputComponents/ilogi-input/ilogi-input.component';
import { IlogiRadioComponent } from '../../../../customInputComponents/ilogi-radio/ilogi-radio.component';
import { IlogiFileUploadComponent } from '../../../../customInputComponents/ilogi-file-upload/ilogi-file-upload.component';
import { IlogiInputDateComponent } from '../../../../customInputComponents/ilogi-input-date/ilogi-input-date.component';
import { GenericService } from '../../../../_service/generic/generic.service';

@Component({
  selector: 'app-attachment',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    IlogiInputComponent,
    IlogiRadioComponent,
    IlogiFileUploadComponent,
    IlogiInputDateComponent,
  ],
  templateUrl: './attachment.component.html',
  styleUrls: ['./attachment.component.scss'],
})
export class AttachmentComponent implements OnInit {
  @Input() submitted = false;

  form: FormGroup;
  additionalDocuments: Array<{
    slNo: number;
    name: string;
    file: File | null;
  }> = [];

  // Track which files are marked for deletion (only for your list)
  filesToDelete: Set<string> = new Set<string>();

  yesNoOptions = [
    { value: 'YES', name: 'Yes' },
    { value: 'NO', name: 'No' },
  ];
  additionalDoc = {
    name: 'Additional Document',
    file: null as File | null,
  };
  constructor(
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef,
    private apiService: GenericService
  ) {
    this.form = this.fb.group({
      // GENERAL
      selfCertification: [null],
      haveTree: ['', Validators.required],
      typeOfTree: [''],
      self_certificate_format_3A: [null],
      tree_registration_certificate: [null],

      // ENTERPRISE
      owner_pan_pdf: [null, Validators.required],
      owner_pan_number: ['', Validators.required],
      owner_aadhar_pdf: [null],
      owner_aadhar_number: [''],
      udyog_aadhar: [null],
      udyog_aadhar_number: [''],
      udyog_aadhar_registration_date: [''],
      gst_certificate_pdf: [null],
      gst_number: [''],

      // UNIT
      combinedBuilding: [null],
      landRegistrationDeed: [null],
      partnershipDetails: [null],
      processFlowChart: [null],
      detailProjectReport: [null],
      propertyTaxClearanceCertificate: [null],

      // Additional
      otherSupportingDoc: [null],
    });
  }

  ngOnInit(): void {
    this.loadExistingData();
  }

  loadExistingData(): void {
    this.apiService
      .getByConditions({}, 'api/caf/general-attachment-view')
      .subscribe({
        next: (res: any) => {
          if (res && res.status === 1 && res.data) {
            const data = res.data;

            this.form.patchValue({
              haveTree: data.do_you_have_trees_in_the_land_for_industry || 'NO',
              typeOfTree: data.type_of_tree || '',
              owner_pan_number: data.owner_pan_number || '',
              owner_aadhar_number: data.owner_aadhar_number || '',
              udyog_aadhar_number: data.udyog_aadhar_number || '',
              gst_number: data.gst_number || '',
              udyog_aadhar_registration_date:
                data.udyog_aadhar_registration_date
                  ? new Date(data.udyog_aadhar_registration_date)
                  : null,
            });

            // Only set file URLs (filename will be shown if we create placeholder)
            const fields: [string, string | null][] = [
              ['selfCertification', data.general_self_certification_form],
              ['self_certificate_format_3A', data.self_certificate_format_3A],
              [
                'tree_registration_certificate',
                data.tree_registration_certificate,
              ],
              ['owner_pan_pdf', data.owner_pan_pdf],
              ['owner_aadhar_pdf', data.owner_aadhar_pdf],
              ['udyog_aadhar', data.udyog_aadhar],
              ['gst_certificate_pdf', data.gst_certificate_pdf],
              ['combinedBuilding', data.combined_plan_document],
              ['detailProjectReport', data.detailed_project_report_pdf],
            ];

            fields.forEach(([controlName, url]) => {
              if (url) {
                const fileName = decodeURIComponent(
                  url.split('/').pop() || 'file.pdf'
                );
                const file = new File([], fileName, {
                  type: 'application/pdf',
                });
                this.form.get(controlName)?.setValue(file);
              }
            });

            // Additional docs (just basic)
            if (data.other_supporting_docuement1_pdf) {
              const url = data.other_supporting_docuement1_pdf;
              const fileName = decodeURIComponent(
                url.split('/').pop() || 'additional-document.pdf'
              );
              const placeholderFile = new File([], fileName, {
                type: 'application/pdf',
              });

              this.additionalDoc.file = placeholderFile;

              // Optional: fetch real blob
              fetch(url)
                .then((res) => res.blob())
                .then((blob) => {
                  const file = new File([blob], fileName, { type: blob.type });
                  this.additionalDoc.file = file;
                  this.cdr.markForCheck();
                })
                .catch(() => this.cdr.markForCheck());
            }
          }
        },
        error: () => {},
      });
  }

  removeFile(fieldName: string): void {
    const deletableFields: { [key: string]: string } = {
      owner_aadhar_pdf: 'remove_owner_aadhar_pdf',
      self_certificate_format_3A: 'remove_self_certificate_format_3A',
      tree_registration_certificate: 'remove_tree_registration_certificate',
      udyog_aadhar: 'remove_udyog_aadhar',
      combinedBuilding: 'remove_combined_plan_document',
      gst_certificate_pdf: 'remove_gst_certificate_pdf',
      detailProjectReport: 'remove_detailed_project_report_pdf',
    };

    const flag = deletableFields[fieldName];
    if (flag) {
      this.filesToDelete.add(flag);
      console.log('Marked for deletion:', flag); // 🔥 ADD THIS
    }

    this.form.get(fieldName)?.reset();
    this.cdr.markForCheck();
  }

  // ✅ Build FormData payload
  buildPayload(isDraft: boolean = false): FormData {
    const formData = new FormData();

    if (isDraft) {
      formData.append('save_data', '1');
    }

    // Just append all form values (only non-null files and strings)
    const raw = this.form.getRawValue();

    // === GENERAL ===
    formData.append('do_you_have_trees_in_the_land_for_industry', raw.haveTree);
    formData.append('type_of_tree', raw.typeOfTree || '');

    if (raw.selfCertification)
      formData.append('general_self_certification_form', raw.selfCertification);
    if (raw.self_certificate_format_3A)
      formData.append(
        'self_certificate_format_3A',
        raw.self_certificate_format_3A
      );
    if (raw.tree_registration_certificate)
      formData.append(
        'tree_registration_certificate',
        raw.tree_registration_certificate
      );

    // === ENTERPRISE ===
    if (raw.owner_pan_pdf) formData.append('owner_pan_pdf', raw.owner_pan_pdf);
    formData.append('owner_pan_number', raw.owner_pan_number || '');

    if (raw.owner_aadhar_pdf) {
      formData.append('owner_aadhar_pdf', raw.owner_aadhar_pdf);
      if (raw.owner_aadhar_number)
        formData.append('owner_aadhar_number', raw.owner_aadhar_number);
    }

    if (raw.udyog_aadhar) {
      formData.append('udyog_aadhar', raw.udyog_aadhar);
      if (raw.udyog_aadhar_number)
        formData.append('udyog_aadhar_number', raw.udyog_aadhar_number);
      if (raw.udyog_aadhar_registration_date)
        formData.append(
          'udyog_aadhar_registration_date',
          this.formatDate(raw.udyog_aadhar_registration_date)
        );
    }

    if (raw.gst_certificate_pdf) {
      formData.append('gst_certificate_pdf', raw.gst_certificate_pdf);
      if (raw.gst_number) formData.append('gst_number', raw.gst_number);
    }

    // === UNIT ===
    if (raw.combinedBuilding)
      formData.append('combined_plan_document', raw.combinedBuilding);
    if (raw.landRegistrationDeed)
      formData.append('unit_land_details_pdf', raw.landRegistrationDeed);
    if (raw.partnershipDetails)
      formData.append('unit_registaration_details_pdf', raw.partnershipDetails);
    if (raw.processFlowChart)
      formData.append(
        'unit_process_flow_chart_diagram_or_write_up_pdf',
        raw.processFlowChart
      );
    if (raw.detailProjectReport)
      formData.append('detailed_project_report_pdf', raw.detailProjectReport);
    if (raw.propertyTaxClearanceCertificate)
      formData.append(
        'unit_property_tax_clearance_certificate_pdf',
        raw.propertyTaxClearanceCertificate
      );

    // === Additional Docs ===
  // Single additional document
if (this.additionalDoc.file instanceof File) {
  formData.append('other_supporting_docuement1_pdf', this.additionalDoc.file);
}

    // ✅ === Add delete flags ===
    this.filesToDelete.forEach((flag) => {
      formData.append(flag, 'delete');
    });

    return formData;
  }

  private formatDate(date: any): string {
    if (!date) return '';
    const d = new Date(date);
    return d.toISOString().split('T')[0];
  }

  saveAsDraft(): void {
    const payload = this.buildPayload(true);
    this.submitForm(payload, true);
  }

  onSubmit(): void {
    const raw = this.form.getRawValue();
    const requiredFiles = [];
    if (!raw.selfCertification)
      requiredFiles.push('Self Certification Form (III)');
    if (!raw.owner_pan_pdf) requiredFiles.push('Owner PAN');

    if (requiredFiles.length > 0) {
      this.apiService.openSnackBar(
        `Please upload: ${requiredFiles.join(', ')}`,
        'error'
      );
      return;
    }

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.apiService.openSnackBar('Please fill required fields.', 'error');
      return;
    }

    const payload = this.buildPayload(false);
    this.submitForm(payload, false);
  }

  private submitForm(payload: FormData, isDraft: boolean): void {
    this.apiService
      .getByConditions(payload, 'api/caf/general-attachment-store')
      .subscribe({
        next: (res) => {
          const message = isDraft ? 'Draft saved!' : 'Submitted!';
          this.apiService.openSnackBar(message, 'success');
        },
        error: (err) => {
          this.apiService.openSnackBar('Save failed.', 'error');
        },
      });
  }

  onAdditionalDocSelected(file: File): void {
  this.additionalDoc.file = file;
  this.cdr.markForCheck();
}

removeAdditionalDoc(): void {
  this.additionalDoc.file = null;
  this.form.get('otherSupportingDoc')?.reset();
  this.cdr.markForCheck();
}

  addAdditionalDocument(): void {
    const name = this.form.get('additionalDocumentName')?.value?.trim();
    const file = this.form.get('additionalDocument')?.value;
    if (name && file instanceof File) {
      this.additionalDocuments.push({
        slNo: this.additionalDocuments.length + 1,
        name,
        file,
      });
      this.form.get('additionalDocumentName')?.reset();
      this.form.get('additionalDocument')?.reset();
      this.cdr.markForCheck();
    }
  }

  removeAdditionalDocument(index: number): void {
    this.additionalDocuments.splice(index, 1);
    this.cdr.markForCheck();
  }
}
