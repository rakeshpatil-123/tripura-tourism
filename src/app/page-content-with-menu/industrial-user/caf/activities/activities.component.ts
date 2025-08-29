// activities.component.ts
import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { IlogiRadioComponent } from '../../../../customInputComponents/ilogi-radio/ilogi-radio.component';
import { IlogiSelectComponent, SelectOption } from '../../../../customInputComponents/ilogi-select/ilogi-select.component';
import { CommonModule } from '@angular/common';
import { GenericService } from '../../../../_service/generic/generic.service';

interface Nic2Digit {
  nic_2_digit_code: string;
  nic_2_digit_code_description: string;
}

interface Nic4Digit {
  nic_4_digit_code: string;
  nic_4_digit_code_description: string;
}

interface Nic5Digit {
  nic_5_digit_code: string;
  nic_5_digit_code_description: string;
}

interface NicEntry {
  nic_2_digit_code: string;
  nic_2_digit_code_description: string;
  nic_4_digit_codes: {
    nic_4_digit_code: string;
    nic_4_digit_code_description: string;
    nic_5_digit_codes: Nic5Digit[];
  }[];
}

@Component({
  selector: 'app-enterprise-activity',
  templateUrl: './activities.component.html',
  styleUrls: ['./activities.component.scss'],
  imports: [CommonModule, ReactiveFormsModule, IlogiRadioComponent, IlogiSelectComponent],
  standalone: true,
})
export class ActivitiesComponent implements OnInit {
  @Input() submitted = false;

  activityForm: FormGroup;
  activities: NicEntry[] = [];

  // Options for dropdowns
  nic2DigitOptions: Nic2Digit[] = [];
  nic4DigitOptions: Nic4Digit[] = [];
  nic5DigitOptions: Nic5Digit[] = [];

  // SelectOptions for ilogi-select
  get nic2SelectOptions(): SelectOption[] {
    return this.nic2DigitOptions.map(opt => ({
      id: opt.nic_2_digit_code,
      name: `${opt.nic_2_digit_code} - ${opt.nic_2_digit_code_description}`
    }));
  }

  get nic4SelectOptions(): SelectOption[] {
    return this.nic4DigitOptions.map(opt => ({
      id: opt.nic_4_digit_code,
      name: `${opt.nic_4_digit_code} - ${opt.nic_4_digit_code_description}`
    }));
  }

  get nic5SelectOptions(): SelectOption[] {
    return this.nic5DigitOptions.map(opt => ({
      id: opt.nic_5_digit_code,
      name: `${opt.nic_5_digit_code} - ${opt.nic_5_digit_code_description}`
    }));
  }
  activityOptions = [
  { value: 'Manufacturing', name: 'Manufacturing' },
  { value: 'Services', name: 'Services' },
];

