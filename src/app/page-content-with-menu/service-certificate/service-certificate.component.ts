import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EditorModule } from 'primeng/editor';
import { ButtonModule } from 'primeng/button';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { GenericService } from '../../_service/generic/generic.service';
import jsPDF from 'jspdf';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-service-certificate',
  standalone: true,
  imports: [CommonModule, FormsModule, EditorModule, ButtonModule],
  templateUrl: './service-certificate.component.html',
  styleUrls: ['./service-certificate.component.scss']
})
export class ServiceCertificateComponent implements OnInit {
  serviceId!: number;
  serviceName: string = '';
  formTemplate: string = '';

  editorModules: any = {
    toolbar: [
      [{ font: [] }, { size: [] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ color: [] }, { background: [] }],
      [{ script: 'sub' }, { script: 'super' }],
      [{ header: [1, 2, 3, 4, 5, 6, false] }],
      [{ align: [] }],
      [{ list: 'ordered' }, { list: 'bullet' }],
      ['blockquote', 'code-block'],
      ['link', 'image', 'video'],
      ['clean']
    ]
  };

  constructor(
    private genericService: GenericService,
    private dialogRef: MatDialogRef<ServiceCertificateComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }

  ngOnInit(): void {
    if (this.data) {
      this.serviceId = Number(this.data.service?.id || this.data.id || this.data.service_id);
      this.serviceName = this.data.service?.name || this.data.name || 'Unknown Service';
      if (this.serviceId) this.loadTemplate(this.serviceId);
    }
  }

  private loadTemplate(serviceId: number): void {
    this.genericService.getServiceCertificateView(serviceId).subscribe({
      next: (res) => {
        this.formTemplate = res?.status === 1 ? res.data?.form_template || '' : '';
      },
      error: (err) => {
        this.formTemplate = '<p>Error loading template</p>';
      }
    });
  }

  saveTemplate(): void {
    const payload = {
      service_id: this.serviceId,
      form_template: this.formTemplate
    };

    this.genericService.generateServiceCertificateGenerate(payload).subscribe({
      next: (res) => {
        this.closeDialog();
        if (res.status === 1) {
        Swal.fire({
          icon: 'success',
          title: `Template ${this.data.mode === 'add' ? 'Saved!' : 'Updated'}`,
          text: `The ${this.data.service.service_title_or_description} service certificate template has been ${this.data.mode === 'add' ? 'saved' : 'updated'} successfully.`,
          showConfirmButton: true,
          confirmButtonText: 'OK',
          timer: 2500,
          timerProgressBar: true,
          backdrop: true,
          toast: false,
          position: 'center'
        });
      } else {
      error: () => {
        Swal.fire({
          icon: 'error',
          title: 'Save Failed!',
          text: `There was an error ${this.data.mode === 'add' ? 'saving' : 'updating'} the template. Please try again.`,
          showConfirmButton: true,
          confirmButtonText: 'Retry',
          backdrop: true,
          toast: false,
          position: 'center'
        });
      }
        }
      }
    });
  }


  previewTemplate(): void {
    // const previewWindow = window.open('', '_blank', 'width=900,height=700');
    const previewWindow = window.open('', '_blank');
    if (previewWindow) {
      previewWindow.document.open();
      previewWindow.document.write(`
      <html>
        <head>
          <title>Preview - ${this.serviceName}</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              padding: 20px;
            }
            .ql-align-center {  
              text-align: center;
            }
            .ql-align-right {
              text-align: right;
            }
            .ql-align-justify {
              text-align: justify;
            }
            img {
              max-width: 100%;
              height: auto;
            }
          </style>
        </head>
        <body>
          ${this.formTemplate}
        </body>
      </html>
    `);
      previewWindow.document.close();
    }
  }


  /**
   * Uncomment this if you want PDF preview instead
   */
  // previewTemplate(): void {
  //   const doc = new jsPDF('p', 'pt', 'a4');
  //   doc.html(this.formTemplate, {
  //     callback: (pdf) => {
  //       pdf.output('dataurlnewwindow'); // open preview in new tab as PDF
  //     },
  //     margin: [40, 40, 40, 40],
  //     autoPaging: 'text',
  //     x: 10,
  //     y: 10
  //   });
  // }

  downloadTemplate(): void {
    const doc = new jsPDF('p', 'pt', 'a4');
    doc.html(this.formTemplate, {
      callback: (pdf) => {
        pdf.save(`${this.serviceName || 'template'}.pdf`);
      },
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
