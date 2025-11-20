import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { IlogiInputComponent } from '../../../customInputComponents/ilogi-input/ilogi-input.component';
import {
  IlogiSelectComponent,
  SelectOption,
} from '../../../customInputComponents/ilogi-select/ilogi-select.component';
import { MatButtonModule } from '@angular/material/button';
import { GenericService } from '../../../_service/generic/generic.service';
interface Department {
  id: number;
  name: string;
  details: string;
}

@Component({
  selector: 'app-query-feedback',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
  ],
  templateUrl: './query-feedback.component.html',
  styleUrls: ['./query-feedback.component.scss'],
})
export class QueryFeedbackFormComponent {
 
}
