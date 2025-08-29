import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';

interface Resource {
  title: string;
  description: string;
  link: string;
}
@Component({
  selector: 'app-new-one-stop-information-hub',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './new-one-stop-information-hub.component.html',
  styleUrls: ['./new-one-stop-information-hub.component.scss']
})
export class NewOneStopInformationHubComponent implements OnInit {
  searchQuery: string = '';
  resources: { [key: string]: Resource[] } = {
    Policies: [
      { title: 'Data Privacy Policy', description: 'Guidelines for handling personal data.', link: 'https://example.com/data-privacy' },
      { title: 'Employee Conduct Policy', description: 'Rules for workplace behavior.', link: 'https://example.com/conduct' }
    ],
    Incentives: [
      { title: 'Employee Bonus Program', description: 'Details on performance-based bonuses.', link: 'https://example.com/bonus' },
      { title: 'Tax Incentives', description: 'Tax benefits for employees.', link: 'https://example.com/tax-incentives' }
    ],
    Guidelines: [
      { title: 'Remote Work Guidelines', description: 'Best practices for remote work.', link: 'https://example.com/remote-work' },
      { title: 'Safety Guidelines', description: 'Workplace safety protocols.', link: 'https://example.com/safety' }
    ]
  };
  filteredResources: { [key: string]: Resource[] } = {};

  ngOnInit(): void {
    this.filteredResources = { ...this.resources };
  }

  filterResources(): void {
    if (!this.searchQuery.trim()) {
      this.filteredResources = { ...this.resources };
      return;
    }

    const query = this.searchQuery.toLowerCase();
    this.filteredResources = {};

    for (const category in this.resources) {
      const filtered = this.resources[category].filter(resource =>
        resource.title.toLowerCase().includes(query) ||
        resource.description.toLowerCase().includes(query)
      );
      if (filtered.length > 0) {
        this.filteredResources[category] = filtered;
      }
    }
  }

  clearSearch(): void {
    this.searchQuery = '';
    this.filteredResources = { ...this.resources };
  }

  isEmpty(obj: { [key: string]: any }): boolean {
    return Object.keys(obj).length === 0;
  }
}