  constructor(
    private fb: FormBuilder,
    private apiService: GenericService
  ) {
    this.activityForm = this.fb.group({
      companyActivity: ['Manufacturing', Validators.required],
      nic2DigitCode: ['', Validators.required],
      nic4DigitCode: ['', Validators.required],
      nic5DigitCode: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    this.loadNic2DigitCodes();
    this.loadExistingData();
  }

  // --- Load NIC 2-digit codes ---
  loadNic2DigitCodes(): void {
    this.apiService.getByConditions({}, 'api/fetch-all-nic-2-digit-codes-with-description').subscribe({
      next: (res: any) => {
        if (res?.status === 1 && Array.isArray(res.data)) {
          this.nic2DigitOptions = res.data;
          console.log(' Loaded NIC 2-digit codes:', this.nic2DigitOptions);
        } else {
          this.apiService.openSnackBar('Failed to load NIC 2-digit codes.', 'error');
        }
      },
      error: (err) => {
        console.error(' API Error (NIC 2-digit):', err);
        this.apiService.openSnackBar('Could not load NIC 2-digit codes.', 'error');
      }
    });
  }

  // --- On NIC 2-digit change → load 4-digit codes ---
  onNic2Change(value: string): void {
    this.resetAfter2Digit();
    if (!value) return;

    const payload = { nic_2_digit_code: value };
    this.apiService.getByConditions(payload, 'api/fetch-all-nic-4-digit-codes-with-description').subscribe({
      next: (res: any) => {
        if (res?.status === 1 && Array.isArray(res.data)) {
          this.nic4DigitOptions = res.data;
          console.log(' Loaded NIC 4-digit codes:', this.nic4DigitOptions);
        } else {
          this.apiService.openSnackBar('No 4-digit codes found.', 'info');
        }
      },
      error: (err) => {
        console.error(' API Error (NIC 4-digit):', err);
        this.apiService.openSnackBar('Failed to load 4-digit codes.', 'error');
      }
    });
  }

  // --- On NIC 4-digit change → load 5-digit codes ---
  onNic4Change(value: string): void {
    this.resetAfter4Digit();
    if (!value) return;

    const payload = { nic_4_digit_code: value };
    this.apiService.getByConditions(payload, 'api/fetch-all-nic-5-digit-codes-with-description').subscribe({
      next: (res: any) => {
        if (res?.status === 1 && Array.isArray(res.data)) {
          this.nic5DigitOptions = res.data;
          console.log(' Loaded NIC 5-digit codes:', this.nic5DigitOptions);
        } else {
          this.apiService.openSnackBar('No 5-digit codes found.', 'info');
        }
      },
      error: (err) => {
        console.error(' API Error (NIC 5-digit):', err);
        this.apiService.openSnackBar('Failed to load 5-digit codes.', 'error');
      }
    });
  }

  // --- Reset dependent fields ---
  private resetAfter2Digit(): void {
    this.activityForm.get('nic4DigitCode')?.reset();
    this.activityForm.get('nic5DigitCode')?.reset();
    this.nic4DigitOptions = [];
    this.nic5DigitOptions = [];
  }

  private resetAfter4Digit(): void {
    this.activityForm.get('nic5DigitCode')?.reset();
    this.nic5DigitOptions = [];
  }

  // --- Add current selection to table ---
  addActivity(): void {
    if (this.activityForm.invalid) {
      this.activityForm.markAllAsTouched();
      this.apiService.openSnackBar('Please fill all required fields.', 'error');
      return;
    }

    const raw = this.activityForm.value;

    // Find full descriptions
    const nic2 = this.nic2DigitOptions.find(n => n.nic_2_digit_code === raw.nic2DigitCode);
    const nic4 = this.nic4DigitOptions.find(n => n.nic_4_digit_code === raw.nic4DigitCode);
    const nic5 = this.nic5DigitOptions.find(n => n.nic_5_digit_code === raw.nic5DigitCode);

    if (!nic2 || !nic4 || !nic5) {
      this.apiService.openSnackBar('Invalid selection. Please try again.', 'error');
      return;
    }

    // Check if this 2-digit code already exists
    const exists = this.activities.find(a => a.nic_2_digit_code === nic2.nic_2_digit_code);
    if (exists) {
      this.apiService.openSnackBar('This 2-digit NIC code is already added.', 'error');
      return;
    }

    // Create 4-digit group
    const newEntry: NicEntry = {
      nic_2_digit_code: nic2.nic_2_digit_code,
      nic_2_digit_code_description: nic2.nic_2_digit_code_description,
      nic_4_digit_codes: [
        {
          nic_4_digit_code: nic4.nic_4_digit_code,
          nic_4_digit_code_description: nic4.nic_4_digit_code_description,
          nic_5_digit_codes: [nic5]
        }
      ]
    };

    this.activities.push(newEntry);
    this.resetFormAndOptions();
  }

  // --- Remove activity ---
  removeActivity(index: number): void {
    const item = this.activities[index];
    this.activities.splice(index, 1);

    // If not draft, delete from backend
    if (item.nic_2_digit_code) {
      const payload = { nic_2_digit_code: String(item.nic_2_digit_code) };
      this.apiService.getByConditions(payload, 'api/nic-digit-code-delete').subscribe({
        next: (res) => {
          if (res?.status === 1) {
            this.apiService.openSnackBar('NIC code deleted successfully.', 'success');
          }
        },
        error: (err) => {
          console.error(' Delete failed:', err);
          this.apiService.openSnackBar('Failed to delete NIC code.', 'error');
        }
      });
    }
  }

  // --- Reset form and options ---
  private resetFormAndOptions(): void {
    this.activityForm.reset();
    this.activityForm.get('companyActivity')?.setValue('Manufacturing');
    this.nic4DigitOptions = [];
    this.nic5DigitOptions = [];
  }

  // --- Load existing data from backend ---
  loadExistingData(): void {
    this.apiService.getByConditions({}, 'caf/activity-view').subscribe({
      next: (res: any) => {
        if (res?.status === 1 && Array.isArray(res.data)) {
          this.activities = res.data.map((item: any) => ({
            nic_2_digit_code: item.nic_2_digit_code,
            nic_2_digit_code_description: item.nic_2_digit_code_description,
            nic_4_digit_codes: (item.nic_4_digit_codes || []).map((four: any) => ({
              nic_4_digit_code: four.nic_4_digit_code,
              nic_4_digit_code_description: four.nic_4_digit_code_description,
              nic_5_digit_codes: (four.nic_5_digit_codes || []).map((five: any) => ({
                nic_5_digit_code: five.nic_5_digit_code,
                nic_5_digit_code_description: five.nic_5_digit_code_description
              }))
            }))
          }));
          console.log(' Loaded existing NIC data:', this.activities);
        }
      },
      error: (err) => {
        console.error(' Failed to load existing NIC data:', err);
      }
    });
  }

 private buildPayload(isDraft: boolean): any {
  const payload: any = {
    nic_codes: this.activities.map(activity => ({
      nic_2_digit_code: String(activity.nic_2_digit_code),
      nic_2_digit_code_description: activity.nic_2_digit_code_description,
      nic_4_digit_codes: activity.nic_4_digit_codes.map(four => ({
        nic_4_digit_code: String(four.nic_4_digit_code),
        nic_4_digit_code_description: four.nic_4_digit_code_description,
        nic_5_digit_codes: four.nic_5_digit_codes.map(five => ({
          nic_5_digit_code: String(five.nic_5_digit_code),
          nic_5_digit_code_description: five.nic_5_digit_code_description
        }))
      }))
    }))
  };

  if (isDraft) {
    payload.save_data = '1';
  }

  return payload;
}

  // --- Save as Draft ---
  saveAsDraft(): void {
    const payload = this.buildPayload(true);
    this.submitToBackend(payload, 'api/nic-digit-code-store', true);
  }

  // --- Submit ---
  onSubmit(): void {
    if (this.activities.length === 0) {
      this.apiService.openSnackBar('Please add at least one NIC code.', 'error');
      return;
    }

    const payload = this.buildPayload(false);
    this.submitToBackend(payload, 'api/nic-digit-code-store', false);
  }

  lastItem(array: any[], item: any): boolean {
  return array[array.length - 1] === item;
}
  // --- Submit to backend ---
  private submitToBackend(payload: any, endpoint: string, isDraft: boolean): void {
    this.apiService.getByConditions(payload, endpoint).subscribe({
      next: (res) => {
        if (res?.status === 1) {
          const message = isDraft
            ? 'NIC codes saved as draft!'
            : 'NIC codes submitted successfully!';
          this.apiService.openSnackBar(message, 'success');
          if (!isDraft) {
            this.activities = []; // optional: reset after submit
          }
        }
      },
      error: (err: any) => {
        console.error(' API Error:', err);
        const errorMsg = err?.error?.message || 'Something went wrong!';
        this.apiService.openSnackBar(errorMsg, 'error');
      }
    });
  }
}