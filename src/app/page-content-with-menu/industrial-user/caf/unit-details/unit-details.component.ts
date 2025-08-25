import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { IlogiInputComponent } from '../../../../customInputComponents/ilogi-input/ilogi-input.component';
import { IlogiRadioComponent } from '../../../../customInputComponents/ilogi-radio/ilogi-radio.component';
import { IlogiSelectComponent } from '../../../../customInputComponents/ilogi-select/ilogi-select.component';
import { DynamicTableComponent } from '../../../../shared/component/dynamic-table/dynamic-table.component';
import { GenericService } from '../../../../_service/generic/generic.service';
import { CommonModule } from '@angular/common';

// 🔹 Interface for backend response
interface UnitDetailsResponse {
  unit_name: string;
  unit_address: string;
  pin_no: string;
  post_office: string;
  contact_no: string;
  fax: string | null;
  email: string;
  website: string;

  unit_location_district: string;
  unit_location_subdivision: string;
  unit_location_police_station: string;
  unit_location_land_type: string;
  unit_location_area_type: string;
  unit_location_estate_name: string;
  unit_location_plot_no: string;
  unit_location_block: string | null;
  unit_location_gram_panchayat: string | null;
  unit_location_municipality: string;
  unit_location_ward_no: string;
  unit_location_planning_area: string;

  land_record_details_revenue_circle: string;
  land_record_details_tehasil: string;
  land_record_details_revenue_mouza: string;
  land_record_details_khatian_number_new: string;
  land_record_details_plot_number_cs_sabek: string;
  land_record_details_plot_number_rs_hal: string;
  land_record_details_classification_of_land: string;
  land_record_details_land_area: string;
  land_record_details_unit: string;

  construction_details_load_bearing_in_sq_mtr: string;
  construction_details_rcc_building_in_sq_mtr: string;
  construction_details_others_construction: string;
  construction_details_sanitary_latrine_count: string;
  construction_details_boundary_wall_in_mtr: string;
  construction_details_power_supply_agency_at_the_factory: string;

  investment_details_value_of_land_as_per_sale_deed: string;
  investment_details_value_of_building: string;
  investment_details_value_of_plant_machinery_or_service_equipment: string;
  investment_details_total_project_cost: string;

  employment_details_worker_men_count: string;
  employment_details_worker_women_count: string;
  employment_details_management_staff_count: string;
  employment_details_others_count: string;
  employment_details_total_employment: string;

  annual_turnover: string;
  category_of_enterprise: string;
  working_session: string;
  product_manufacturing_process: string;
}

@Component({
  selector: 'app-unit-registration-form',
  templateUrl: './unit-details.component.html',
  styleUrls: ['./unit-details.component.scss'],
  standalone: true,
  imports: [
    DynamicTableComponent,
    IlogiInputComponent,
    IlogiRadioComponent,
    IlogiSelectComponent,
    ReactiveFormsModule,
    CommonModule,
  ],
})
export class UnitDetailsComponent implements OnInit {
  form!: FormGroup;
  submitted = false;

  // Table rows for dynamic tables
  projectCostRows = [
    { label: 'Value of Land as per Sale Deed', controlName: 'land', type: 'number' },
    { label: 'Value of Building', controlName: 'building', type: 'number' },
    { label: 'Value of Plant & Machinery or Service Equipment', controlName: 'machinery', type: 'number' },
    { label: 'Total Project Cost', controlName: 'totalCost', readonly: true },
  ];

  employmentRows = [
    { label: 'Worker - Men', controlName: 'men', type: 'number' },
    { label: 'Worker - Women', controlName: 'women', type: 'number' },
    { label: 'Management Staff', controlName: 'staff', type: 'number' },
    { label: 'Others', controlName: 'others', type: 'number' },
    { label: 'Total Employment', controlName: 'total', readonly: true },
  ];

  // Dropdown options
  unit_location_land_type = [
    { id: 'Industrial Estate', name: 'Industrial Estate' },
    { id: 'Panchayat', name: 'Panchayat' },
    { id: 'Municipality', name: 'Municipality' },
  ];

  land_record_details_classification_of_land = [
    { id: 'Agriculture', name: 'Agriculture' },
    { id: 'Commercial', name: 'Commercial' },
    { id: 'Residential', name: 'Residential' },
    { id: 'Industrial', name: 'Industrial' },
  ];

  land_record_details_unit = [
    { id: 'Sq Mtr', name: 'Sq Mtr' },
    { id: 'Acre', name: 'Acre' },
    { id: 'Hector', name: 'Hector' },
  ];

  category_of_enterprise = [
    { id: 'Micro', name: 'Micro' },
    { id: 'Small', name: 'Small' },
    { id: 'Medium', name: 'Medium' },
    { id: 'Large', name: 'Large' },
  ];

  // Districts and Subdivisions (should be fetched from API in production)
  districtOptions = [
    { id: 'West Tripura', name: 'West Tripura' },
    { id: 'North Tripura', name: 'North Tripura' },
  ];

