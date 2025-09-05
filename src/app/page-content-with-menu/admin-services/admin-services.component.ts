import { Component, OnInit, OnDestroy } from '@angular/core';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { DatePipe } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Subscription } from 'rxjs';
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
    MatMenuModule
  ],
})
export class AdminServicesComponent implements OnInit, OnDestroy {
  subscription: Subscription;
  displayedColumns: string[] = [
    'sno',
    'name',
    'department',
    'noc_type',
    'actions'
  ];
  dataSource = new MatTableDataSource<Service>([]);

  constructor(
    private genericService: GenericService,
    private dialog: MatDialog
  ) {
    this.subscription = new Subscription();
  }

  ngOnInit() {
    this.loadServices();
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  loadServices() {
    const sub = this.genericService.getAdminServices().subscribe({
      next: (res) => {
        if (res.status === 1 && res.data) {
          this.dataSource.data = res.data.map((item: any) => ({
            ...item,
            name: item.service_title_or_description,
            department: item.department_id,
            department_name: item.department_name,
            noc_type: item.noc_type,
            activeFrom: moment().format('YYYY-MM-DD'),
          }));
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
    if (!confirm(`Are you sure you want to delete "${service.service_title_or_description}"?`)) return;

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
  }

  viewService(service: Service): void {
    this.dialog.open(ViewServiceDialogComponent, {
      width: '30.72vw',
      maxHeight: '80vh',
      data: service,
    });
  }

  handleAction(type: string, action: 'view' | 'add' | 'edit', service: Service) {
    switch (type) {
      case 'service':
        if (action === 'view') this.viewService(service);
        if (action === 'add') this.openAddServiceDialog();
        if (action === 'edit') this.editService(service);
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
      width: '90vw',
      maxWidth: '1000px',
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
      width: '75%',
      maxWidth: '75vw',
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
      width: '85%',
      maxWidth: '1000px',
      height: 'auto',
      maxHeight: '90vh',
      panelClass: 'approval-flow-dialog',
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
      width: '80vw',
      maxWidth: '900px',
      height: '80vh',
      maxHeight: '700px',
      panelClass: 'full-screen-dialog',
      data: { service },
    });
  }
}
