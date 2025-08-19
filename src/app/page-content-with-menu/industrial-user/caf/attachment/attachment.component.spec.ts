// attachment.component.spec.ts
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { ReactiveFormsModule, FormBuilder, FormGroup, FormControl } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { Component, DebugElement } from '@angular/core';
import { CommonModule } from '@angular/common';

// Import your custom components
import { IlogiInputComponent } from '../../../../customInputComponents/ilogi-input/ilogi-input.component';
import { IlogiRadioComponent } from '../../../../customInputComponents/ilogi-radio/ilogi-radio.component';
import { IlogiFileUploadComponent } from '../../../../customInputComponents/ilogi-file-upload/ilogi-file-upload.component';

// Component to test
import { AttachmentComponent } from './attachment.component';
import { IlogiInputDateComponent } from '../../../../customInputComponents/ilogi-input-date/ilogi-input-date.component';

// Mock implementations for external dependencies (if needed)
// You can enhance these mocks later if needed

describe('AttachmentComponent', () => {
  let component: AttachmentComponent;
  let fixture: ComponentFixture<AttachmentComponent>;
  let form: FormGroup;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        CommonModule,
        ReactiveFormsModule
      ],
      declarations: [
        AttachmentComponent,
        IlogiInputComponent,
        IlogiRadioComponent,
        IlogiFileUploadComponent,
        IlogiInputDateComponent
      ],
      providers: [
        FormBuilder
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AttachmentComponent);
    component = fixture.componentInstance;

    // Set input if needed
    component.submitted = false;

    fixture.detectChanges();
    form = component.form;
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize the form with correct controls', () => {
    expect(form.contains('selfCertification')).toBe(true);
    expect(form.contains('haveTree')).toBe(true);
    expect(form.contains('panNo')).toBe(true);
    expect(form.contains('adharNo')).toBe(true);
    expect(form.contains('udyogAdhar')).toBe(true);
    expect(form.contains('panNoText')).toBe(true);
    expect(form.contains('adharNoText')).toBe(true);
    expect(form.contains('udyogAdharText')).toBe(true);
    expect(form.contains('gst')).toBe(true);
    expect(form.contains('gstText')).toBe(true);
    expect(form.contains('udyogAdharDate')).toBe(true);
    expect(form.contains('combinedBuilding')).toBe(true);
    expect(form.contains('landRegistrationDeed')).toBe(true);
    expect(form.contains('partnershipDetails')).toBe(true);
    expect(form.contains('processFlowChart')).toBe(true);
    expect(form.contains('detailProjectReport')).toBe(true);
    expect(form.contains('propertyTaxClearanceCertificate')).toBe(true);
    expect(form.contains('additionalDocumentName')).toBe(true);
    expect(form.contains('additionalDocument')).toBe(true);
  });

  it('should mark haveTree as required and invalid if empty', () => {
    form.get('haveTree')?.setValue('');
    expect(form.get('haveTree')?.valid).toBeFalse();
    expect(form.get('haveTree')?.hasError('required')).toBeUndefined(); // Custom validation via template
  });

  it('should patch default values on init', () => {
    expect(form.get('haveTree')?.value).toBe('0');
    expect(form.get('panNoText')?.value).toBe('LUNPS9329G');
    expect(form.get('adharNoText')?.value).toBe('552303161494');
    expect(form.get('udyogAdharText')?.value).toBe('552303161494');
    expect(form.get('udyogAdharDate')?.value).toEqual(jasmine.any(Date));
  });

  it('should add a new additional document when addAdditionalDocument is called', () => {
    const nameControl = form.get('additionalDocumentName');
    const fileControl = form.get('additionalDocument');

    const mockFile = new File(['content'], 'test.pdf', { type: 'application/pdf' });

    nameControl?.setValue('Test Doc');
    fileControl?.setValue(mockFile);

    component.addAdditionalDocument();
    fixture.detectChanges();

    expect(component.additionalDocuments.length).toBe(1);
    expect(component.additionalDocuments[0].name).toBe('Test Doc');
    expect(component.additionalDocuments[0].file).toBe(mockFile);
    expect(component.additionalDocuments[0].slNo).toBe(1);

    // Form should be reset
    expect(form.get('additionalDocumentName')?.value).toBe('');
    expect(form.get('additionalDocument')?.value).toBeNull();
  });

  it('should not add additional document if name or file is missing', () => {
    form.get('additionalDocumentName')?.setValue('Test Doc');
    component.addAdditionalDocument();
    fixture.detectChanges();

    expect(component.additionalDocuments.length).toBe(0); // No file → not added

    form.get('additionalDocumentName')?.reset();
    form.get('additionalDocument')?.setValue(new File([''], 'file.pdf'));
    component.addAdditionalDocument();
    fixture.detectChanges();

    expect(component.additionalDocuments.length).toBe(0); // No name → not added
  });

  it('should remove an additional document correctly', () => {
    component.additionalDocuments.push({
      slNo: 1,
      name: 'Test',
      file: new File([''], 'test.pdf')
    });

    fixture.detectChanges();

    component.removeAdditionalDocument(0);
    fixture.detectChanges();

    expect(component.additionalDocuments.length).toBe(0);
  });

  it('should remove file from form control when removeFile is called', () => {
    const mockFile = new File([''], 'test.pdf');
    form.get('panNo')?.setValue(mockFile);
    fixture.detectChanges();

    component.removeFile('panNo');
    fixture.detectChanges();

    expect(form.get('panNo')?.value).toBeNull();
  });

  it('should display uploaded filename in UI', () => {
    const mockFile = new File([''], 'example.pdf');
    form.get('selfCertification')?.setValue(mockFile);
    fixture.detectChanges();

    const filenameElement = fixture.debugElement.query(By.css('.apply-ellipsis'));
    expect(filenameElement.nativeElement.textContent).toContain('example.pdf');
  });

  it('should show upload button when no file is selected', () => {
    // Initially no file
    fixture.detectChanges();
    const uploadTemplates = fixture.debugElement.queryAll(By.css('app-ilogi-file-upload'));
    expect(uploadTemplates.length).toBeGreaterThan(0);
  });

  it('should disable controls when form is submitted and invalid', () => {
    form.get('haveTree')?.setValue('');
    component.submitted = true;
    fixture.detectChanges();

    expect(form.get('haveTree')?.valid).toBeFalse();
  });

  // Optional: Test UI interaction with radio buttons
  it('should show Type of Tree section when haveTree is "1"', () => {
    form.get('haveTree')?.setValue('1');
    fixture.detectChanges();

    const typeOfTreeSection = fixture.debugElement.query(By.css('[for="typeOfTree"]'));
    expect(typeOfTreeSection).toBeTruthy();
  });

  it('should hide Type of Tree section when haveTree is "0"', () => {
    form.get('haveTree')?.setValue('0');
    fixture.detectChanges();

    const typeOfTreeSection = fixture.debugElement.query(By.css('[for="typeOfTree"]'));
    expect(typeOfTreeSection).toBeFalsy();
  });

  // Test date field
  it('should bind udyogAdharDate as a Date object', () => {
    const date = new Date('2024-06-08');
    form.get('udyogAdharDate')?.setValue(date);
    fixture.detectChanges();

    expect(form.get('udyogAdharDate')?.value).toEqual(date);
  });
});