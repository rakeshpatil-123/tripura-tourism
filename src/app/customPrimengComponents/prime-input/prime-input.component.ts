import { Component } from '@angular/core';
import { InputTextModule } from 'primeng/inputtext';
import { FloatLabelModule } from 'primeng/floatlabel';
@Component({
  selector: 'app-prime-input',
  imports: [InputTextModule, FloatLabelModule],
  templateUrl: './prime-input.component.html',
  styleUrl: './prime-input.component.scss'
})
export class PrimeInputComponent {

}
