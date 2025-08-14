import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MatTabsModule } from '@angular/material/tabs';
import { MatCardModule, MatCard, MatCardContent } from '@angular/material/card'; // Optional for styling the content area
import { UnitDetailsComponent } from './unit-details/unit-details.component';
import { LineOfActivityComponent } from './line-of-activity/line-of-activity.component';
import { BankDetailsComponent } from './bank-details/bank-details.component';
import { ActivitiesComponent } from './activities/activities.component';
import { ClearenceComponent } from './clearence/clearence.component';
import { AttachmentComponent } from './attachment/attachment.component';
import { ManagementComponent } from './management/management.component';
import { EnterpriseDetailsComponent } from './enterprise-details/enterprise-details.component';
@Component({
  selector: 'app-application-form',
  standalone: true,
  imports: [CommonModule, MatTabsModule, MatCard],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './caf.component.html',
  styleUrls: ['./caf.component.scss'],
})
export class ApplicationFormComponent implements OnInit {
  // Define tabs with label and component
  tabs = [
    { label: 'Enterprise Details', component: EnterpriseDetailsComponent },
    { label: 'Unit Details', component: UnitDetailsComponent },
    { label: 'Management', component: ManagementComponent },
    { label: 'Line of Activity', component: LineOfActivityComponent },
    { label: 'Clearances', component: ClearenceComponent },
    { label: 'Bank Details', component: BankDetailsComponent },
    { label: 'Activities', component: ActivitiesComponent },
  ];

  constructor() {}

  ngOnInit(): void {}

  // Optional: Handle tab change events if needed
  onTabChange(event: any) {}
}
