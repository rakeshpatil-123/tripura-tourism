import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface DropdownItem {
  label: string;
  icon?: string;
  action: string;
}

interface DropdownButton {
  label: string;
  ariaLabel: string;
  icon: string;
  type: 'primary' | 'secondary';
  items: DropdownItem[];
  isOpen: boolean;
} 


@Component({
  selector: 'app-header-new',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './header-new.component.html',
  styleUrl: './header-new.component.scss'
})
export class HeaderNewComponent {
  logoPath = '../SWAAGAT 2.0 Logo Recreated.png';
  
  dropdownButtons: DropdownButton[] = [
    {
      label: 'Login',
      ariaLabel: 'Login options',
      icon: 'login',
      type: 'secondary',
      isOpen: false,
      items: [
        { label: 'Citizen Login', action: 'citizen-login' },
        { label: 'Officer Login', action: 'officer-login' },
        { label: 'Admin Login', action: 'admin-login' }
      ]
    },
    {
      label: 'Register',
      ariaLabel: 'Register options',
      icon: 'user-plus',
      type: 'primary',
      isOpen: false,
      items: [
        { label: 'Citizen Registration', action: 'citizen-register' },
        { label: 'Officer Registration', action: 'officer-register' }
      ]
    },
    {
      label: 'EN',
      ariaLabel: 'Language selector',
      icon: 'globe',
      type: 'secondary',
      isOpen: false,
      items: [
        { label: 'English', action: 'set-language-en' },
        { label: 'Hindi', action: 'set-language-hi' },
        { label: 'Assamese', action: 'set-language-as' },
        { label: 'Bengali', action: 'set-language-bn' }
      ]
    }
  ];

  onSearch(): void {
    console.log('Search clicked');
    // Implement search functionality
  }

  onDropdownToggle(index: number): void {
    // Close all other dropdowns
    this.dropdownButtons.forEach((button, i) => {
      if (i !== index) {
        button.isOpen = false;
      }
    });
    
    // Toggle current dropdown
    this.dropdownButtons[index].isOpen = !this.dropdownButtons[index].isOpen;
  }

  onDropdownItemClick(action: string): void {
    console.log('Dropdown item clicked:', action);
    
    // Close all dropdowns
    this.dropdownButtons.forEach(button => {
      button.isOpen = false;
    });

    // Handle different actions
    switch (action) {
      case 'citizen-login':
        this.handleCitizenLogin();
        break;
      case 'officer-login':
        this.handleOfficerLogin();
        break;
      case 'admin-login':
        this.handleAdminLogin();
        break;
      case 'citizen-register':
        this.handleCitizenRegister();
        break;
      case 'officer-register':
        this.handleOfficerRegister();
        break;
      case 'set-language-en':
      case 'set-language-hi':
      case 'set-language-as':
      case 'set-language-bn':
        this.handleLanguageChange(action);
        break;
    }
  }

  onClickOutside(): void {
    // Close all dropdowns when clicking outside
    this.dropdownButtons.forEach(button => {
      button.isOpen = false;
    });
  }

  getIconPath(iconName: string): string {
    const iconPaths: { [key: string]: string } = {
      'login': 'M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4M10 17l5-5-5-5M15 12H3',
      'user-plus': 'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 7a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM19 8v6M22 11h-6',
      'globe': 'M12 2a10 10 0 1 0 0 20 10 10 0 1 0 0-20zM2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z',
      'search': 'M11 11a8 8 0 1 0 0-16 8 8 0 0 0 0 16zM21 21l-4.3-4.3',
      'chevron-down': 'M6 9l6 6 6-6'
    };
    return iconPaths[iconName] || '';
  }

  private handleCitizenLogin(): void {
    console.log('Citizen login');
    // Navigate to citizen login page or open modal
  }

  private handleOfficerLogin(): void {
    console.log('Officer login');
    // Navigate to officer login page or open modal
  }

  private handleAdminLogin(): void {
    console.log('Admin login');
    // Navigate to admin login page or open modal
  }

  private handleCitizenRegister(): void {
    console.log('Citizen register');
    // Navigate to citizen registration page or open modal
  }

  private handleOfficerRegister(): void {
    console.log('Officer register');
    // Navigate to officer registration page or open modal
  }

  private handleLanguageChange(action: string): void {
    const language = action.split('-').pop();
    console.log('Language changed to:', language);
    
    // Update the language button label
    const langButton = this.dropdownButtons.find(btn => btn.ariaLabel === 'Language selector');
    if (langButton) {
      langButton.label = language?.toUpperCase() || 'EN';
    }
    
    // Implement language change logic (i18n service, etc.)
  }
}
