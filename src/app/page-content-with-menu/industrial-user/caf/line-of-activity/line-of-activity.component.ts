// raw-materials-products.component.ts
import { Component, OnInit, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormArray,
  FormBuilder,
  FormGroup,
} from '@angular/forms';
import {
  IlogiSelectComponent,
  SelectOption,
} from '../../../../customInputComponents/ilogi-select/ilogi-select.component';
import { IlogiInputComponent } from '../../../../customInputComponents/ilogi-input/ilogi-input.component';

@Component({
  selector: 'app-raw-materials-products',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    IlogiSelectComponent,
    IlogiInputComponent,
  ],
  templateUrl: './line-of-activity.component.html',
  styleUrls: ['./line-of-activity.component.scss'],
})
export class LineOfActivityComponent implements OnInit {
  @Input() submitted = false;
 
  form: FormGroup;

  // Unit options
  unitOptions: SelectOption[] = [
    { id: 'Kg Numbers/Month', name: 'Kg Numbers/Month' },
    { id: 'Tonnes Numbers/Month', name: 'Tonnes Numbers/Month' },
    { id: 'Metric Tonnes Numbers/Month', name: 'Metric Tonnes Numbers/Month' },
    { id: 'Liters Numbers/Month', name: 'Liters Numbers/Month' },
    { id: 'Kilo Litters Numbers/Month', name: 'Kilo Litters Numbers/Month' },
    { id: 'Meter Numbers/Month', name: 'Meter Numbers/Month' },
    { id: 'Square Meter Numbers/Month', name: 'Square Meter Numbers/Month' },
    { id: 'Cubic Meters Numbers/Month', name: 'Cubic Meters Numbers/Month' },
    { id: 'Foot Numbers/Month', name: 'Foot Numbers/Month' },
    { id: 'Square Foot Numbers/Month', name: 'Square Foot Numbers/Month' },
    { id: 'Cubic Foot Numbers/Month', name: 'Cubic Foot Numbers/Month' },
    { id: 'Million Unit (MU)', name: 'Million Unit (MU)' },
  ];

  // Thrust Sector options
  thrustSectorOptions: SelectOption[] = [
    {
      id: 'Agri & Horticultural Produce',
      name: 'Agri & Horticultural Produce',
    },
    { id: 'Bamboo', name: 'Bamboo' },
    { id: 'Gas', name: 'Gas' },
    { id: 'Hospital/ Nursing Home', name: 'Hospital/ Nursing Home' },
    { id: 'Hotel', name: 'Hotel' },
    { id: 'None of these', name: 'None of these' },
    { id: 'Rubber', name: 'Rubber' },
    { id: 'Tea', name: 'Tea' },
    {
      id: 'Tourism Promoting Activities (Water-Sports, Ropeways, Adventure & Leisure Sports)',
      name: 'Tourism Promoting Activities (Water-Sports, Ropeways, Adventure & Leisure Sports)',
    },
  ];

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      rawMaterials: this.fb.array([]),
      products: this.fb.array([]),
      MajorRawMaterialUsed: ['None of these'],
    });
  }

  ngOnInit(): void {
    // Initialize with one raw material
    this.addRawMaterial();

    // Initialize with one product
    this.addProduct();
  }

  // FormArray accessors
  get rawMaterials(): FormArray {
    return this.form.get('rawMaterials') as FormArray;
  }

  get products(): FormArray {
    return this.form.get('products') as FormArray;
  }

addRawMaterial(): void {
  const group = this.fb.group({
    nameOfRawMaterial: ['', []],
    quantityPerMonth: ['', []],
    unit: ['', []]
  });
  this.rawMaterials.push(group);
  // Mark this new row as being edited
}

  removeRawMaterial(index: number): void {
    this.rawMaterials.removeAt(index);
  }

addProduct(): void {
  const group = this.fb.group({
    nameOfProduct: ['', []],
    productionCapacity: ['', []],
    avgProductionPerMonth: ['', []],
    unit: ['', []]
  });
  this.products.push(group);
  // Mark as editing
}

  removeProduct(index: number): void {
    this.products.removeAt(index);
  }



  // Get control from FormArray
  getRawMaterialControl(index: number, field: string) {
    return this.rawMaterials.at(index).get(field);
  }

  getProductControl(index: number, field: string) {
    return this.products.at(index).get(field);
  }

  toggleEditRawMaterial(index: number): void {
    const ctrl = this.rawMaterials.at(index);
    if (ctrl.value.nameOfRawMaterial) {
      // Currently in view mode → switch to edit
      // You can implement two-way binding or state management
    }
  }

  toggleEditProduct(index: number): void {
    const ctrl = this.products.at(index);
    if (ctrl.value.nameOfProduct) {
      // Implement edit toggle
    }
  }
}
