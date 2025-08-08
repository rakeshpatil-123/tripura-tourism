import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

interface ClarificationItem {
  applicationId: string;
  department: string;
  noc: string;
  clarification: string;
  isDocumentMissing: boolean;
}

@Component({
  selector: 'app-clarification-required-table',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './certification-required-table.component.html',
  styleUrls: ['./certification-required-table.component.scss'],
})
export class ClarificationRequiredTableComponent {
  @Input() title: string = 'Clarification Required';
  @Input() data: ClarificationItem[] = [
    {
      applicationId: 'CFO-SA-000111',
      department: 'Electrical Inspectorate',
      noc: 'Application for NOC from Electrical Inspectorate',
      clarification: '',
      isDocumentMissing: true,
    },
    {
      applicationId: 'PFR-94-000187',
      department: 'Partnership Firm Registration (L & C)',
      noc: 'Application for Partnership Firm Registration',
      clarification:
        'Kindly upload all the documents properly as mentioned in the portal.',
      isDocumentMissing: false,
    },
  ];
}
