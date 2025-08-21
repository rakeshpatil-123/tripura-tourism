import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { DynamicTableComponent } from '../../../../shared/component/dynamic-table/dynamic-table.component';
import { IlogiInputComponent } from "../../../../customInputComponents/ilogi-input/ilogi-input.component";
import { IlogiRadioComponent } from '../../../../customInputComponents/ilogi-radio/ilogi-radio.component';
import { IlogiSelectComponent } from '../../../../customInputComponents/ilogi-select/ilogi-select.component';
import { GenericService } from '../../../../_service/generic/generic.service';

@Component({
  selector: 'app-unit-registration-form',
  templateUrl: './unit-details.component.html',
  styleUrls: ['./unit-details.component.scss'],
  standalone: true,
  imports: [
    DynamicTableComponent,
    IlogiInputComponent,
    ReactiveFormsModule,
    IlogiRadioComponent,
    IlogiSelectComponent
  ]
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

  districtOptions = [{ id: 1, name: 'District 1' }, { id: 2, name: 'District 2' }];
  subDivisionOptions = [{ id: 1, name: 'Sub Division 1' }, { id: 2, name: 'Sub Division 2' }];

  constructor(private fb: FormBuilder, private genericService: GenericService) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      // General Information
      unitName: [''],
      unitAddress: [''],
      postOffice: [''],
      pinNo: [''],
      contactNo: [''],
      fax: [''],
      email: [''],
      website: [''],

      // Location
      district: [''],
      subDivision: [''],
      policeStation: [''],
      landType: [''],
      areaType: [''],
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
      landArea: [''],
      landFloor: [''],
      classification: [''],

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
      const totalCost =
        (+values.land || 0) +
        (+values.building || 0) +
        (+values.machinery || 0);
      this.form.get('totalCost')?.setValue(totalCost, { emitEvent: false });

      const totalEmp =
        (+values.men || 0) +
        (+values.women || 0) +
        (+values.staff || 0) +
        (+values.others || 0);
      this.form.get('total')?.setValue(totalEmp, { emitEvent: false });
    });

    // 🔹 Fetch initial data from API
    this.loadUnitDetails();
  }

  // API call to get existing data
  loadUnitDetails(): void {
    this.genericService.getByConditions({  }, 'api/caf/unit-details-view')
      .subscribe({
        next: (res: any) => {
          if (res) {
            this.form.patchValue({
              unitName: res.unit_name,
              unitAddress: res.unit_address,
              postOffice: res.post_office,
              pinNo: res.pin_no,
              contactNo: res.contact_no,
              fax: res.fax,
              email: res.email,
              website: res.website,

              district: res.unit_location_district,
              subDivision: res.unit_location_subdivision,
              policeStation: res.unit_location_police_station,
              landType: res.unit_location_land_type,
              areaType: res.unit_location_area_type,
              estateName: res.unit_location_estate_name,
              estatePlotNo: res.unit_location_plot_no,
              block: res.unit_location_block,
              gramPanchayat: res.unit_location_gram_panchayat,
              municipality: res.unit_location_municipality,
              wardNo: res.unit_location_ward_no,
              planningArea: res.unit_location_planning_area,

              revenueCircle: res.land_record_details_revenue_circle,
              tehasil: res.land_record_details_tehasil,
              mouza: res.land_record_details_revenue_mouza,
              khatianNo: res.land_record_details_khatian_number_new,
              plotNoCs: res.land_record_details_plot_number_cs_sabek,
              plotNo: res.land_record_details_plot_number_rs_hal,
              classification: res.land_record_details_classification_of_land,
              landArea: res.land_record_details_land_area,

              loadBearing: res.construction_details_load_bearing_in_sq_mtr,
              buildingSqMtr: res.construction_details_rcc_building_in_sq_mtr,
              otherConstruction: res.construction_details_others_construction,
              sanitaryCount: res.construction_details_sanitary_latrine_count,
              boundaryWall: res.construction_details_boundary_wall_in_mtr,
              powerSupply: res.construction_details_power_supply_agency_at_the_factory,

              land: +res.investment_details_value_of_land_as_per_sale_deed || 0,
              building: +res.investment_details_value_of_building || 0,
              machinery: +res.investment_details_value_of_plant_machinery_or_service_equipment || 0,
              totalCost: +res.investment_details_total_project_cost || 0,

              men: +res.employment_details_worker_men_count || 0,
              women: +res.employment_details_worker_women_count || 0,
              staff: +res.employment_details_management_staff_count || 0,
              others: +res.employment_details_others_count || 0,
              total: +res.employment_details_total_employment || 0,

              annualTurnover: res.annual_turnover,
              category: res.category_of_enterprise,
              process: res.product_manufacturing_process,
              workingSession: res.working_session
            });
          }
        },
        error: (err) => {
          console.error('Error fetching unit details:', err);
        }
      });
  }

  onSubmit(isDraft: boolean): void {
    if (this.form.valid) {
      const raw = this.form.getRawValue();

      const payload = {
        user_id: 1,
        unit_name: raw.unitName,
        unit_address: raw.unitAddress,
        pin_no: raw.pinNo,
        post_office: raw.postOffice,
        contact_no: raw.contactNo,
        fax: raw.fax,
        email: raw.email,
        website: raw.website,

        unit_location_district: raw.district,
        unit_location_subdivision: raw.subDivision,
        unit_location_police_station: raw.policeStation,
        unit_location_land_type: raw.landType,
        unit_location_area_type: raw.areaType,
        unit_location_estate_name: raw.estateName,
        unit_location_plot_no: raw.estatePlotNo,
        unit_location_block: raw.block,
        unit_location_gram_panchayat: raw.gramPanchayat,
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
        land_record_details_land_area: raw.landArea,
        land_record_details_unit: 'Sq Mtr',

        construction_details_load_bearing_in_sq_mtr: raw.loadBearing,
        construction_details_rcc_building_in_sq_mtr: raw.buildingSqMtr,
        construction_details_others_construction: raw.otherConstruction,
        construction_details_sanitary_latrine_count: raw.sanitaryCount,
        construction_details_boundary_wall_in_mtr: raw.boundaryWall,
        construction_details_power_supply_agency_at_the_factory: raw.powerSupply,

        investment_details_value_of_land_as_per_sale_deed: raw.land,
        investment_details_value_of_building: raw.building,
        investment_details_value_of_plant_machinery_or_service_equipment: raw.machinery,
        investment_details_total_project_cost: raw.totalCost,

        employment_details_worker_men_count: raw.men,
        employment_details_worker_women_count: raw.women,
        employment_details_management_staff_count: raw.staff,
        employment_details_others_count: raw.others,
        employment_details_total_employment: raw.total,

        annual_turnover: raw.annualTurnover,
        category_of_enterprise: raw.category,
        working_session: raw.workingSession,
        product_manufacturing_process: raw.process
      };

      if (isDraft) {
        (payload as any)["save_data"] = 1;
      }

      console.log('Final Payload:', payload);

      this.genericService.getByConditions(payload, 'api/caf/unit-details-store')
        .subscribe({
          next: (res) => {
            console.log('API Success:', res);
            this.genericService.openSnackBar('Unit details saved successfully!', 'Success');
          },
          error: (err) => {
            console.error('API Error:', err);
            this.genericService.openSnackBar('Something went wrong while saving unit details', 'Error');
          }
        });
    } else {
      this.genericService.openSnackBar('Please fill in required fields.', 'Error');
    }
  }
}
