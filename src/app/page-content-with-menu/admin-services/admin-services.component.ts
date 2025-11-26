import { Component, OnInit, OnDestroy, AfterViewInit, ViewChild } from '@angular/core';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { CommonModule, DatePipe } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { filter, finalize, Subscription } from 'rxjs';
import { GenericService } from '../../_service/generic/generic.service';
import { MatDialog } from '@angular/material/dialog';
import { AddServiceDialogComponent } from '../add-service-dialog/add-service-dialog.component';
import { ViewServiceDialogComponent } from '../view-service-dialog/view-service-dialog.component';
import moment from 'moment';
import { AddQuestionnaireDialogComponent } from '../add-questionnaire-dialog/add-questionnaire-dialog.component';
import { ViewQuestionnairesDialogComponent } from '../view-questionnaires-dialog/view-questionnaires-dialog.component';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { ServiceFeeRuleDialogComponent } from '../service-fee-rule-dialog/service-fee-rule-dialog.component';
import { RenewalCycleComponent } from '../renewal-cycle/renewal-cycle.component';
import { ViewServiceFeeRuleComponent } from '../view-service-fee-rule/view-service-fee-rule.component';
import { ViewRenewalCycleDialogComponent } from '../view-renewal-cycle-dialog/view-renewal-cycle-dialog.component';
import { ViewRenewalFeeRuleComponent } from '../view-renewal-fee-rule/view-renewal-fee-rule.component';
import { AddRenewalFeeRuleComponent } from '../add-renewal-fee-rule/add-renewal-fee-rule.component';
import { ViewApprovalFlowDialogComponent } from '../view-approval-flow-dialog/view-approval-flow-dialog.component';
import { AddApprovalFlowComponent } from '../add-approval-flow/add-approval-flow.component';
import { MatMenuModule } from "@angular/material/menu";
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatPaginatorModule } from "@angular/material/paginator";
import { MatPaginator } from '@angular/material/paginator';
import { IlogiSelectComponent, SelectOption } from "../../customInputComponents/ilogi-select/ilogi-select.component";
import { IlogiInputComponent } from "../../customInputComponents/ilogi-input/ilogi-input.component";
import { ServiceCertificateComponent } from '../service-certificate/service-certificate.component';
import { ThirdPartyParamsComponent } from '../third-party-params/third-party-params.component';
import Swal from 'sweetalert2';
import { LoaderService } from '../../_service/loader/loader.service';
import { ViewThirdPartyParamsComponent } from '../view-third-party-params/view-third-party-params.component';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
export interface Service {
  department_id: string;
  service_title_or_description: string;
  noc_name: string;
  noc_short_name: string;
  noc_type: string;
  noc_payment_type: string;
  target_days: number;

  has_input_form: boolean;
  depends_on_services: string;

  generate_id: boolean;
  generate_pdf: boolean;
  generated_id_format: string;

  label_noc_date: string;
  label_noc_doc: string;
  label_noc_no: string;
  label_valid_till: string;

  show_letter_date: boolean;
  show_valid_till: boolean;
  auto_renewal: boolean;
  external_data_share: boolean;

  noc_validity: number;
  valid_for_upload: boolean;

