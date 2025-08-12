import { Component } from '@angular/core';
import { FloatLabelModule } from 'primeng/floatlabel';

import { DatePickerModule } from 'primeng/datepicker';
@Component({
  selector: 'app-prime-date',
  imports: [DatePickerModule, FloatLabelModule],
  templateUrl: './prime-date.component.html',
  styleUrl: './prime-date.component.scss'
})
export class PrimeDateComponent {

}
