// activities.component.ts
import { Component, Input, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { NicCode } from './models/nic-code.model';
import { IlogiRadioComponent } from '../../../../customInputComponents/ilogi-radio/ilogi-radio.component';
import {
  IlogiSelectComponent,
  SelectOption,
} from '../../../../customInputComponents/ilogi-select/ilogi-select.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-enterprise-activity',
  templateUrl: './activities.component.html',
  styleUrls: ['./activities.component.scss'],
  imports: [IlogiRadioComponent, IlogiSelectComponent, ReactiveFormsModule, CommonModule],
  standalone: true,
})
export class ActivitiesComponent implements OnInit {
  @Input() submitted = false;

  activityForm: FormGroup;
  activities: any[] = [];

  // Radio options for Activity
  activityOptions = [
    { value: 'Manufacturing', name: 'Manufacturing' },
    { value: 'Services', name: 'Services' },
  ];

  // NIC Options (internal model)
  nic2DigitOptions: NicCode[] = [
    { value: '4182', label: '10-Manufacture of food products' },
    { value: '4110', label: '05-Mining of coal and lignite' },
    {
      value: '4121',
      label: '06-Extraction of crude petroleum and natural gas',
    },
    { value: '4128', label: '07-Mining of metal ores' },
  ];

  nic4DigitOptions: NicCode[] = [];
  nic5DigitOptions: NicCode[] = [];

  constructor(private fb: FormBuilder) {
    this.activityForm = this.fb.group({
      companyActivity: ['Manufacturing', Validators.required], // default to Manufacturing
      nic2DigitCode: ['', Validators.required],
      nic4DigitCode: ['', Validators.required],
      nic5DigitCode: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    // Initialize nic4/nic5 as empty until selection
    this.nic4DigitOptions = [];
    this.nic5DigitOptions = [];
  }

  // Getters: Convert NicCode[] → SelectOption[] for ilogi-select
  get nic2SelectOptions(): SelectOption[] {
    return this.nic2DigitOptions.map((opt) => ({
      id: opt.value,
      name: opt.label,
    }));
  }

  get nic4SelectOptions(): SelectOption[] {
    return this.nic4DigitOptions.map((opt) => ({
      id: opt.value,
      name: opt.label,
    }));
  }

  get nic5SelectOptions(): SelectOption[] {
    return this.nic5DigitOptions.map((opt) => ({
      id: opt.value,
      name: opt.label,
    }));
  }

  // When NIC 2-digit changes → update NIC 4-digit options
  onNic2Change(value: string): void {
    this.activityForm.get('nic4DigitCode')?.reset();
    this.activityForm.get('nic5DigitCode')?.reset();
    this.nic5DigitOptions = [];

    // Example mapping: 10-Manufacture of food products
    if (value === '4182') {
      this.nic4DigitOptions = [
        { value: '4183', label: '1010-Processing and preserving of meat' },
        {
          value: '4193',
          label:
            '1020-Processing and preserving of fish, crustaceans and molluscs',
        },
        {
          value: '4202',
          label: '1030-Processing and preserving of fruit and vegetables',
        },
      ];
    } else if (value === '4110') {
      this.nic4DigitOptions = [
        { value: '4111', label: '0510-Coal mining' },
        { value: '4112', label: '0520-Lignite mining' },
      ];
    } else {
      this.nic4DigitOptions = [];
    }
  }

  // When NIC 4-digit changes → update NIC 5-digit options
  onNic4Change(value: string): void {
    this.activityForm.get('nic5DigitCode')?.reset();

    if (value === '4183') {
      this.nic5DigitOptions = [
        { value: '4184', label: '10101-Mutton-slaughtering, preparation' },
        { value: '4185', label: '10102-Beef-slaughtering, preparation' },
        { value: '4186', label: '10103-Pork-slaughtering, preparation' },
      ];
    } else if (value === '4193') {
      this.nic5DigitOptions = [
        { value: '4194', label: '10201-Fish processing and canning' },
        { value: '4195', label: '10202-Production of fish meal' },
      ];
    } else {
      this.nic5DigitOptions = [];
    }
  }

  // Add current activity to list
  addActivity(): void {
  console.log('Add button clicked');
  console.log('Form valid?', this.activityForm.valid);
  console.log('Form value:', this.activityForm.value);

  if (this.activityForm.valid) {
    const formValue = this.activityForm.value;

    const activity = {
      slNo: this.activities.length + 1,
      companyActivity: formValue.companyActivity,
      nic2DigitCode: formValue.nic2DigitCode,
      nic2DigitLabel: this.getNicLabel(formValue.nic2DigitCode, this.nic2SelectOptions),
      nic4DigitCode: formValue.nic4DigitCode,
      nic4DigitLabel: this.getNicLabel(formValue.nic4DigitCode, this.nic4SelectOptions),
      nic5DigitCode: formValue.nic5DigitCode,
      nic5DigitLabel: this.getNicLabel(formValue.nic5DigitCode, this.nic5SelectOptions)
    };

    console.log('New activity:', activity);
    this.activities.push(activity);
    console.log('Current activities:', this.activities);

    this.activityForm.reset();
    this.activityForm.get('companyActivity')?.setValue('Manufacturing');
    this.nic4DigitOptions = [];
    this.nic5DigitOptions = [];
  }
}

  // Remove activity from list
  removeActivity(index: number): void {
    this.activities.splice(index, 1);
    // Re-index slNo
    this.activities.forEach((act, i) => (act.slNo = i + 1));
  }

  // Utility: Get label from id + options
  getNicLabel(value: any, options: SelectOption[]): string {
    if (!value || !options) return '';
    const option = options.find((opt) => opt.id === value);
    return option ? option.name : value;
  }
}