  nsw_license_id: string;
  status: number;
  allow_repeat_application: boolean;
  service_mode: string;
}
export enum NocType {
  CFE = 'CFE',
  CFO = 'CFO',
  RENEWAL = 'Renewal',
  SPECIAL = 'Special',
  OTHERS = 'Others',
}
@Component({
  selector: 'app-admin-services',
  templateUrl: './admin-services.component.html',
  styleUrls: ['./admin-services.component.scss'],
  imports: [
    MatTableModule,
    DatePipe,
    MatIconModule,
    MatTooltipModule,
    MatButtonModule,
    MatCheckboxModule,
    MatMenuModule,
    ConfirmDialogModule,
    ButtonModule,
    MatPaginatorModule,
    IlogiSelectComponent,
    IlogiInputComponent,
    CommonModule,
    FormsModule,
    MatSlideToggleModule
],
  providers: [ConfirmationService],
})
export class AdminServicesComponent implements OnInit, OnDestroy, AfterViewInit {
  subscription: Subscription;
  nocTypes: SelectOption[] = [
    { id: null, name: 'All' },
    ...Object.values(NocType).map(n => ({ id: n, name: n }))
  ];
  selectedNocType: string | null = null;
  displayedColumns: string[] = [
    'sno',
    'id',
    'name',
    'department',
    'noc_type',
    'service_mode',
    'status',
    'actions'
  ];
  dataSource = new MatTableDataSource<Service>([]);
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  selectedDepartment: any = '';
  departments: any[] = [];
  allServices: Service[] = [];
  serviceModes: SelectOption[] = [
    { id: '', name: 'All Modes' },
    { id: 'native', name: 'Native' },
    { id: 'third_party', name: 'Third Party' }
  ];
  statusOptions: { id: string; name: string }[] = [
    { id: '', name: 'All' },
    { id: '1', name: 'Active' },
    { id: '0', name: 'Disabled' }
  ];
  filteredServices: any[] = [];
  selectedStatus: string = '';
  selectedServiceMode: string | null = '';

  constructor(
    private genericService: GenericService,
    private dialog: MatDialog,
    private confirmationService: ConfirmationService,
    private loaderService: LoaderService
  ) {
    this.subscription = new Subscription();
  }

  ngOnInit() {
    this.loadServices();
    this.loadDepartments();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  loadServices() {
    this.loaderService.showLoader();
    const sub = this.genericService.getAdminServices().pipe(finalize(()=> this.loaderService.hideLoader())).subscribe({
      next: (res) => {
        if (res.status === 1 && res.data) {
          const services = res.data.map((item: any) => ({
            ...item,
            name: item.service_title_or_description,
            department: item.department_id,
            department_name: item.department_name || 'Native',
            service_mode: item.service_mode,
            noc_type: item.noc_type,
            activeFrom: moment().format('YYYY-MM-DD'),
          }));
          this.allServices = services;
          this.filteredServices = [...this.allServices];
          this.dataSource.data = services;
        }
      },
      error: (err) => {
        console.error('Error fetching admin services:', err);
      },
    });
    this.subscription.add(sub);
  }

  openAddServiceDialog() {
    const dialogRef = this.dialog.open(AddServiceDialogComponent, {
      width: '1055px',
      maxWidth: '95vw',
      height: 'auto',
      maxHeight: '90vh',
      panelClass: 'custom-dialog-container',
      disableClose: true,
      enterAnimationDuration: '300ms',
      exitAnimationDuration: '200ms',
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result === 'created') {
        this.loadServices();
      }
    });
  }

  editService(service: Service) {
    const dialogRef = this.dialog.open(AddServiceDialogComponent, {
      width: '1055px',
      maxWidth: '95vw',
      height: 'auto',
      maxHeight: '90vh',
      panelClass: 'custom-dialog-container',
      disableClose: true,
      data: service,
      enterAnimationDuration: '300ms',
      exitAnimationDuration: '200ms',
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result === 'updated') {
        this.genericService.openSnackBar(
          'Service updated successfully.',
          'Close'
        );
        this.loadServices();
      }
    });
  }

