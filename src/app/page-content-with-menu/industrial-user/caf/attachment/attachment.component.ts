// attachment.component.ts
import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { IlogiInputComponent } from '../../../../customInputComponents/ilogi-input/ilogi-input.component';
import { IlogiRadioComponent } from '../../../../customInputComponents/ilogi-radio/ilogi-radio.component';
import { IlogiFileUploadComponent } from '../../../../customInputComponents/ilogi-file-upload/ilogi-file-upload.component';
import { IlogiInputDateComponent } from '../../../../customInputComponents/ilogi-input-date/ilogi-input-date.component';

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

  yesNoOptions = [
    { value: '1', name: 'Yes' },
    { value: '0', name: 'No' },
  ];

  constructor(private fb: FormBuilder, private cdr: ChangeDetectorRef) {
    this.form = this.fb.group({
      // GENERAL
      selfCertification: [null],
      haveTree: ['', Validators.required],
      typeOfTree: [''],
      selfCertifate3A: [null],
      treeRegistrationCertifate: [null],

      // ENTERPRISE
      panNo: [null],
      adharNo: [null],
      udyogAdhar: [null],
      panNoText: ['', Validators.required],
      adharNoText: ['', Validators.required],
      udyogAdharText: ['', Validators.required],
      gst: [null],
      gstText: [''],
      udyogAdharDate: [''], // Will be set as Date

      // UNIT
      combinedBuilding: [null],
      landRegistrationDeed: [null],
      partnershipDetails: [null],
      processFlowChart: [null],
      detailProjectReport: [null],
      propertyTaxClearanceCertificate: [null],

      // Additional
      additionalDocumentName: [''],
      additionalDocument: [null],
    });
  }

  ngOnInit(): void {
    this.form.patchValue({
      haveTree: '0',
      panNoText: 'LUNPS9329G',
      adharNoText: '552303161494',
      udyogAdharText: '552303161494',
      udyogAdharDate: new Date('2024-06-08'), // ✅ Set as Date object
    });
  }

  addAdditionalDocument(): void {
    const name = this.form.get('additionalDocumentName')?.value?.trim();
    const file = this.form.get('additionalDocument')?.value;

    if (name && file && file instanceof File) {
      this.additionalDocuments.push({
        slNo: this.additionalDocuments.length + 1,
        name,
        file,
      });

      this.form.get('additionalDocumentName')?.reset();
      this.form.get('additionalDocument')?.reset();

      // ✅ Force UI update
      this.cdr.detectChanges();
    }
  }

  removeAdditionalDocument(index: number): void {
    this.additionalDocuments.splice(index, 1);
  }

  removeFile(fieldName: string): void {
    this.form.get(fieldName)?.reset();
    this.cdr.detectChanges();
  }
}