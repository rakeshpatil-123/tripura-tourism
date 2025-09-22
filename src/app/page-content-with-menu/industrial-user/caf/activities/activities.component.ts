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
  id?: number;
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

  nic2DigitOptions: Nic2Digit[] = [];
  nic4DigitOptions: Nic4Digit[] = [];
  nic5DigitOptions: Nic5Digit[] = [];

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

  addActivity(): void {
    if (this.activityForm.invalid) {
      this.activityForm.markAllAsTouched();
      this.apiService.openSnackBar('Please fill all required fields.', 'error');
      return;
    }

    const raw = this.activityForm.value;

    const nic2 = this.nic2DigitOptions.find(n => n.nic_2_digit_code === raw.nic2DigitCode);
    const nic4 = this.nic4DigitOptions.find(n => n.nic_4_digit_code === raw.nic4DigitCode);
    const nic5 = this.nic5DigitOptions.find(n => n.nic_5_digit_code === raw.nic5DigitCode);

    if (!nic2 || !nic4 || !nic5) {
      this.apiService.openSnackBar('Invalid selection. Please try again.', 'error');
      return;
    }

    // const exists = this.activities.find(a => a.nic_2_digit_code === nic2.nic_2_digit_code);
    // if (exists) {
    //   this.apiService.openSnackBar('This 2-digit NIC code is already added.', 'error');
    //   return;
    // }

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

  removeActivity(index: number): void {
  const item = this.activities[index];

  if (item.id) {
    const payload = { id: item.id };

    this.apiService.getByConditions(payload, 'api/caf/activity-delete').subscribe({
      next: (res) => {
        if (res?.status === 1) {
          this.activities.splice(index, 1);
          this.apiService.openSnackBar('NIC code deleted successfully.', 'success');
        } else {
          this.apiService.openSnackBar('Delete failed: ' + res?.message, 'error');
        }
      },
      error: (err) => {
        console.error('Delete failed:', err);
        this.apiService.openSnackBar('Failed to delete NIC code.', 'error');
      }
    });
  } else {
    this.activities.splice(index, 1);
    this.apiService.openSnackBar('Entry removed.', 'info');
  }
}

  private resetFormAndOptions(): void {
    this.activityForm.reset();
    this.activityForm.get('companyActivity')?.setValue('Manufacturing');
    this.nic4DigitOptions = [];
    this.nic5DigitOptions = [];
  }

  loadExistingData(): void {
  this.apiService.getByConditions({}, 'api/caf/activity-view').subscribe({
    next: (res: any) => {
      if (res?.status === 1 && Array.isArray(res.data)) {
        this.activities = res.data
          .filter((item: any) => item.nic_2_digit_code && item.activity_of_enterprise)
          .map((item: any) => {
            const nic2 = this.parseNicCode(item.nic_2_digit_code);
            const nic4 = this.parseNicCode(item.nic_4_digit_code);
            const nic5 = this.parseNicCode(item.nic_5_digit_code);

            return {
              id: item.id, 
              nic_2_digit_code: nic2.code,
              nic_2_digit_code_description: nic2.desc,
              nic_4_digit_codes: [
                {
                  nic_4_digit_code: nic4.code,
                  nic_4_digit_code_description: nic4.desc,
                  nic_5_digit_codes: [
                    {
                      nic_5_digit_code: nic5.code,
                      nic_5_digit_code_description: nic5.desc
                    }
                  ]
                }
              ]
            };
          });

        console.log('Loaded and parsed existing NIC data:', this.activities);

        if (this.activities.length > 0) {
          const last = this.activities[this.activities.length - 1];
          this.activityForm.get('companyActivity')?.setValue(res.data[0].activity_of_enterprise || 'Manufacturing');
        }
      }
    },
    error: (err) => {
      console.error('Failed to load existing NIC data:', err);
      this.apiService.openSnackBar('Could not load existing activities.', 'error');
    }
  });
}

private parseNicCode(fullString: string): { code: string; desc: string } {
  if (!fullString) return { code: '', desc: '' };
  const separatorIndex = fullString.indexOf(' - ');
  if (separatorIndex === -1) {
    return { code: fullString.trim(), desc: '' };
  }
  return {
    code: fullString.slice(0, separatorIndex).trim(),
    desc: fullString.slice(separatorIndex + 3).trim() 
  };
}


private buildPayload(isDraft: boolean): any {
  if (this.activities.length === 0) {
    this.apiService.openSnackBar('Please add at least one NIC code.', 'error');
    return null;
  }

  const activityOfEnterprise = this.activityForm.get('companyActivity')?.value || 'Manufacturing';

  const activities = this.activities.map(activity => {
    const fourDigit = activity.nic_4_digit_codes[0];
    const fiveDigit = fourDigit.nic_5_digit_codes[0];

    return {
      activity_of_enterprise: activityOfEnterprise,
      nic_2_digit_code: `${activity.nic_2_digit_code} - ${activity.nic_2_digit_code_description}`,
      nic_4_digit_code: `${fourDigit.nic_4_digit_code} - ${fourDigit.nic_4_digit_code_description}`,
      nic_5_digit_code: `${fiveDigit.nic_5_digit_code} - ${fiveDigit.nic_5_digit_code_description}`
    };
  });

  // Build final payload
  const payload: any = {
    activities
  };

  if (isDraft) {
    payload.save_data = 1; // send as number, not string
  }

  return payload;
}


//  private buildPayload(isDraft: boolean): any {
//   const activityOfEnterprise = this.activityForm.get('companyActivity')?.value || '';

//   const nicCodes = this.activities.flatMap((activity: NicEntry) =>
//     activity.nic_4_digit_codes.flatMap((fourDigit) =>
//       fourDigit.nic_5_digit_codes.map((fiveDigit) => ({
//         activity_of_enterprise: activityOfEnterprise,
//         nic_2_digit_code: ` ${activity.nic_2_digit_code_description}`,
//         nic_4_digit_code: ` ${fourDigit.nic_4_digit_code_description}`,
//         nic_5_digit_code: ` ${fiveDigit.nic_5_digit_code_description}`
//       }))
//     )
//   );

//   const payload: any = {  nicCodes };

//   if (isDraft) {
//     payload.save_data = '1';
//   }

//   return payload;
// } 

  // --- Save as Draft ---
  saveAsDraft(): void {
    const payload = this.buildPayload(true);
    this.submitToBackend(payload, 'api/caf/activity-store', true);
  }

  // --- Submit ---
  onSubmit(): void {
    if (this.activities.length === 0) {
      this.apiService.openSnackBar('Please add at least one NIC code.', 'error');
      return;
    }

    const payload = this.buildPayload(false);
    this.submitToBackend(payload, 'api/caf/activity-store', false);
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