// raw-materials-products.component.ts
import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { IlogiSelectComponent, SelectOption } from '../../../../customInputComponents/ilogi-select/ilogi-select.component';
import { IlogiInputComponent } from '../../../../customInputComponents/ilogi-input/ilogi-input.component';
import { GenericService } from '../../../../_service/generic/generic.service';

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
export class LineOfActivityComponent implements OnInit, OnDestroy {
  @Input() submitted = false;

  form: FormGroup;

  // Unit options
  unitOptions: SelectOption[] = [
    { id: 'Tonnes Numbers Per Month', name: 'Tonnes Numbers Per Month' },
    { id: 'Metric Tonnes Numbers Per Month', name: 'Metric Tonnes Numbers Per Month' },
    { id: 'Kilo Liters Number Per Month', name: 'Kilo Liters Number Per Month' },
    { id: 'Meter Numbers Per Month', name: 'Meter Numbers Per Month' },
    { id: 'Square Meter Numbers Per Month', name: 'Square Meter Numbers Per Month' },
    { id: 'Cubic Meter Numbers Per Month', name: 'Cubic Meter Numbers Per Month' },
    { id: 'Foot Numbers Per Month', name: 'Foot Numbers Per Month' },
    { id: 'Square Foot Numbers Per Month', name: 'Square Foot Numbers Per Month' },
    { id: 'Million Unit (MU)', name: 'Million Unit (MU)' },
  ];


  thrustSectorOptions: SelectOption[] = [
    { id: 'Agri & Horticultural Produce', name: 'Agri & Horticultural Produce' },
    { id: 'Bamboo', name: 'Bamboo' },
    { id: 'Gas', name: 'Gas' },
    { id: 'Hospital/ Nursing Home', name: 'Hospital/ Nursing Home' },
    { id: 'Hotel', name: 'Hotel' },
    { id: 'None of these', name: 'None of these' },
    { id: 'Rubber', name: 'Rubber' },
    { id: 'Tea', name: 'Tea' },
    { id: 'Tourism Promoting Activities (Water-Sports, Ropeways, Adventure & Leisure Sports)', name: 'Tourism Promoting Activities (Water-Sports, Ropeways, Adventure & Leisure Sports)' },
  ];

  constructor(private fb: FormBuilder, private apiService: GenericService) {
    this.form = this.fb.group({
      thrustSector: ['', Validators.required],  // ✅ renamed + required
      rawMaterials: this.fb.array([]),
      products: this.fb.array([]),
    });
  }

  ngOnInit(): void {
    this.loadExistingData();
  }

loadExistingData(): void {
  this.apiService.getByConditions({}, 'api/caf/line-of-activity-view').subscribe({
    next: (res: any) => {
      if (res && res.status === 1) {
        this.patchFormWithData({
          thrust_sector: res.line_of_activity?.thrust_sector || 'None of these',
          raw_materials: res.raw_material_to_be_used || [],
          products: res.list_of_products || []
        });
      } else {
        console.warn('Invalid or empty response:', res);
        this.addRawMaterial();
        this.addProduct();
      }
    },
    error: (err) => {
      console.error('Error fetching line of activity:', err);
      this.addRawMaterial();
      this.addProduct();
    }
  });
}

 patchFormWithData(data: any): void {
  if (!data) return;

  // Patch main field
  this.form.patchValue({
    thrustSector: data.thrust_sector || 'None of these',
  });

  // Clear and repopulate raw materials
  this.rawMaterials.clear();
  if (data.raw_materials && Array.isArray(data.raw_materials)) {
    data.raw_materials.forEach((rm: any) => this.addRawMaterial(rm));
  } else {
    this.addRawMaterial();
  }

  // Clear and repopulate products
  this.products.clear();
  if (data.products && Array.isArray(data.products)) {
    data.products.forEach((p: any) => this.addProduct(p));
  } else {
    this.addProduct();
  }
}

  get rawMaterials(): FormArray {
    return this.form.get('rawMaterials') as FormArray;
  }

  get products(): FormArray {
    return this.form.get('products') as FormArray;
  }

  addRawMaterial(data?: any): void {
    const group = this.fb.group({
      raw_material_name: [data?.raw_material_name || '', Validators.required],
      raw_material_quantity_per_month: [data?.raw_material_quantity_per_month || '', Validators.required],
      raw_material_unit: [data?.raw_material_unit || '', Validators.required],
    });
    this.rawMaterials.push(group);
  }

  removeRawMaterial(index: number): void {
    this.rawMaterials.removeAt(index);
  }

  addProduct(data?: any): void {
    const group = this.fb.group({
      product_name: [data?.product_name || '', Validators.required],
      product_production_capacity_per_month: [data?.product_production_capacity_per_month || '', Validators.required],
      product_average_production_per_month: [data?.product_average_production_per_month || '', Validators.required],
      unit: [data?.unit || '', Validators.required],
    });
    this.products.push(group);
  }

  removeProduct(index: number): void {
    this.products.removeAt(index);
  }

buildPayload(isDraft: boolean = false): any {
  const raw = this.form.getRawValue();

  const payload: any = {
    thrust_sector: raw.thrustSector,
    raw_materials: raw.rawMaterials.map((rm: any) => ({
      raw_material_name: rm.raw_material_name,
      raw_material_quantity_per_month: rm.raw_material_quantity_per_month,
      raw_material_unit: rm.raw_material_unit,
    })),
    products: raw.products.map((p: any) => ({
      product_name: p.product_name,
      product_production_capacity_per_month: p.product_production_capacity_per_month,
      product_average_production_per_month: p.product_average_production_per_month,
      unit: p.unit,
    })),
  };

  if (isDraft) {
    payload.save_data = "1"; // string "1" as per your example
  }

  return payload;
}

  saveAsDraft(): void {
    const payload = this.buildPayload(true);
    this.submitForm(payload, true);
  }

  onSubmit(): void {
    const payload = this.buildPayload(false);
    this.submitForm(payload, false);
  }

 private submitForm(payload: any, isDraft: boolean): void {
  this.apiService.getByConditions(payload, 'api/caf/line-of-activity-store').subscribe({
    next: (res) => {
      console.log('Success:', res);
      const message = isDraft
        ? 'Draft saved successfully!'
        : 'Line of activity submitted successfully!';
      this.apiService.openSnackBar(message, 'success');
    },
    error: (err) => {
      console.error('Error:', err);
      this.apiService.openSnackBar('Failed to save line of activity.', 'error');
    }
  });
}

  ngOnDestroy(): void {
  }
}

/* 
{
    "thrust_sector": "Bamboo",
    "raw_materials": [
        {
            "raw_material_name": "Bamboo",
            "raw_material_quantity_per_month": "47",
            "raw_material_unit": "Metric Tonnes Numbers Per Month"
        }
    ],
    "products": [
        {
            "product_name": "Bamboo",
            "product_production_capacity_per_month": "406",
            "product_average_production_per_month": "83",
            "unit": "Kg Numbers Per Month"
        }
    ],
    "save_data": "1"
}

*/


/* 

try with this {
  "save_data" : 1,
  "thrust_sector": "Gas",
  "raw_materials": [
    {
      "raw_material_name": "test 12",
      "raw_material_quantity_per_month": "200",
      "raw_material_unit": "Liters Numbers Per Month"
    },

  ],
  "products": [
   
    {
      "product_name": "test 4",
      "product_production_capacity_per_month": "300",
      "product_average_production_per_month": "200",
      "unit": "Kilo Liters Number Per Month"
    }
  ]
}
*/