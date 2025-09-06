import { Component } from '@angular/core';
import { FaIconLibrary } from '@fortawesome/angular-fontawesome';
import { faExclamationTriangle, faSearch, faCheckCircle, faDollarSign, faWindowMaximize, faFileAlt } from '@fortawesome/free-solid-svg-icons';
import { CommonModule } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

@Component({
  selector: 'app-mis-reports',
  standalone: true,
  imports: [CommonModule, FontAwesomeModule],
  templateUrl: './mis-reports.component.html',
  styleUrls: ['./mis-reports.component.scss']
})
export class MisReportsComponent {
  constructor(library: FaIconLibrary) {
    library.addIcons(faExclamationTriangle, faSearch, faCheckCircle, faDollarSign, faWindowMaximize, faFileAlt);
  }
}