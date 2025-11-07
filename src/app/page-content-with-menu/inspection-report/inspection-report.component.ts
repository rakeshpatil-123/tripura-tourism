import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import SignaturePad from 'signature_pad';
import { firstValueFrom } from 'rxjs';
import { GenericService } from '../../_service/generic/generic.service';
import { CommonModule } from '@angular/common';

import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
const vfs = (pdfFonts as any).pdfMake?.vfs ?? (pdfFonts as any).vfs;
Object.assign(pdfMake as any, { vfs });

type FieldConfig = {
  key: string;
  label: string;
  show: boolean;
  fontSize?: number;
};

interface InspectionResponse {
  id?: number;
  user_name?: string;
  request_id?: string;
  inspection_type?: string;
  inspector?: string;
  department_name?: string;
  industry_name?: string;
  proposed_date?: string[] | string;
  reason?: any;
  remarks?: string;
  status?: string;
  updated_at?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  firstname?: string;
  lastname?: string;
  signature?: string;
  [key: string]: any;
}

@Component({
  selector: 'app-inspection-report',
  templateUrl: './inspection-report.component.html',
  styleUrls: ['./inspection-report.component.scss'],
  imports: [CommonModule, ReactiveFormsModule, FormsModule]
})
export class InspectionReportComponent implements OnInit {
  @ViewChild('sigCanvas', { static: true }) sigCanvas!: ElementRef<HTMLCanvasElement>;

  configForm: FormGroup;
  fieldsConfig: FieldConfig[] = [];
  signaturePad!: SignaturePad;

  docDefinitionPreview: any = null;

  // Example list of available fields (expandable)
  availableFields: FieldConfig[] = [
    { key: 'request_id', label: 'Request ID', show: true, fontSize: 12 },
    { key: 'updated_at', label: 'Date of Inspection', show: true, fontSize: 11 },
    { key: 'inspection_type', label: 'Inspection Type', show: true, fontSize: 11 },
    { key: 'industry_name', label: 'Industry Name', show: true, fontSize: 11 },
    { key: 'inspector_name', label: 'Inspector Name', show: true, fontSize: 11 },
    { key: 'date_time_of_inspection', label: 'Date & Time of Inspection', show: true, fontSize: 11 },
    { key: 'industry_name', label: 'Industry Name', show: true, fontSize: 11 },
    { key: 'inspector_designation', label: 'Inspector Designation', show: true, fontSize: 11 },
    { key: 'inspection_id', label: 'Inspection ID', show: true, fontSize: 11 },
    { key: 'unit_name', label: 'Unit Name', show: true, fontSize: 11 },
    { key: 'inspection_type', label: 'Inspection Type', show: true, fontSize: 11 },
    { key: 'name_of_owner', label: 'Owner Name', show: true, fontSize: 11 },
    { key: 'name_of_manager', label: 'Manager Name', show: true, fontSize: 11 },
    { key: 'lati_longi', label: 'Survey conducted at latitude and longitude', show: true, fontSize: 11 },
    { key: 'no_of_staffs', label: 'No. Field Staffs or works interacted', show: true, fontSize: 11 },
    { key: 'act', label: 'Inspection Conducted under Act', show: true, fontSize: 11 },
    { key: 'status', label: 'Status', show: true, fontSize: 11 },
    { key: 'address', label: 'Address', show: true, fontSize: 10 },
    { key: 'latitude', label: 'Latitude', show: false, fontSize: 10 },
    { key: 'longitude', label: 'Longitude', show: false, fontSize: 10 },
    { key: 'firstname', label: 'First name', show: true, fontSize: 11 },
    { key: 'lastname', label: 'Last name', show: true, fontSize: 11 },
    // add more fields as needed
  ];

  // dynamic tables array
  tables: FormArray<any> = new FormArray<any>([]);

  // signature data url
  signatureDataUrl: string | null = null;

  // designer settings defaults
  defaultSettings = {
    pageSize: 'A4',
    pageOrientation: 'portrait',
    marginTop: 40,
    marginBottom: 40,
    marginLeft: 40,
    marginRight: 40,
    fontFamily: 'Roboto',
    titleFontSize: 16,
    fieldLabelFontSize: 11,
    fieldValueFontSize: 11,
    lineHeight: 1.2,
    showBackground: false,
    backgroundColor: '#ffffff',
    headerText: 'Inspection Report',
    includeSignature: true
  };

