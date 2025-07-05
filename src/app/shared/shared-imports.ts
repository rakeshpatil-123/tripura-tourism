import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatSortModule } from '@angular/material/sort';
import { IlogiInputComponent } from '../customInputComponents/ilogi-input/ilogi-input.component';
import { IlogiInputDateComponent } from '../customInputComponents/ilogi-input-date/ilogi-input-date.component';
import { IlogiRadioComponent } from '../customInputComponents/ilogi-radio/ilogi-radio.component';

export const SHARED_IMPORTS = [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatTableModule,
    MatSortModule,



] as const;