deleteService(service: Service): void {
  this.confirmationService.confirm({
    message: `Are you sure you want to delete "${service.service_title_or_description}"?`,
    header: 'Confirm Service Deletion',
    icon: 'pi pi-exclamation-triangle',
    acceptLabel: 'Yes',
    rejectLabel: 'No',
    acceptButtonStyleClass: 'p-button-success p-button-lg p-button-rounded',
    rejectButtonStyleClass: 'p-button-danger p-button-lg p-button-rounded',
    accept: () => {
      this.genericService.deleteAdminService((service as any).id).subscribe({
      next: () => {
        this.genericService.openSnackBar(
          'Service deleted successfully.',
          'Success'
        );
        this.loadServices();
      },
      error: () => {
        this.genericService.openSnackBar('Error deleting service.', 'Error');
        },
      });
    },
    reject: () => {
      this.genericService.openSnackBar('Deletion cancelled.', 'Info');
    },
  });
}

  viewService(service: Service): void {
    this.dialog.open(ViewServiceDialogComponent, {
      width: '30.72vw',
      maxHeight: '80vh',
      data: service,
    });
  }

  handleAction(type: string, action: 'view' | 'add' | 'edit' | 'delete', service: Service) {
    switch (type) {
      case 'service':
        if (action === 'view') this.viewService(service);
        if (action === 'add') this.openAddServiceDialog();
        if (action === 'edit') this.editService(service);
        if (action === 'delete') this.deleteService(service);
        break;

      case 'questionnaire':
        if (action === 'view') this.viewQuestionnaire(service);
        if (action === 'add') this.addOrEditQuestionnaire(service, 'add');
        if (action === 'edit') this.addOrEditQuestionnaire(service, 'edit');
        break;

      case 'feeRule':
        if (action === 'view') this.viewServiceFeeRule(service);
        if (action === 'add') this.addOrEditServiceFeeRule(service, 'add');
        break;

      case 'renewalCycle':
        if (action === 'view') this.viewRenewalCycle(service);
        if (action === 'add') this.addOrEditRenewalCycle(service, 'add');
        break;

      case 'renewalFee':
        if (action === 'view') this.viewRenewalFeeRule(service);
        if (action === 'add') this.addOrEditRenewalFeeRule(service, 'add');
        break;

      case 'approvalFlow':
        if (action === 'view') this.viewApprovalFlow(service);
        if (action === 'add') this.addOrEditApprovalFlow(service, 'add');
        break;
      case 'serviceCertificate':
        if (action === 'view') this.addOrEditServiceCertificate(service, 'view');
        if (action === 'add') this.addOrEditServiceCertificate(service, 'add');
        if (action === 'edit') this.addOrEditServiceCertificate(service, 'edit');
        break;
      case 'third_party':
        if (action === 'add') this.addOrEditThirdPartyParams(service, 'add');
        if (action === 'edit') this.addOrEditThirdPartyParams(service, 'edit');
        if (action === 'view') this.viewThirdPartyParams(service, 'view');
        break;
    }
  }

  addOrEditQuestionnaire(service: Service, mode: 'add' | 'edit'): void {
    const dialogRef = this.dialog.open(AddQuestionnaireDialogComponent, {
      width: '75%',
      maxWidth: '90vw',
      height: 'auto',
      maxHeight: '90vh',
      panelClass: 'center-dialog',
      data: { service, mode },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result === 'created' || result === 'updated') {
        this.loadServices();
      }
    });
  }

  viewQuestionnaire(service: Service): void {
    this.dialog.open(ViewQuestionnairesDialogComponent, {
      width: '97vw',
      maxWidth: '1200px',
      height: '80vh',
      maxHeight: '90vh',
      data: { service },
    });
  }

  addOrEditServiceFeeRule(service: Service, mode: 'add' | 'edit'): void {
    const dialogRef = this.dialog.open(ServiceFeeRuleDialogComponent, {
      width: '75%',
      maxWidth: '90vw',
      height: 'auto',
      maxHeight: '90vh',
      panelClass: 'center-dialog',
      data: { service, mode },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result === 'created' || result === 'updated') {
        this.loadServices();
      }
    });
  }

  viewServiceFeeRule(service: Service): void {
    this.dialog.open(ViewServiceFeeRuleComponent, {
      width: '100vw',
      maxWidth: '100vw',
      height: '100vh',
      maxHeight: '100vh',
      panelClass: 'full-screen-dialog',
      data: { service },
    });
  }

  addOrEditRenewalCycle(service: Service, mode: 'add' | 'edit'): void {
    const dialogRef = this.dialog.open(RenewalCycleComponent, {
      width: '75%',
      maxWidth: '50vw',
      height: 'auto',
      maxHeight: '90vh',
      panelClass: 'center-dialog',
      data: { service, mode },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result === 'created' || result === 'updated') {
        this.loadServices();
      }
    });
  }

  viewRenewalCycle(service: Service): void {
    this.dialog.open(ViewRenewalCycleDialogComponent, {
      width: '100vw',
      height: '100vh',
      maxWidth: '100vw',
      maxHeight: '100vh',
      panelClass: 'full-screen-dialog',
      data: { service },
    });
  }
  addOrEditRenewalFeeRule(service: Service, mode: 'add' | 'edit'): void {
  const dialogRef = this.dialog.open(AddRenewalFeeRuleComponent, {
    width: '85vw',
    maxWidth: '1000px',
    height: 'auto',
    maxHeight: '90vh',
    enterAnimationDuration: '300ms',
    exitAnimationDuration: '250ms',
    panelClass: ['renewal-dialog', 'center-dialog'],
    data: { service, mode },
    autoFocus: false,
  });
  dialogRef.afterClosed().subscribe((result) => {
    if (result === 'created' || result === 'updated') {
      this.loadServices();
    }
  });
}

  viewRenewalFeeRule(service: Service): void {
    this.dialog.open(ViewRenewalFeeRuleComponent, {
      width: '100vw',
      height: '100vh',
      maxWidth: '100vw',
      maxHeight: '100vh',
      panelClass: 'full-screen-dialog',
      data: { service },
    });
  }
  addOrEditApprovalFlow(service: Service, mode: 'add' | 'edit'): void {
    const dialogRef = this.dialog.open(AddApprovalFlowComponent, {
      width: '85vw',
      maxWidth: '700px',
      height: 'auto',
      maxHeight: '85vh',
      panelClass: ['approval-flow-dialog','dialog-slide-in'],
      data: { service, mode },
      autoFocus: false,
      disableClose: true
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result === 'created' || result === 'updated') {
        this.loadServices();
      }
    });
  }
  viewApprovalFlow(service: Service): void {
    this.dialog.open(ViewApprovalFlowDialogComponent, {
      width: '90vw',
      maxWidth: '1000px',
      height: '85vh',
      maxHeight: '800px',
      panelClass: 'custom-approval-dialog',
      data: { service },
    });
  }
  addOrEditServiceCertificate(service: Service, mode: 'add' | 'edit' | 'view'): void {
    const dialogRef = this.dialog.open(ServiceCertificateComponent, {
      width: '100%',
      height: '100%',
      maxWidth: '100vw',
      maxHeight: '100vh',
      panelClass: 'fullscreen-dialog',
      data: { service, mode },
      disableClose: true
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result === 'created' || result === 'updated') {
        this.loadServices();
      }
    });
  }
  addOrEditThirdPartyParams(service: any, mode: 'add' | 'edit'): void {
    const dialogRef = this.dialog.open(ThirdPartyParamsComponent, {
      width: '70vw',
      maxWidth: '95vw',
      height: 'auto',
      maxHeight: '90vh',
      panelClass: 'custom-thirdparty-dialog',
      data: { service, mode },
      disableClose: true,
      autoFocus: false
    });


    dialogRef.afterClosed().subscribe((result) => {
      if (result === 'created' || result === 'updated') {
        this.loadServices();
      }
    });
  }
  viewThirdPartyParams(service: Service, mode: 'view'): void {
    const isMobile = window.innerWidth < 768;
    this.dialog.open(ViewThirdPartyParamsComponent, {
      width: isMobile ? '98vw' : '90vw',
      height: isMobile ? '90vh' : '85vh',
      maxWidth: '95vw',
      maxHeight: '90vh',
      panelClass: 'custom-dialog',
      enterAnimationDuration: '300ms',
      exitAnimationDuration: '300ms',
      data: { service, mode },
    });
  }


  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value.trim().toLowerCase();
    this.dataSource.filter = filterValue;
  }
  loadDepartments(): void {
    this.loaderService.showLoader();
    this.genericService.getAllDepartmentNames().subscribe({
      next: (res: any) => {
        if (res?.status) {
          this.loaderService.hideLoader();
          this.departments = [
            { id: '', name: 'All Departments' },
            ...res.data.map((d: any) => ({ id: d.id, name: d.name }))
          ];
        }
      },
      error: () => {
        this.departments = [{ id: '', name: 'All Departments' }];
      }
    });
  }
  filterByDepartment(departmentId: any): void {
    this.selectedDepartment = departmentId;

    if (departmentId) {
      const depId = +departmentId;
      this.dataSource.data = this.allServices.filter(s => +s.department_id === depId);
    } else {
      this.dataSource.data = [...this.allServices];
    }

    if (this.paginator) {
      this.paginator.firstPage();
    }
  }
  filterByNocType(nocType: string | null): void {
    this.selectedNocType = nocType;
    let filteredServices = [...this.allServices];
    if (this.selectedDepartment) {
      const depId = +this.selectedDepartment;
      filteredServices = filteredServices.filter(s => +s.department_id === depId);
    }

    if (nocType) {
      filteredServices = filteredServices.filter(s => s.noc_type === nocType);
    }
    this.dataSource.data = filteredServices;

    if (this.paginator) {
      this.paginator.firstPage();
    }
  }
  filterByServiceMode(mode: string | null): void {
    this.selectedServiceMode = mode;
    let filteredData = [...this.allServices];
    if (this.selectedDepartment) {
      filteredData = filteredData.filter(s => +s.department_id === +this.selectedDepartment);
    }
    if (this.selectedNocType) {
      filteredData = filteredData.filter(s => s.noc_type === this.selectedNocType);
    }
    if (this.selectedServiceMode) {
      filteredData = filteredData.filter(s => s.service_mode === this.selectedServiceMode);
    }

    this.dataSource.data = filteredData;

    if (this.paginator) {
      this.paginator.firstPage();
    }
  }
  onStatusToggle(event: any, element: any): void {
    event.source.checked = element.status === 1;
    const newStatus = element.status === 1 ? 0 : 1;

    Swal.fire({
      title: newStatus === 1 ? 'Activate Service?' : 'Deactivate Service?',
      text: newStatus === 1
          ? 'This will activate the service.'
          : 'This will deactivate the service.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#1976d2',
      cancelButtonColor: '#d33',
      confirmButtonText: newStatus === 1 ? 'Yes, Activate' : 'Yes, Deactivate',
    }).then((result) => {
      if (result.isConfirmed) {
        element.status = newStatus;
        event.source.checked = newStatus === 1;
      const payload = { id: element.id, status: newStatus };

        this.genericService.updateAdminServiceStatus(payload).subscribe({
          next: (res: any) => {
            if (res.status === 1) {
              this.genericService.openSnackBar(
                newStatus === 1 ? 'Service activated successfully' : 'Service deactivated successfully',
                'Success'
              );
            } else {
              element.status = newStatus === 1 ? 0 : 1;
              event.source.checked = element.status === 1;
              this.genericService.openSnackBar('Failed to update status', 'Error');
            }
          },
          error: () => {
            element.status = newStatus === 1 ? 0 : 1;
            event.source.checked = element.status === 1;
            this.genericService.openSnackBar('Error while updating status', 'Error');
          }
        });
      }
    });
  }
