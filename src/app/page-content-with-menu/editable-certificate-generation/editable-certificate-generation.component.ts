import { Component, OnInit, Inject, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, FormControl } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import Swal from 'sweetalert2';
import { GenericService } from '../../_service/generic/generic.service';
import { HttpErrorResponse } from '@angular/common/http';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatInputModule } from "@angular/material/input";
import { DatePickerModule } from 'primeng/datepicker';
import { IlogiInputDateComponent } from '../../customInputComponents/ilogi-input-date/ilogi-input-date.component';
@Component({
  selector: 'app-editable-certificate-generation',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, ButtonModule, MatDatepickerModule, MatInputModule, DatePickerModule, IlogiInputDateComponent],
  templateUrl: './editable-certificate-generation.component.html',
  styleUrls: ['./editable-certificate-generation.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class EditableCertificateGenerationComponent implements OnInit {

  form!: FormGroup;
  loadingVariables = false;
  loadingApplication = false;
  generating = false;
  variableList: Array<{ key: string; label: string }> = [];
  applicationData: any = null;
  selectedAppId: any = null;
  livePreviewHtml = '';

  constructor(
    private fb: FormBuilder,
    private genericService: GenericService,
    private dialogRef: MatDialogRef<EditableCertificateGenerationComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.form = this.fb.group({});
  }

  ngOnInit(): void {
    this.applicationData = this.data;
    if (this.data?.application_id) {
      this.selectedAppId = this.data.application_id;
      this.loadApplicationData(this.selectedAppId);
    } else {
      this.initEmptyForm();
    }
    this.loadVariables();
  }

  private initEmptyForm(): void {
    this.form = this.fb.group({});
    this.livePreviewHtml = '';
  }

  private loadVariables(): void {
    this.loadingVariables = true;
    this.genericService.getCertificateGenerationVariables().subscribe({
      next: (res: any) => {
        let rawVars: any[] = [];
        if (Array.isArray(res?.data)) rawVars = res.data;
        else if (Array.isArray(res)) rawVars = res;
        else if (res?.data?.variables) rawVars = res.data.variables;
        else rawVars = [];
        this.variableList = rawVars.map((v: any) => {
          const key = typeof v === 'string' ? v : (v.key || v.name || v.variable || '');
          const label = this.formatLabel(key);
          return { key, label };
        });
        this.buildFormFromVariables();
      },
      error: (err: HttpErrorResponse) => {
        console.error('Failed to load variables', err);
        Swal.fire('Error', 'Failed to load certificate variables', 'error');
      },
      complete: () => (this.loadingVariables = false)
    });
  }
  private formatToDDMMYYYY(date: any): string {
    if (!date) return '';

    const d = new Date(date);
    if (isNaN(d.getTime())) return '';

    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();

    return `${day}-${month}-${year}`;
  }

  private buildFormFromVariables(): void {
    if (!this.form) this.form = this.fb.group({});
    this.variableList.forEach(v => {
      if (!this.form.contains(v.key)) {
        const initial = this.applicationData?.[v.key] ?? '';
        if (v.key === 'add_watermark') {
          const val = initial?.toString().toLowerCase();
          this.form.addControl(v.key, new FormControl(val === 'yes' ? 'yes' : 'no'));
          return;
        }
        this.form.addControl(v.key, new FormControl(initial));
      }
    });
    if (this.applicationData && typeof this.applicationData === 'object') {
      Object.keys(this.applicationData).forEach(k => {
        if (!this.form.contains(k)) {
          this.form.addControl(k, new FormControl(this.applicationData[k]));
        }
      });
    }
    this.updateLivePreview();
  }
  private loadPrefillData(appId: any): void {
    if (!appId) {
      Swal.fire('Info', 'Please enter/select an application id first', 'info');
      return;
    }

    this.loadingApplication = true;
    const payload = { application_id: appId };

    this.genericService.getByConditions(payload, 'api/department/user-certificate-view').subscribe({
      next: (res: any) => {
        if (res?.status === 1 && res.data) {
          this.applicationData = res.data;
          if (this.applicationData.qr_code && typeof this.applicationData.qr_code === 'string' && this.applicationData.qr_code.startsWith('data:image')) {
          }

          Swal.fire('Loaded', 'Certificate prefill data fetched successfully.', 'success');
          this.buildFormFromVariables();
          this.prefillFormWithData();
        } else {
          Swal.fire('Error', res?.message || 'Failed to fetch certificate data', 'error');
        }
      },
      error: (err: HttpErrorResponse) => {
        this.dialogRef.close();
        Swal.fire('Error', 'Could not fetch application data', 'error');
      },
      complete: () => (this.loadingApplication = false)
    });
  }

  loadApplicationData(appId: any): void {
    this.loadPrefillData(appId);
  }

  private prefillFormWithData(): void {
    if (!this.form || !this.applicationData) return;

    Object.keys(this.applicationData).forEach(key => {
      if (this.form.contains(key)) {
        const value = this.applicationData[key];
        this.form.get(key)!.setValue(value);
      } else {
        this.form.addControl(key, new FormControl(this.applicationData[key]));
      }
    });

    this.updateLivePreview();
  }

  buildRenderedHtml(): string {
    const values = this.form.value || {};
    let html = `
      <html>
        <head>
          <meta charset="utf-8" />
          <title>Certificate Preview</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 36px; background: #f6f7fb; }
            .certificate { max-width: 900px; margin: 0 auto; background: white; padding: 30px; border-radius: 8px; box-shadow: 0 6px 18px rgba(0,0,0,0.08); }
            h1 { text-align: center; margin-bottom: 8px; font-size: 28px; }
            .meta { text-align:center; color:#666; margin-bottom: 20px; }
            .row { display:flex; gap:10px; margin-bottom:8px; }
            .label { width:180px; font-weight:600; color:#333; }
            .value { flex:1; color:#222; }
            .img { max-width:160px; max-height:160px; display:block; }
            table { width:100%; border-collapse: collapse; margin-top: 12px; }
            td, th { padding:8px; border:1px solid #eee; text-align:left; }
          </style>
        </head>
        <body>
          <div class="certificate">
            <div>
    `;

    const keys = Object.keys(values);
    if (keys.length === 0) {
      html += `<p>No data available to preview.</p>`;
    } else {
      html += `<table><tbody>`;
      keys.forEach(k => {
        const rawVal = values[k];
        let display = '';
        if (typeof rawVal === 'string' && rawVal.startsWith('data:image')) {
          display = `<img src="${this.escapeHtml(rawVal)}" class="img" alt="${this.escapeHtml(k)}" />`;
        } else {
          display = this.escapeHtml(String(rawVal ?? ''));
        }

        html += `<tr><th style="width:220px;text-align:left;">${this.escapeHtml(this.formatLabel(k))}</th><td>${display}</td></tr>`;
      });
      html += `</tbody></table>`;
    }

    html += `
            </div>
          </div>
        </body>
      </html>
    `;
    return html;
  }
  updateLivePreview(): void {
    try {
      this.livePreviewHtml = this.buildRenderedHtml();
    } catch (e) {
      this.livePreviewHtml = '<div>Preview unavailable</div>';
    }
  }

  previewTemplate(): void {
    const html = this.buildRenderedHtml();
    if (!html || html.trim() === '') {
      Swal.fire('Error', 'No data to preview', 'error');
      return;
    }
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const newTab = window.open(url, '_blank');
    if (!newTab) {
      Swal.fire('Error', 'Unable to open preview tab (popup blocked?)', 'error');
    }
  }

  generateCertificate(): void {
    if (!this.selectedAppId && !this.form.get('application_id')) {
      Swal.fire('Info', 'Please enter/select Application ID before generating', 'info');
      return;
    }

    this.generating = true;
    const payload: any = { application_id: this.selectedAppId || this.form.value.application_id || null, ...this.form.value };
    if (payload.add_watermark) {
      payload.add_watermark = payload.add_watermark === 'yes' ? 'yes' : 'no';
    }
    if (payload.valid_upto) {
      payload.valid_upto = this.formatToDDMMYYYY(payload.valid_upto);
    }
    this.genericService.generateCertificate(payload).subscribe({
      next: (res: any) => {
        this.generating = false;
        this.dialogRef.close('generated');
        setTimeout(() => {
          if (!res) {
            Swal.fire('Error', 'No response received from server.', 'error');
            return;
          }
          if (res.status === 0) {
            Swal.fire('Error', res.message || 'Certificate generation failed.', 'error');
            return;
          }
          if (res.status === 1) {
            const message = res.message || 'Certificate generated successfully.';
            let htmlContent = `<p>${this.escapeHtml(message)}</p>`;
            const certificateUrl = res?.data?.application?.NOC_certificate || res?.data?.certificate_url || null;
            if (certificateUrl) {
              htmlContent += `<p><a href="${certificateUrl}" target="_blank" style="color:#2563eb; text-decoration:underline;">Open Generated Certificate</a></p>`;
            }
            Swal.fire({ title: 'Success', html: htmlContent, icon: 'success', confirmButtonText: 'OK' });
            return;
          }
          Swal.fire('Error', 'Unexpected response from server.', 'error');
        }, 250);
      },
      error: (err: HttpErrorResponse) => {
        console.error('Generation error:', err);
        this.generating = false;
        this.dialogRef.close();
        setTimeout(() => {
          Swal.fire('Error', 'An error occurred while generating the certificate.', 'error');
        }, 250);
      }
    });
  }

  inputTypeForKey(key: string): string {
    if (!key) return 'text';
    const k = key.toLowerCase();
    if (k === 'add_watermark') return 'dropdown';
    if (k.includes('date') || k.includes('dob') || k.includes('issued_on') || k.includes('valid_from') || k.includes('valid_upto')) return 'date';
    if (k.includes('email')) return 'email';
    if (k.includes('phone') || k.includes('mobile') || k.includes('contact')) return 'tel';
    if (k.includes('amount') || k.includes('fee') || k.includes('number') || k.includes('no') || k.endsWith('_id')) return 'number';
    if (k.includes('notes') || k.includes('remark') || k.includes('address') || k.includes('description')) return 'textarea';
    if (k.includes('qr') || k.includes('image') || k.includes('photo') || k.includes('signature')) return 'image';
    return 'text';
  }
  onImageSelected(event: any, controlName: string) {
    const file: File = event?.target?.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const data = reader.result as string;
      this.form.get(controlName)!.setValue(data);
      this.updateLivePreview();
    };
    reader.readAsDataURL(file);
  }

  closeDialog(): void {
    this.dialogRef.close();
  }

  private formatLabel(key: string): string {
    if (!key) return '';
    return key.replace(/_/g, ' ').replace(/\b\w/g, m => m.toUpperCase());
  }

  private escapeHtml(value: string): string {
    if (!value && value !== '') return '';
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
}
