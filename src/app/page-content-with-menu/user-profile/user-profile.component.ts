import { Component, OnInit } from '@angular/core';
import { IlogiInputComponent } from "../../customInputComponents/ilogi-input/ilogi-input.component";
import { TabsModule } from 'primeng/tabs';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
interface UserProfile {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
}

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, IlogiInputComponent, TabsModule],
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.scss']
})
export class UserProfileComponent implements OnInit {

  // tabs = [
  //   { label: 'Profile', route: '/profile', icon: 'pi pi-user' },
  //   { label: 'Change Password', route: '/change-password', icon: 'pi pi-lock' }
  // ];

  originalProfile: UserProfile = {
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com',
    phone: '9876543210',
    address: '123 Main Street'
  };

  profile: UserProfile = { ...this.originalProfile };

  passwordData = {
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  };
  

  ngOnInit(): void {}

  get isProfileChanged(): boolean {
    return JSON.stringify(this.profile) !== JSON.stringify(this.originalProfile);
  }
  get checkEmptyField(): boolean {
    return !this.profile.firstName || !this.profile.lastName || !this.profile.email || !this.profile.phone || !this.profile.address;
  }

  updateProfile(): void {
    if (this.isProfileChanged) {
      console.log('Updating profile...', this.profile);
      this.originalProfile = { ...this.profile }; 
    }
  }

  changePassword(): void {
    console.log('Changing password...', this.passwordData);
  }
}