filterByStatus(selectedStatus: string) {
  let filtered = this.allServices;

  if (selectedStatus) {
    filtered = this.allServices.filter(
      (service: Service) => String(service.status) === selectedStatus
    );
  }

  this.dataSource.data = filtered;

  if (this.paginator) {
    this.paginator.firstPage();
  }
}
exportServicesExcel() {
  Swal.fire({
    title: 'Do you want to export services data?',
    text: 'An Excel file will be downloaded to your system.',
    icon: 'question',
    showCancelButton: true,
    confirmButtonText: 'Yes, Export',
    cancelButtonText: 'Cancel',
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    background: '#fff',
    heightAuto: false
  }).then((result) => {
    if (result.isConfirmed) {
      this.loaderService.showLoader();

      this.genericService.getServiceExportExcel().subscribe({
        next: (res: Blob) => {
          this.loaderService.hideLoader();

          if (res && res.size > 0) {
            const blob = new Blob([res], {
              type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'services_export.xlsx';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);

            Swal.fire('Exported!', 'Your Excel file has been downloaded successfully.', 'success');
          } else {
            Swal.fire('No Data', 'No records available for export.', 'info');
          }
        },
        error: (err: any) => {
          this.loaderService.hideLoader();
          Swal.fire('Error', 'Failed to export data. Please try again.', err);
        },
      });
    }
  });
}
}