  constructor(private fb: FormBuilder, private genericService: GenericService) {
    this.configForm = this.fb.group({
      settings: this.fb.group(this.defaultSettings),
      fieldsOrder: this.fb.control(this.availableFields.map(f => f.key)),
      fields: this.fb.group(this.generateFieldsGroup()),
      tables: this.tables
    });
  }

  ngOnInit(): void {
    // init fieldsConfig from availableFields
    this.fieldsConfig = [...this.availableFields];

    // init signature pad
    setTimeout(() => {
      this.signaturePad = new SignaturePad(this.sigCanvas.nativeElement, {
        backgroundColor: 'rgba(255,255,255,0)',
        penColor: 'black'
      });
      this.resizeCanvas();
    }, 0);

    // watch for changes to update preview document if you want
    this.configForm.valueChanges.subscribe(() => {
      // optional: update preview
      this.buildDocDefinition({}, false);
    });
  }

  private generateFieldsGroup() {
    const group: { [k: string]: FormControl } = {};
    for (const f of this.availableFields) {
      group[f.key] = new FormControl(f.show);
    }
    return group;
  }

  // --- Signature controls ---
  clearSignature() {
    this.signaturePad.clear();
    this.signatureDataUrl = null;
  }

  saveSignature() {
    if (this.signaturePad.isEmpty()) {
      alert('Please sign first.');
      return;
    }
    this.signatureDataUrl = this.signaturePad.toDataURL('image/png');
    // you can also store to server or embed directly in PDF
  }

  private resizeCanvas() {
    const canvas = this.sigCanvas.nativeElement;
    const ratio = Math.max(window.devicePixelRatio || 1, 1);
    canvas.width = canvas.offsetWidth * ratio;
    canvas.height = canvas.offsetHeight * ratio;
    canvas.getContext('2d')!.scale(ratio, ratio);
    this.signaturePad.clear(); // otherwise old content is scaled
  }

  // Call your API then generate pdf
  async generatePdfFromApi(id: string | number) {
    try {
      // use firstValueFrom to convert observable to promise-safe value
      const data = await firstValueFrom(this.genericService.getInspection(id));
      this.generatePdf(data as InspectionResponse);
    } catch (err) {
      console.error(err);
      alert('Error fetching inspection data: ' + err);
    }
  }

