import { Component } from '@angular/core';
import { PrimeInputComponent } from '../../customPrimengComponents/prime-input/prime-input.component';
import { PrimeDropDownComponent } from '../../customPrimengComponents/prime-drop-down/prime-drop-down.component';
import { PrimeDateComponent } from '../../customPrimengComponents/prime-date/prime-date.component';

@Component({
  selector: 'app-demo',
  imports: [PrimeInputComponent, PrimeDropDownComponent, PrimeDateComponent],
  templateUrl: './demo.component.html',
  styleUrl: './demo.component.scss'
})
export class DemoComponent {

}
