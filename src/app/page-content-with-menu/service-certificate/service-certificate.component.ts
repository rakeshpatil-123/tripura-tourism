import { Component, OnInit, ViewChild, ViewEncapsulation, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CKEditorModule, CKEditorComponent, ChangeEvent } from '@ckeditor/ckeditor5-angular';
import * as ClassicEditorBuild from '@ckeditor/ckeditor5-build-classic';
const ClassicEditor: any = (ClassicEditorBuild as any).default || ClassicEditorBuild;

import { ButtonModule } from 'primeng/button';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import Swal from 'sweetalert2';
import jsPDF from 'jspdf';
import { GenericService } from '../../_service/generic/generic.service';

@Component({
  selector: 'app-service-certificate',
  standalone: true,
  imports: [CommonModule, FormsModule, CKEditorModule, ButtonModule],
  templateUrl: './service-certificate.component.html',
  styleUrls: ['./service-certificate.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ServiceCertificateComponent implements OnInit {
  @ViewChild('editor') ckEditorComponent!: CKEditorComponent;

  public Editor = ClassicEditor;
  public editorInstance: any;
  public config: any = {
    licenseKey: 'GPL',
    toolbar: {
      items: [
        'heading', '|',
        'fontfamily', 'fontsize', 'fontColor', 'fontBackgroundColor', '|',
        'bold', 'italic', 'underline', 'strikethrough', 'subscript', 'superscript', '|',
        'alignment', 'outdent', 'indent', '|',
        'link', 'insertTable', 'blockQuote', 'mediaEmbed', '|',
        'undo', 'redo'
      ],
      shouldNotGroupWhenFull: true
    },
    heading: {
      options: [
        { model: 'paragraph', title: 'Paragraph', class: 'ck-heading_paragraph' },
        { model: 'heading1', view: 'h1', title: 'Heading 1', class: 'ck-heading_heading1' },
        { model: 'heading2', view: 'h2', title: 'Heading 2', class: 'ck-heading_heading2' },
        { model: 'heading3', view: 'h3', title: 'Heading 3', class: 'ck-heading_heading3' },
        { model: 'heading4', view: 'h4', title: 'Heading 4', class: 'ck-heading_heading4' },
        { model: 'heading5', view: 'h5', title: 'Heading 5', class: 'ck-heading_heading5' },
        { model: 'heading6', view: 'h6', title: 'Heading 6', class: 'ck-heading_heading6' }
      ]
    },
    fontFamily: {
      options: [
        'default',
        'Arial, Helvetica, sans-serif',
        'Courier New, Courier, monospace',
        'Georgia, serif',
        'Lucida Sans Unicode, Lucida Grande, sans-serif',
        'Tahoma, Geneva, sans-serif',
        'Times New Roman, Times, serif',
        'Trebuchet MS, Helvetica, sans-serif',
        'Verdana, Geneva, sans-serif'
      ]
    },
    fontSize: {
      options: [8, 10, 12, 14, 16, 18, 20, 24, 32, 48],
      supportAllValues: true
    },
    alignment: {
      options: ['left', 'center', 'right', 'justify']
    },
    table: {
      contentToolbar: [
        'tableColumn', 'tableRow', 'mergeTableCells',
        'tableProperties', 'tableCellProperties'
      ]
    },
    mediaEmbed: {
      previewsInData: true
    },
    placeholder: 'Type your certificate content here...'
  };

  serviceId!: number;
  serviceName = 'Service';
  formTemplate = ``;

  constructor(
    private genericService: GenericService,
    private dialogRef: MatDialogRef<ServiceCertificateComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }

  ngOnInit(): void {
    if (this.data) {
      this.serviceId = Number(this.data.service?.id || this.data.id || this.data.service_id);
      this.serviceName = this.data.service?.name || this.data.name || 'Unknown Service';
      if (this.serviceId) {
        this.loadTemplate(this.serviceId);
      }
    }
  }

  private loadTemplate(serviceId: number): void {
    this.genericService.getServiceCertificateView(serviceId).subscribe({
      next: (res: any) => {
        this.formTemplate = res?.status === 1 ? res.data?.form_template || '' : '';
      },
      error: (err: any) => {
        console.error('Load template error', err);
      }
    });
  }

  onReady(editor: any): void {
    this.editorInstance = editor;
    try {
      editor.editing.view.change((writer: any) => {
        writer.setStyle('min-height', '300px', editor.editing.view.document.getRoot());
      });
    } catch (e) {
    }
  }

  onChange({ editor }: ChangeEvent): void {
    this.formTemplate = editor.getData();
  }

  saveTemplate(): void {
    const payload = { service_id: this.serviceId, form_template: this.formTemplate };
    this.genericService.generateServiceCertificateGenerate(payload).subscribe({
      next: (res: any) => {
        if (res?.status === 1) {
          Swal.fire('Saved', 'Template saved successfully', 'success');
          this.closeDialog();
        } else {
          Swal.fire('Error', 'Save failed', 'error');
        }
      },
      error: (err: any) => {
        console.error('Save error', err);
        Swal.fire('Error', 'Unexpected error occurred while saving', 'error');
      }
    });
  }

  previewTemplate(): void {
    const previewWindow = window.open('', '_blank', 'width=900,height=700');
    if (previewWindow) {
      previewWindow.document.open();
      previewWindow.document.write(`
      <html>
        <head>
          <title>Preview - ${this.serviceName}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            .ck-content table { width:100%; border-collapse: collapse; }
            .ck-content table, .ck-content th, .ck-content td { border: 1px solid #ccc; padding: 6px; }
          </style>
        </head>
        <body class="ck-content">${this.formTemplate}</body>
      </html>
    `);
      previewWindow.document.close();
    }
  }

  downloadTemplate(): void {
    const doc = new jsPDF('p', 'pt', 'a4');
    doc.html(this.formTemplate, {
      callback: (pdf) => pdf.save(`${this.serviceName || 'template'}.pdf`),
      margin: [20, 20, 20, 20],
      x: 10,
      y: 10,
      width: 570
    });
  }

  closeDialog(): void {
    this.dialogRef.close();
  }
}
