import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { DynamicTableComponent } from '../../../../shared/component/dynamic-table/dynamic-table.component';
import { IlogiInputComponent } from "../../../../customInputComponents/ilogi-input/ilogi-input.component";
import { IlogiRadioComponent } from '../../../../customInputComponents/ilogi-radio/ilogi-radio.component';
import { IlogiSelectComponent } from '../../../../customInputComponents/ilogi-select/ilogi-select.component';

@Component({
  selector: 'app-unit-registration-form',
  templateUrl: './unit-details.component.html',
  styleUrls: ['./unit-details.component.scss'],
  standalone: true,
  imports: [DynamicTableComponent, IlogiInputComponent, ReactiveFormsModule, IlogiRadioComponent, IlogiSelectComponent]
})
export class UnitDetailsComponent implements OnInit {
  form!: FormGroup;

  projectCostRows = [
    { label: 'Value of Land as per Sale Deed', controlName: 'land', type: 'number' },
    { label: 'Value of Building', controlName: 'building', type: 'number' },
    { label: 'Value of Plant & Machinery or Service Equipment', controlName: 'machinery', type: 'number' },
    { label: 'Total Project Cost', controlName: 'totalCost', readonly: true }
  ];

  employmentRows = [
    { label: 'Worker - Men', controlName: 'men', type: 'number' },
    { label: 'Worker - Women', controlName: 'women', type: 'number' },
    { label: 'Management Staff', controlName: 'staff', type: 'number' },
    { label: 'Others', controlName: 'others', type: 'number' },
    { label: 'Total Employment', controlName: 'total', readonly: true }
  ];

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      // General Information
      unitName: [''],
      postOffice: [''],
      unitAddress: [''],
      contactNo: [''],
      email: [''],
      website: [''],

      // Location
      district: [''],
      subDivision: [''],
      areaType: [''], // radio Urban/Rural
      estateName: [''],
      wardNo: [''],

      // Land Record
      revenueCircle: [''],
      khatianNo: [''],
      plotNo: [''],
      landArea: [''],
      classification: [''],

      // Construction
      landFloor: [''],
      sanitaryCount: [''],
      boundaryWall: [''],
      buildingSqMtr: [''],

      // Project Cost
      land: [0],
      building: [0],
      machinery: [0],
      totalCost: [{ value: 0, disabled: true }],

      // Employment
      men: [0],
      women: [0],
      staff: [0],
      others: [0],
      total: [{ value: 0, disabled: true }],

      // Financial
      annualTurnover: [''],
      category: [''],
      process: [''],
      workingSession: ['']
    });

    // Auto calculation for totals
    this.form.valueChanges.subscribe(values => {
      const totalCost = (+values.land || 0) + (+values.building || 0) + (+values.machinery || 0);
      this.form.get('totalCost')?.setValue(totalCost, { emitEvent: false });

      const totalEmp = (+values.men || 0) + (+values.women || 0) + (+values.staff || 0) + (+values.others || 0);
      this.form.get('total')?.setValue(totalEmp, { emitEvent: false });
    });
  }

  onSubmit() {
    console.log(this.form.value);
  }
}
