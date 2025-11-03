import { Component, OnInit, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatTabsModule } from '@angular/material/tabs';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { animate, style, transition, trigger } from '@angular/animations';

import { DepartmentalInspectionListComponent } from '../departmental-inspection-list/departmental-inspection-list.component';
import { DepartmentalInspectionRequestComponent } from '../departmental-inspection-request/departmental-inspection-request.component';

import { IlogiSelectComponent } from '../../customInputComponents/ilogi-select/ilogi-select.component';
import { IlogiInputDateComponent } from '../../customInputComponents/ilogi-input-date/ilogi-input-date.component';
import { MatDialog } from '@angular/material/dialog';
import { AddDepartmentalInspectionComponent } from '../add-departmental-inspection/add-departmental-inspection.component';
import { AddDepartmentalJointInspectionComponent } from '../add-departmental-joint-inspection/add-departmental-joint-inspection.component';
import { GenericService } from '../../_service/generic/generic.service';

@Component({
  selector: 'app-departmental-inspection',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatTabsModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    DepartmentalInspectionListComponent,
    DepartmentalInspectionRequestComponent,
    IlogiSelectComponent,
    IlogiInputDateComponent,
  ],
  templateUrl: './departmental-inspection.component.html',
  styleUrls: ['./departmental-inspection.component.scss'],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  animations: [
    trigger('dialogAnim', [
      transition(':enter', [
        style({ transform: 'scale(0.95)', opacity: 0 }),
        animate('250ms ease-out', style({ transform: 'scale(1)', opacity: 1 })),
      ]),
      transition(':leave', [
        animate('200ms ease-in', style({ transform: 'scale(0.95)', opacity: 0 })),
      ]),
    ]),
  ],
})
export class DepartmentalInspectionComponent implements OnInit {
  tabs = [
    { label: 'Inspection List', component: DepartmentalInspectionListComponent, route: 'departmental-inspection-list' },
    { label: 'Inspection Request', component: DepartmentalInspectionRequestComponent, route: 'departmental-inspection-request' },
  ];

  selectedIndex = 0;

  dateFrom = new FormControl('');
  dateTo = new FormControl('');
  industryName = new FormControl('');

  industryOptions: any[] = [];

  constructor(private router: Router, private route: ActivatedRoute, public dialog: MatDialog, private genericService: GenericService) { }

  ngOnInit(): void {
    this.getUnitsList();
    this.route.queryParamMap.subscribe((params) => {
      const tabLabel = params.get('tab');
      const index = this.tabs.findIndex((t) => t.label === tabLabel);
      this.selectedIndex = index !== -1 ? index : 0;
    });
  }

  onTabChange(event: any): void {
    const selectedTab = this.tabs[event.index];
    this.selectedIndex = event.index;
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { tab: selectedTab.label },
      queryParamsHandling: 'merge',
    });
  }
  getUnitsList(): void {

    this.genericService.getUnitsList().subscribe({
      next: (response: any) => {
        if (response.status === 1 && Array.isArray(response.data)) {
          this.industryOptions = response.data.map((unit: any) => ({
            id: String(unit.id),
            name: unit.unit_name || 'Unnamed Unit',
          }));
        } else {
          this.industryOptions = [];
        }
      },
      error: (err: any) => {
        console.error('Error fetching units:', err);
        this.industryOptions = [];
      },
    });
  }

  createDepartmentalInspection(): void {
    const dialogRef = this.dialog.open(AddDepartmentalInspectionComponent, {
      width: '100vw',
      height: '100vh',
      maxWidth: '100vw',
      maxHeight: '100vh',
      panelClass: 'full-screen-dialog',
      enterAnimationDuration: '400ms',
      exitAnimationDuration: '400ms',
      hasBackdrop: true,
      backdropClass: 'dialog-backdrop',
      disableClose: false,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result === 'submitted') {
        console.log('Inspection form successfully submitted!');
      } else {
        console.log('Dialog closed without submission.');
      }
    });
  }
  createJointInspection(): void {
    const filters = {
      dateFrom: this.dateFrom.value,
      dateTo: this.dateTo.value,
      industryName: this.industryName.value,
    };
    const dialogRef = this.dialog.open(AddDepartmentalJointInspectionComponent, {
      width: '100vw',
      height: '100vh',
      maxWidth: '100vw',
      maxHeight: '100vh',
      panelClass: 'full-screen-dialog',
      enterAnimationDuration: '400ms',
      exitAnimationDuration: '400ms',
      hasBackdrop: true,
      backdropClass: 'dialog-backdrop',
      disableClose: false,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result === 'submitted') {
        console.log('Inspection form successfully submitted!');
      } else {
        console.log('Dialog closed without submission.');
      }
    });
  }

  resetFilters(): void {
    this.dateFrom.reset('');
    this.dateTo.reset('');
    this.industryName.reset('');
    alert('Filters have been reset.');
  }
  applyFilters(): void {
    const filters = {
      dateFrom: this.dateFrom.value,
      dateTo: this.dateTo.value,
      industryName: this.industryName.value,
    };

    if (!filters.dateFrom && !filters.dateTo && !filters.industryName) {
      alert(' Please select at least one filter before applying.');
      return;
    }

    alert(
      `Filters applied:\n\nFrom: ${filters.dateFrom || '-'}\nTo: ${filters.dateTo || '-'}\nIndustry: ${filters.industryName || '-'}`
    );
  }
}
