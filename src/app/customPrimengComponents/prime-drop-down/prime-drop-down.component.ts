import { Component } from '@angular/core';
import { SelectModule } from 'primeng/select';
import { FloatLabelModule } from 'primeng/floatlabel';

@Component({
  selector: 'app-prime-drop-down',
  imports: [SelectModule, FloatLabelModule],
  templateUrl: './prime-drop-down.component.html',
  styleUrl: './prime-drop-down.component.scss'
})
export class PrimeDropDownComponent {

}