  subDivisionOptions = [
    { id: 'Sadar', name: 'Sadar' },
    { id: 'Khowai', name: 'Khowai' },
  ];

  constructor(private fb: FormBuilder, private apiService: GenericService) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      // General Information
      unitName: ['', Validators.required],
      unitAddress: ['', Validators.required],
      postOffice: ['', Validators.required],
      pinNo: ['', [Validators.required, Validators.pattern(/^[0-9]{6}$/)]],
      contactNo: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]],
      fax: [''],
      email: ['', [Validators.required, Validators.email]],
      website: [''],

      // Location
      district: ['', Validators.required],
      subDivision: ['', Validators.required],
      policeStation: ['', Validators.required],
      landType: ['', Validators.required],
      areaType: ['', Validators.required],
      estateName: [''],
      estatePlotNo: [''],
      block: [''],
      gramPanchayat: [''],
      municipality: [''],
      wardNo: [''],
      planningArea: [''],

      // Land Record
      revenueCircle: [''],
      tehasil: [''],
      mouza: [''],
      khatianNo: [''],
      plotNoCs: [''],
      plotNo: [''],
      classification: [''],
      landArea: ['', Validators.required],
      details_unit: ['Sq Mtr'], // default

      // Construction
      loadBearing: [''],
      buildingSqMtr: [''],
      otherConstruction: [''],
      sanitaryCount: [''],
      boundaryWall: [''],
      powerSupply: [''],

      // Project Cost
      land: [0],
      building: [0],
      machinery: [0],
      totalCost: [{ value: '0.00', disabled: true }],

      // Employment
      men: [0],
      women: [0],
      staff: [0],
      others: [0],
      total: [{ value: '0', disabled: true }],

      // Financial
      annualTurnover: ['', Validators.required],
      category: ['', Validators.required],
      process: ['', Validators.required],
      workingSession: ['', Validators.required],
    });

    // Auto-calculate totals
    this.form.valueChanges.subscribe((values) => {
      const totalCost =
        (+values.land || 0) + (+values.building || 0) + (+values.machinery || 0);
      this.form.get('totalCost')?.setValue(totalCost.toFixed(2), { emitEvent: false });

      const totalEmp =
        (+values.men || 0) +
        (+values.women || 0) +
        (+values.staff || 0) +
        (+values.others || 0);
      this.form.get('total')?.setValue(totalEmp.toString(), { emitEvent: false });
    });

    this.loadUnitDetails();
  }

  loadUnitDetails(): void {
    this.apiService.getByConditions({}, 'api/caf/unit-details-view').subscribe({
      next: (res: { data: UnitDetailsResponse } | null) => {
        if (res?.data) {
          const data = res.data;

          // ✅ Use patchValue — never recreate the form
          this.form.patchValue({
            // General
            unitName: data.unit_name || '',
            unitAddress: data.unit_address || '',
            postOffice: data.post_office || '',
            pinNo: data.pin_no || '',
            contactNo: data.contact_no || '',
            fax: data.fax || '',
            email: data.email || '',
            website: data.website || '',

            // Location
            district: data.unit_location_district || '',
            subDivision: data.unit_location_subdivision || '',
            policeStation: data.unit_location_police_station || '',
            landType: data.unit_location_land_type || '',
            areaType: data.unit_location_area_type || '',
            estateName: data.unit_location_estate_name || '',
            estatePlotNo: data.unit_location_plot_no || '',
            block: data.unit_location_block || '',
            gramPanchayat: data.unit_location_gram_panchayat || '',
            municipality: data.unit_location_municipality || '',
            wardNo: data.unit_location_ward_no || '',
            planningArea: data.unit_location_planning_area || '',

            // Land Record
            revenueCircle: data.land_record_details_revenue_circle || '',
            tehasil: data.land_record_details_tehasil || '',
            mouza: data.land_record_details_revenue_mouza || '',
            khatianNo: data.land_record_details_khatian_number_new || '',
            plotNoCs: data.land_record_details_plot_number_cs_sabek || '',
            plotNo: data.land_record_details_plot_number_rs_hal || '',
            classification: data.land_record_details_classification_of_land || '',
            landArea: parseFloat(data.land_record_details_land_area || '0').toFixed(2),
            details_unit: data.land_record_details_unit || 'Sq Mtr',

            // Construction
            loadBearing: data.construction_details_load_bearing_in_sq_mtr || '',
            buildingSqMtr: data.construction_details_rcc_building_in_sq_mtr || '',
            otherConstruction: data.construction_details_others_construction || '',
            sanitaryCount: data.construction_details_sanitary_latrine_count || '',
            boundaryWall: data.construction_details_boundary_wall_in_mtr || '',
            powerSupply: data.construction_details_power_supply_agency_at_the_factory || '',

            // Project Cost
            land: parseFloat(data.investment_details_value_of_land_as_per_sale_deed || '0').toFixed(2),
            building: parseFloat(data.investment_details_value_of_building || '0').toFixed(2),
            machinery: parseFloat(data.investment_details_value_of_plant_machinery_or_service_equipment || '0').toFixed(2),
            totalCost: parseFloat(data.investment_details_total_project_cost || '0').toFixed(2),

            // Employment
            men: parseInt(data.employment_details_worker_men_count || '0', 10),
            women: parseInt(data.employment_details_worker_women_count || '0', 10),
            staff: parseInt(data.employment_details_management_staff_count || '0', 10),
            others: parseInt(data.employment_details_others_count || '0', 10),
            total: parseInt(data.employment_details_total_employment || '0', 10),

            // Financial
            annualTurnover: parseFloat(data.annual_turnover || '0').toFixed(2),
            category: data.category_of_enterprise || '',
            process: data.product_manufacturing_process || '',
            workingSession: data.working_session || '',
          });
        }
      },
      error: (err) => {
        console.error('Error fetching unit details:', err);
      },
    });
  }

  onSubmit(isDraft: boolean = false): void {
    this.submitted = true;

    // if (this.form.invalid) {
    //   this.apiService.openSnackBar('Please fill all required fields.', 'error');
    //   return;
    // }

    const raw = this.form.getRawValue();

    // Helper to format decimal fields
    const formatDecimal = (value: any): string => {
      const num = parseFloat(value);
      return isNaN(num) ? '0.00' : num.toFixed(2);
    };

    // Helper to format integers
    const formatInt = (value: any): string => {
      const num = parseInt(value, 10);
      return isNaN(num) ? '0' : num.toString();
    };

    // Format website
    const website = raw.website
      ? raw.website.trim().startsWith('http')
        ? raw.website.trim()
        : `https://${raw.website.trim()}`
      : null;

    // Final payload
    const payload = {
      user_id: 1,
      unit_name: raw.unitName,
      unit_address: raw.unitAddress,
      pin_no: raw.pinNo,
      post_office: raw.postOffice,
      contact_no: raw.contactNo,
      fax: raw.fax ? raw.fax : null,
      email: raw.email,
      website: website,

      unit_location_district: raw.district,
      unit_location_subdivision: raw.subDivision,
      unit_location_police_station: raw.policeStation,
      unit_location_land_type: raw.landType,
      unit_location_area_type: raw.areaType,
      unit_location_estate_name: raw.estateName,
      unit_location_plot_no: raw.estatePlotNo,
      unit_location_block: raw.block || null,
      unit_location_gram_panchayat: raw.gramPanchayat || null,
      unit_location_municipality: raw.municipality,
      unit_location_ward_no: raw.wardNo,
      unit_location_planning_area: raw.planningArea,

      land_record_details_revenue_circle: raw.revenueCircle,
      land_record_details_tehasil: raw.tehasil,
      land_record_details_revenue_mouza: raw.mouza,
      land_record_details_khatian_number_new: raw.khatianNo,
      land_record_details_plot_number_cs_sabek: raw.plotNoCs,
      land_record_details_plot_number_rs_hal: raw.plotNo,
      land_record_details_classification_of_land: raw.classification,
      land_record_details_land_area: formatDecimal(raw.landArea),
      land_record_details_unit: raw.details_unit,

      construction_details_load_bearing_in_sq_mtr: raw.loadBearing || '',
      construction_details_rcc_building_in_sq_mtr: raw.buildingSqMtr || '',
      construction_details_others_construction: raw.otherConstruction || '',
      construction_details_sanitary_latrine_count: raw.sanitaryCount || '',
      construction_details_boundary_wall_in_mtr: raw.boundaryWall || '',
      construction_details_power_supply_agency_at_the_factory: raw.powerSupply || '',

      investment_details_value_of_land_as_per_sale_deed: formatDecimal(raw.land),
      investment_details_value_of_building: formatDecimal(raw.building),
      investment_details_value_of_plant_machinery_or_service_equipment: formatDecimal(raw.machinery),
      investment_details_total_project_cost: formatDecimal(raw.totalCost),

      employment_details_worker_men_count: formatInt(raw.men),
      employment_details_worker_women_count: formatInt(raw.women),
      employment_details_management_staff_count: formatInt(raw.staff),
      employment_details_others_count: formatInt(raw.others),
      employment_details_total_employment: formatInt(raw.total),

      annual_turnover: formatDecimal(raw.annualTurnover),
      category_of_enterprise: raw.category,
      working_session: raw.workingSession,
      product_manufacturing_process: raw.process,
    };

    if (isDraft) {
      (payload as any).save_data = 1;
    }

    console.log('Final Payload:', payload);

    this.apiService.getByConditions(payload, 'api/caf/unit-details-store').subscribe({
      next: (res) => {
        console.log('API Success:', res);
        const message = isDraft
          ? 'Draft saved successfully!'
          : 'Unit details submitted successfully!';
        this.apiService.openSnackBar(message, 'success');
      },
      error: (err) => {
        console.error('API Error:', err);
        this.apiService.openSnackBar('Failed to save unit details.', 'error');
      },
    });
  }
}