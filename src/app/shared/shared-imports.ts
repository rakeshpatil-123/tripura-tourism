import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatSortModule } from '@angular/material/sort';
// import { IlogiInputComponent } from '../customInputComponents/ilogi-input/ilogi-input.component';
// import { IlogiInputDateComponent } from '../customInputComponents/ilogi-input-date/ilogi-input-date.component';
// import { IlogiRadioComponent } from '../customInputComponents/ilogi-radio/ilogi-radio.component';
// import { TidcInputComponent } from '../existingInputComponents/tidc-input/tidc-input.component';
// import { TidcInputDateComponent } from '../existingInputComponents/tidc-input-date/tidc-input-date.component';
// import { TidcRadioComponent } from '../existingInputComponents/tidc-radio/tidc-radio.component';
// import { TidcSelectComponent } from '../existingInputComponents/tidc-select/tidc-select.component';

export const SHARED_IMPORTS = [
  CommonModule,
  FormsModule,
  ReactiveFormsModule,
  MatTableModule,
  MatSortModule,

] as const;
