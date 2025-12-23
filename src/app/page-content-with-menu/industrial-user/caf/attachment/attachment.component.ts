import { Component, Input, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { IlogiInputComponent } from '../../../../customInputComponents/ilogi-input/ilogi-input.component';
import { IlogiRadioComponent } from '../../../../customInputComponents/ilogi-radio/ilogi-radio.component';
import { IlogiFileUploadComponent } from '../../../../customInputComponents/ilogi-file-upload/ilogi-file-upload.component';
import { IlogiInputDateComponent } from '../../../../customInputComponents/ilogi-input-date/ilogi-input-date.component';
import { GenericService } from '../../../../_service/generic/generic.service';
import { MatIcon } from '@angular/material/icon';

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
    MatIcon,
  ],
  templateUrl: './attachment.component.html',
  styleUrls: ['./attachment.component.scss'],
})
export class AttachmentComponent implements OnInit {
  // Keep these for [fileUrl] binding in template
  selfCertificationUrl: string | null = null;
  selfCertificateFormat3AUrl: string | null = null;
  treeRegistrationCertificateUrl: string | null = null;
  ownerPanPdfUrl: string | null = null;
  ownerAadharPdfUrl: string | null = null;
  udyogAadharUrl: string | null = null;
  gstCertificatePdfUrl: string | null = null;
  combinedBuildingUrl: string | null = null;
  landRegistrationDeedUrl: string | null = null;
  partnershipDetailsUrl: string | null = null;
  processFlowChartUrl: string | null = null;
  detailProjectReportUrl: string | null = null;
  propertyTaxClearanceCertificateUrl: string | null = null;
  additionalDocUrl: string | null = null;

  @Input() submitted = false;

  form: FormGroup;
  additionalDocuments: Array<{
    slNo: number;
    name: string;
    file: File | null;
  }> = [];

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

            const fieldMappings = [
              {
                controlName: 'selfCertification',
                urlKey: 'general_self_certification_form',
              },
              {
                controlName: 'self_certificate_format_3A',
                urlKey: 'self_certificate_format_3A',
              },
              {
                controlName: 'tree_registration_certificate',
                urlKey: 'tree_registration_certificate',
              },
              { controlName: 'owner_pan_pdf', urlKey: 'owner_pan_pdf' },
              { controlName: 'owner_aadhar_pdf', urlKey: 'owner_aadhar_pdf' },
              { controlName: 'udyog_aadhar', urlKey: 'udyog_aadhar' },
              {
                controlName: 'gst_certificate_pdf',
                urlKey: 'gst_certificate_pdf',
              },
              {
                controlName: 'combinedBuilding',
                urlKey: 'combined_plan_document',
              },
              {
                controlName: 'landRegistrationDeed',
                urlKey: 'unit_land_details_pdf',
              },
              {
                controlName: 'partnershipDetails',
                urlKey: 'unit_registaration_details_pdf',
              },
              {
                controlName: 'processFlowChart',
                urlKey: 'unit_process_flow_chart_diagram_or_write_up_pdf',
              },
              {
                controlName: 'detailProjectReport',
                urlKey: 'detailed_project_report_pdf',
              },
              {
                controlName: 'propertyTaxClearanceCertificate',
                urlKey: 'unit_property_tax_clearance_certificate_pdf',
              },
            ];

            const urlPropertyMap = {
              selfCertification: 'selfCertificationUrl',
              self_certificate_format_3A: 'selfCertificateFormat3AUrl',
              tree_registration_certificate: 'treeRegistrationCertificateUrl',
              owner_pan_pdf: 'ownerPanPdfUrl',
              owner_aadhar_pdf: 'ownerAadharPdfUrl',
              udyog_aadhar: 'udyogAadharUrl',
              gst_certificate_pdf: 'gstCertificatePdfUrl',
              combinedBuilding: 'combinedBuildingUrl',
              landRegistrationDeed: 'landRegistrationDeedUrl',
              partnershipDetails: 'partnershipDetailsUrl',
              processFlowChart: 'processFlowChartUrl',
              detailProjectReport: 'detailProjectReportUrl',
              propertyTaxClearanceCertificate:
                'propertyTaxClearanceCertificateUrl',
            } as const;

            fieldMappings.forEach(({ controlName, urlKey }) => {
              const url = data[urlKey];
              if (url) {
                const urlProp =
                  urlPropertyMap[controlName as keyof typeof urlPropertyMap];
                if (urlProp) {
                  this[urlProp] = url;
                  const fileName = decodeURIComponent(
                    url.split('/').pop() || 'file.pdf'
                  );
                  const fakeFile = new File([], fileName, {
                    type: 'application/pdf',
                  });
                  (fakeFile as any)._isFake = true; 
                  this.form.get(controlName)?.setValue(fakeFile);
                }
              }
            });