  // Build docDefinition based on settings and data
  buildDocDefinition(data: InspectionResponse = {} as any, forDownload = true) {
    const settings = this.configForm.get('settings')!.value;
    const fieldsGroup = this.configForm.get('fields')!.value;
    const order: string[] = this.configForm.get('fieldsOrder')!.value;

    const content: any[] = [];

    // header
    const header = {
      columns: [
        { text: settings.headerText || 'Inspection Report', style: 'header', alignment: 'left' },
        {
          text: `Generated: ${new Date().toLocaleString()}`,
          alignment: 'right',
          fontSize: 8
        }
      ],
      margin: [0, 0, 0, 10]
    };
    content.push(header);

    // iterate fields in order
    const fieldRows: any[] = [];
    for (const key of order) {
      if (!fieldsGroup[key]) continue; // skip if hidden
      const fieldMeta = this.availableFields.find(f => f.key === key);
      if (!fieldMeta) continue;
      const value = this.resolveValue(data, key);
      fieldRows.push({
        columns: [
          { text: fieldMeta.label + ':', width: '30%', bold: true, fontSize: settings.fieldLabelFontSize },
          { text: value ?? '-', width: '70%', fontSize: settings.fieldValueFontSize }
        ],
        margin: [0, 3, 0, 3]
      });
    }
    content.push(...fieldRows);

    // dynamic tables
    // We store tables in the form group as objects: { title, columns: string[], rows: any[][] }
  const tablesValue: any[] = (this.tables && this.tables.value) ? (this.tables.value as any[]) : [];
    for (const t of tablesValue) {
      if (!t) continue;
      const columns: string[] = Array.isArray(t.columns) ? t.columns : [];
      const rows: any[] = Array.isArray(t.rows) ? t.rows : [];

      // build body: header row then data rows
      const body: any[] = [];
      if (columns.length) {
        body.push(columns);
      }
      for (const r of rows) {
        // ensure each row is an array and has same number of cols as header (best-effort)
        if (Array.isArray(r)) {
          body.push(r);
        }
      }

      if (body.length === 0) continue; // nothing to show

      // optional title
      content.push({ text: t.title || 'Table', style: 'tableTitle', margin: [0, 10, 0, 6] });

      content.push({
        table: {
          headerRows: 1,
          widths: columns.length ? columns.map(() => '*') : ['*'],
          body
        },
        layout: {
          fillColor: function (rowIndex: number) {
            return rowIndex === 0 ? '#eeeeee' : null;
          }
        }
      });
    }

    if (settings.includeSignature) {
      content.push({ text: 'Signature:', margin: [0, 10, 0, 5], bold: true });
      if (this.signatureDataUrl) {
        content.push({ image: this.signatureDataUrl, width: 200, height: 80, margin: [0, 0, 0, 0] });
      } else if ((data as any).signature) {
        content.push({ image: (data as any).signature, width: 200, height: 80 });
      } else {
        content.push({ text: 'No signature provided', italics: true });
      }
    }

    const docDefinition: any = {
      pageSize: settings.pageSize,
      pageOrientation: settings.pageOrientation,
      pageMargins: [settings.marginLeft, settings.marginTop, settings.marginRight, settings.marginBottom],
      defaultStyle: {
        font: settings.fontFamily || 'Roboto',
        fontSize: settings.fieldValueFontSize,
        lineHeight: settings.lineHeight
      },
      content,
      styles: {
        header: { fontSize: settings.titleFontSize, bold: true },
        tableTitle: { fontSize: settings.fieldLabelFontSize, bold: true }
      }
    };

    if (settings.showBackground) {
      docDefinition.background = (currentPage: number, pageSize: any) => {
        return {
          canvas: [
            {
              type: 'rect',
              x: 0,
              y: 0,
              w: pageSize.width,
              h: pageSize.height,
              color: settings.backgroundColor || '#ffffff'
            }
          ]
        };
      };
    }

    if (forDownload) {
      return docDefinition;
    } else {
      this.docDefinitionPreview = docDefinition;
      return docDefinition;
    }
  }
  generatePdf(data: InspectionResponse) {
    const docDefinition = this.buildDocDefinition(data, true);
    (pdfMake as any).createPdf(docDefinition).open();
  }

  private resolveValue(data: any, key: string) {
    if (!data) return null;
    if (key === 'updated_at' && data.updated_at) {
      return new Date(data.updated_at).toLocaleString();
    }
    if (key === 'proposed_date' && data.proposed_date) {
      if (Array.isArray(data.proposed_date)) return (data.proposed_date as string[]).join(', ');
      return data.proposed_date;
    }
    if (key === 'latitude' || key === 'longitude') {
      return data[key] ?? '-';
    }
    return data[key] ?? '-';
  }
  addTable() {
    const tableGroup = this.fb.group({
      title: ['New Table'],
      columns: [['Col A', 'Col B']],
      rows: [[['A1', 'B1'], ['A2', 'B2']]]
    });
    this.tables.push(tableGroup);
  }

  removeTable(index: number) {
    this.tables.removeAt(index);
  }

  addEmptyTable() {
    this.tables.push(
      this.fb.group({
        title: ['Table Title'],
        columns: [['Column 1', 'Column 2', 'Column 3']],
        rows: [[['r1c1', 'r1c2', 'r1c3']]]
      })
    );
  }

  downloadPreviewPdf() {
    const mockData: InspectionResponse = {
      id: 24,
      user_name: 'inspector',
      request_id: 'REQ-06-000024',
      inspection_type: 'surprise',
      inspector: 'inspector',
      department_name: 'Directorate of Labour',
      industry_name: 'inspector',
      proposed_date: ['2025-10-23', '2025-11-23', '2025-11-11'],
      reason: null,
      remarks: 'ewRKE',
      status: 'approved',
      updated_at: '2025-11-03T06:50:39.000000Z',
      address: '123 Main Road, Mohgaon',
      latitude: 12.9716,
      longitude: 77.5946,
      firstname: 'Rakesh',
      lastname: 'Patil'
    };
    const dd = this.buildDocDefinition(mockData, true);
    (pdfMake as any).createPdf(dd).download(`inspection_${mockData.request_id || Date.now()}.pdf`);
  }
}
