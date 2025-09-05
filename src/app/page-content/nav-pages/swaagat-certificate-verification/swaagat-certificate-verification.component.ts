import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FaIconLibrary } from '@fortawesome/angular-fontawesome';
import { faUndo, faSearch } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

@Component({
  selector: 'app-swaagat-certificate-verification',
  standalone: true,
  imports: [CommonModule, FormsModule, FontAwesomeModule],
  templateUrl: './swaagat-certificate-verification.component.html',
  styleUrls: ['./swaagat-certificate-verification.component.scss']
})
export class SwaagatCertificateVerificationComponent {
  uid: string = '';
  certificate: string = '';
  message: string = '';
  messageType: string = '';
  isLoading: boolean = false;
  showDetails: boolean = false;
  details = {
    uid: '',
    name: '',
    address: ''
  };

  constructor(library: FaIconLibrary) {
    library.addIcons(faUndo, faSearch);
  }

  onReset() {
    this.uid = '';
    this.certificate = '';
    this.message = '';
    this.messageType = '';
    this.showDetails = false;
    this.details = { uid: '', name: '', address: '' };
  }

  onSearch() {
    if (!this.uid || !this.certificate) {
      this.message = 'Please fill in all mandatory fields.';
      this.messageType = 'error';
      return;
    }

    this.isLoading = true;
    this.message = '';
    this.messageType = '';
    this.showDetails = false;

    // Simulate API call
    setTimeout(() => {
      this.isLoading = false;
      const isValid = Math.random() > 0.3; // 70% chance of success for demo
      if (isValid) {
        this.details = {
          uid: this.uid,
          name: 'Sample Unit Name',
          address: '123 Sample Street, City, Country'
        };
        this.showDetails = true;
        this.message = 'Certificate verified successfully!';
        this.messageType = 'success';
      } else {
        this.showDetails = true;
        this.message = 'Invalid UID or Certificate Number.';
        this.messageType = 'error';
      }
    }, 1500);
  }
}