          if (data.other_supporting_docuement1_pdf) {
  const url = data.other_supporting_docuement1_pdf;
  this.additionalDocUrl = url;
  const fileName = decodeURIComponent(url.split('/').pop() || 'additional-document.pdf');
  const fakeFile = new File([], fileName, { type: 'application/pdf' });
  (fakeFile as any)._isFake = true;
  this.additionalDoc.file = fakeFile;
  this.form.get('otherSupportingDoc')?.setValue(fakeFile);
}
          }
        },
        error: (err) => {
          this.apiService.openSnackBar(`${err.error.message}`, 'error');
        },
      });
  }

  onFileSelected(fieldName: string, file: File): void {
    this.form.get(fieldName)?.setValue(file);
    this.cdr.markForCheck();
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
    }

    this.form.get(fieldName)?.setValue(null);
    this.cdr.markForCheck();
  }

  buildPayload(isDraft: boolean = false): FormData {
    const formData = new FormData();

    if (isDraft) {
      formData.append('save_data', '1');
    }

    const raw = this.form.getRawValue();

    formData.append('do_you_have_trees_in_the_land_for_industry', raw.haveTree);
    formData.append('type_of_tree', raw.typeOfTree || '');

  const appendFile = (formKey: string, apiParam: string, urlProp: string) => {
  const value = raw[formKey];
  const existingUrl = (this as any)[urlProp]; // e.g., this.selfCertificationUrl

  if (value instanceof File) {
    if ((value as any)._isFake && existingUrl) {
      // Fake file → send original URL string
      formData.append(apiParam, existingUrl);
    } else {
      // Real file → send binary
      formData.append(apiParam, value);
    }
  } else if (typeof value === 'string') {
    // Fallback: send string (shouldn't happen with above fix)
    formData.append(apiParam, value);
  }
};

    appendFile('selfCertification', 'general_self_certification_form', 'selfCertificationUrl');
    appendFile('self_certificate_format_3A', 'self_certificate_format_3A', 'selfCertificateFormat3AUrl');
    appendFile(
      'tree_registration_certificate',
      'tree_registration_certificate', 'treeRegistrationCertificateUrl'
    );
    appendFile('owner_pan_pdf', 'owner_pan_pdf', 'ownerPanPdfUrl');
    appendFile('owner_aadhar_pdf', 'owner_aadhar_pdf', 'ownerAadharPdfUrl');
    appendFile('udyog_aadhar', 'udyog_aadhar', 'udyogAadharUrl');
    appendFile('gst_certificate_pdf', 'gst_certificate_pdf', 'gstCertificatePdfUrl');
    appendFile('combinedBuilding', 'combined_plan_document', 'combinedBuildingUrl');
    appendFile('landRegistrationDeed', 'unit_land_details_pdf', 'landRegistrationDeedUrl');
    appendFile('partnershipDetails', 'unit_registaration_details_pdf', 'partnershipDetailsUrl');
    appendFile(
      'processFlowChart',
      'unit_process_flow_chart_diagram_or_write_up_pdf', 'processFlowChartUrl'
    );
    appendFile('detailProjectReport', 'detailed_project_report_pdf', 'detailProjectReportUrl');
    appendFile(
      'propertyTaxClearanceCertificate',
      'unit_property_tax_clearance_certificate_pdf', 'propertyTaxClearanceCertificateUrl'
    );

    formData.append('owner_pan_number', raw.owner_pan_number || '');
    if (raw.owner_aadhar_number)
      formData.append('owner_aadhar_number', raw.owner_aadhar_number);
    if (raw.udyog_aadhar_number)
      formData.append('udyog_aadhar_number', raw.udyog_aadhar_number);
    if (raw.gst_number) formData.append('gst_number', raw.gst_number);
    if (raw.udyog_aadhar_registration_date) {
      formData.append(
        'udyog_aadhar_registration_date',
        this.formatDate(raw.udyog_aadhar_registration_date)
      );
    }

    const additionalValue = raw.otherSupportingDoc;
    if (additionalValue instanceof File) {
      formData.append('other_supporting_docuement1_pdf', additionalValue);
    } else if (typeof additionalValue === 'string') {
      formData.append('other_supporting_docuement1_pdf', additionalValue);
    }

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
        error: (err: any) => {
          console.error('API Error:', err);
          const errorResponse = err?.error;
          if (errorResponse?.errors) {
            const allErrors: string[] = [];
            Object.keys(errorResponse.errors).forEach((key) => {
              const fieldErrors = errorResponse.errors[key];
              if (Array.isArray(fieldErrors)) {
                allErrors.push(...fieldErrors);
              }
            });
            allErrors.forEach((msg, index) => {
              setTimeout(() => {
                this.apiService.openSnackBar(msg, 'error');
              }, index * 1200);
            });
          } else {
            this.apiService.openSnackBar(
              errorResponse?.message || 'Something went wrong!',
              'error'
            );
          }
          this.apiService.openSnackBar(err.error.message || 'Error occurred', 'error');
        },
      });
  }

  onAdditionalDocSelected(file: File): void {
    this.additionalDoc.file = file;
    this.form.get('otherSupportingDoc')?.setValue(file);
    this.cdr.markForCheck();
  }

  removeAdditionalDoc(): void {
    this.additionalDoc.file = null;
    this.form.get('otherSupportingDoc')?.setValue(null);
    this.cdr.markForCheck();
  }

  // Unused but kept for now
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

  previewFile(url: string): void {
    if (url) {
      window.open(url, '_blank');
    }
  }
  getFileNameFromUrl(url: string | null): string {
    if (!url) return '';

    try {
      const urlWithoutParams = url.split('?')[0];
      const fileName = urlWithoutParams.substring(
        urlWithoutParams.lastIndexOf('/') + 1
      );
      return decodeURIComponent(fileName) || 'file.pdf';
    } catch {
      return 'file.pdf';
    }
  }
}
