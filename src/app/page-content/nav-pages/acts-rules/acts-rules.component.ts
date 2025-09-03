import { Component, ViewEncapsulation, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Document {
  id: string;
  title: string;
  icon: string;
  badge: string;
  badgeClass: 'blue' | 'orange' | 'green' | 'red' | 'pink';
  url: string;
}

@Component({
  selector: 'app-acts-rules',
  templateUrl: './acts-rules.component.html',
  styleUrls: ['./acts-rules.component.scss'],
  standalone: true,
  imports: [CommonModule],
  encapsulation: ViewEncapsulation.None
})
export class ActsRulesComponent implements OnDestroy {
  
  swaagatDocuments: Document[] = [
    {
      id: 'tripura-act-2018',
      title: 'The Tripura Industries (Facilitation) Act, 2018',
      icon: 'fas fa-file-alt',
      badge: 'Act',
      badgeClass: 'blue',
      url: 'https://swaagat.tripura.gov.in/assets/documents/The_Tripura_Industries_Facilitation_Act.pdf'
    },
    {
      id: 'tripura-rules-2020',
      title: 'Tripura Industries (Facilitation) Rules, 2020',
      icon: 'fas fa-file-alt',
      badge: 'Rules',
      badgeClass: 'green',
      url: 'https://swaagat.tripura.gov.in/assets/documents/SWAAGAT_Rule_e_Gazette_notification.pdf'
    },
    {
      id: 'tripura-amendment-2020',
      title: 'The Tripura Industries (Facilitation) (Amendment) Act, 2020',
      icon: 'fas fa-file-alt',
      badge: 'Amendment',
      badgeClass: 'red',
      url: 'https://swaagat.tripura.gov.in/assets/documents/Tripura%20Industries%20Faciltation%20(Amendment)%20Act.pdf'
    },
    {
      id: 'tripura-amendment-rules-2020',
      title: 'The Tripura Industries (Facilitation) (Amendment) Rules, 2020',
      icon: 'fas fa-file-alt',
      badge: 'Amendment Rules',
      badgeClass: 'orange',
      url: 'https://swaagat.tripura.gov.in/assets/documents/The%20Tripura%20Industries%20(Facilitation)%20(Amendment)%20Rules,%202020.pdf'
    },
    {
      id: 'timelines-services',
      title: 'Timelines of Services',
      icon: 'fas fa-clock',
      badge: 'Guidelines',
      badgeClass: 'pink',
      url: 'https://swaagat.tripura.gov.in/assets/documents/Timelines%20of%20services.pdf'
    }
  ];

  policyDocuments: Document[] = [
    {
      id: 'industrial-policy',
      title: 'Industrial Policy and Schemes',
      icon: 'fas fa-book',
      badge: 'Policy',
      badgeClass: 'orange',
      url: 'https://industries.tripura.gov.in/tripura-industrial-policy/'
    },
    {
      id: 'tiips-amendment',
      title: 'TIIPS 2017 Amendment',
      icon: 'fas fa-book',
      badge: 'Amendment',
      badgeClass: 'red',
      url: 'https://swaagat.tripura.gov.in/assets/documents/TIIPS-2017-Amendment.pdf'
    },
    {
      id: 'tiipis-2022',
      title: 'Tripura Industrial Investment Promotion Incentive Scheme (TIIPIS), 2022',
      icon: 'fas fa-book',
      badge: 'New Scheme',
      badgeClass: 'blue',
      url: 'https://swaagat.tripura.gov.in/assets/documents/TIIPS%20-2022.pdf'
    },
    {
      id: 'neids-2017',
      title: 'North East Industrial Development Scheme NEIDS 2017',
      icon: 'fas fa-book',
      badge: 'Scheme',
      badgeClass: 'green',
      url: 'https://swaagat.tripura.gov.in/assets/documents/North-East-Industrial-Development-Scheme-NEIDS-2017.pdf'
    },
    {
      id: 'udyam-registration',
      title: 'Udyam Registration',
      icon: 'fas fa-pen',
      badge: 'Registration',
      badgeClass: 'pink',
      url: 'https://swaagat.tripura.gov.in/assets/documents/Udyam_Registration_Booklet.pdf'
    },
    {
      id: 'allotment-policy',
      title: 'Allotment Policy',
      icon: 'fas fa-book',
      badge: 'Policy',
      badgeClass: 'orange',
      url: 'https://swaagat.tripura.gov.in/assets/documents/Allotment_Policy.pdf'
    }
  ];

  rtiDocuments: Document[] = [
    {
      id: 'rti-act',
      title: 'Right to Information Act',
      icon: 'fas fa-file-alt',
      badge: 'Act',
      badgeClass: 'blue',
      url: 'https://swaagat.tripura.gov.in/assets/documents/Tripura_RTI_Rules_2008.pdf'
    }
  ];

  showNoResults = false;
  private debounceTimer: any;

  /**
   * Opens a document in a new tab
   * @param docId - The ID of the document to open
   */
  openDocument(docId: string): void {
    const allDocuments = [...this.swaagatDocuments, ...this.policyDocuments, ...this.rtiDocuments];
    const doc = allDocuments.find(d => d.id === docId);
    
    if (doc?.url) {
      try {
        window.open(doc.url, '_blank', 'noopener,noreferrer');
      } catch (error) {
        console.error('Error opening document:', error);
        this.showErrorMessage('Unable to open document. Please try again.');
      }
    } else {
      console.error('Document not found: ' + docId);
      this.showErrorMessage('Document not available. Please try again later.');
    }
  }

  /**
   * Handles keyboard navigation for document cards
   * @param event - The keyboard event
   * @param docId - The ID of the document
   */
  handleKeyPress(event: KeyboardEvent, docId: string): void {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.openDocument(docId);
    }
  }

  /**
   * Handles search functionality with debouncing
   * @param event - The input event from the search box
   */
  onSearch(event: Event): void {
    // Clear existing timer
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }

    const searchTerm = (event.target as HTMLInputElement)?.value?.toLowerCase().trim() || '';
    
    // Debounce search for better performance
    this.debounceTimer = setTimeout(() => {
      this.performSearch(searchTerm);
    }, 300);
  }

  /**
   * Performs the actual search operation
   * @param searchTerm - The term to search for
   */
  private performSearch(searchTerm: string): void {
    const allDocumentElements = document.querySelectorAll('.document-card');
    let visibleCount = 0;

    allDocumentElements.forEach(card => {
      const titleElement = card.querySelector('.document-title');
      const metaElement = card.querySelector('.document-meta');
      
      const title = titleElement?.textContent?.toLowerCase() || '';
      const meta = metaElement?.textContent?.toLowerCase() || '';
      
      const isVisible = !searchTerm || title.includes(searchTerm) || meta.includes(searchTerm);
      
      if (isVisible) {
        (card as HTMLElement).style.display = 'flex';
        visibleCount++;
      } else {
        (card as HTMLElement).style.display = 'none';
      }
    });

    // Show/hide no results message
    this.showNoResults = visibleCount === 0 && searchTerm !== '';
  }

  /**
   * Shows an error message to the user
   * @param message - The error message to display
   */
  private showErrorMessage(message: string): void {
    // You can replace this with a proper toast/notification service
    alert(message);
  }

  /**
   * Cleanup on component destruction
   */
  ngOnDestroy(): void {
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }
  }

  /**
   * Get all documents (utility method)
   * @returns Array of all documents
   */
  getAllDocuments(): Document[] {
    return [...this.swaagatDocuments, ...this.policyDocuments, ...this.rtiDocuments];
  }

  /**
   * Get documents by category
   * @param category - The category to filter by
   * @returns Array of documents in the specified category
   */
  getDocumentsByCategory(category: 'swaagat' | 'policies' | 'rti'): Document[] {
    switch (category) {
      case 'swaagat':
        return this.swaagatDocuments;
      case 'policies':
        return this.policyDocuments;
      case 'rti':
        return this.rtiDocuments;
      default:
        return [];
    }
  }
}