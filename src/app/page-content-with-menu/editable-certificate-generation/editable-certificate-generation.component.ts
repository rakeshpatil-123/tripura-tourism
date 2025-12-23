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
  variableList: Array<{ key: string; label: string; type?: string }> = [];
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
    } else if (this.data && typeof this.data === 'object' && Object.keys(this.data).length) {
      const raw = this.data;
      this.applicationData = {};
      if (raw.application_data && typeof raw.application_data === 'object') {
        const nested = raw.application_data;
        Object.keys(nested).forEach(k => {
          const item = nested[k] || {};
          const question = item.question || this.formatLabel(k);
          const answer = item.answer ?? '';
          const type = (item.type || '').toString().toLowerCase();
          this.variableList.push({ key: k, label: question, type });
          this.applicationData[k] = answer;
        });
      }
      Object.keys(raw).forEach(k => {
        if (k === 'application_data') return;
        const val = raw[k];
        if (!this.variableList.some(v => v.key === k)) {
          this.variableList.push({ key: k, label: this.formatLabel(k), type: undefined });
          this.applicationData[k] = val;
        }
      });
      this.buildFormFromVariables();
      this.prefillFormWithData();
    } else {
      this.initEmptyForm();
    }
  }



  private initEmptyForm(): void {
    this.form = this.fb.group({});
    this.livePreviewHtml = '';
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
        if (res?.status === 1 && res.data && typeof res.data === 'object') {
          const raw = res.data;
          this.applicationData = {};
          this.variableList = [];
          if (raw.application_data && typeof raw.application_data === 'object') {
            Object.keys(raw.application_data).forEach(k => {
              const item = raw.application_data[k] || {};
              const question = item.question || this.formatLabel(k);
              const answer = item.answer ?? '';
              const type = (item.type || '').toString().toLowerCase();
              this.variableList.push({ key: k, label: question, type });
              this.applicationData[k] = answer;
            });
          }
          Object.keys(raw).forEach(k => {
            if (k === 'application_data') return;
            if (!this.variableList.some(v => v.key === k)) {
              this.variableList.push({ key: k, label: this.formatLabel(k), type: undefined });
              this.applicationData[k] = raw[k];
            }
          });

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
  previewCertificate(): void {
    if (!this.selectedAppId && !this.form.get('application_id')?.value) {
      Swal.fire('Info', 'Please enter/select Application ID before preview', 'info');
      return;
    }

    this.generating = true;
    const basePayload: any = {
      application_id: this.selectedAppId || this.form.value.application_id || null,
      ...this.form.value
    };

    if (basePayload.add_watermark) {
      basePayload.add_watermark = basePayload.add_watermark === 'yes' ? 'yes' : 'no';
    }
    if (basePayload.valid_upto) {
      basePayload.valid_upto = this.formatToDDMMYYYY(basePayload.valid_upto);
    }
    basePayload.is_preview = 'yes';
    const payloadToSend = this.prepareBackendPayload(basePayload);

    // const svc: any = this.genericService as any;
    // let obs: any;
    // if (typeof svc.previewCertificate === 'function') {
    //   obs = svc.previewCertificate(payloadToSend);
    // } else if (typeof svc.generateCertificateAsBlob === 'function') {
    //   obs = svc.generateCertificateAsBlob(payloadToSend);
    // } else {
    //   this.generating = false;
    //   Swal.fire('Error', 'No blob-returning service method available (previewCertificate / generateCertificateAsBlob).', 'error');
    //   return;
    // }

    this.genericService.previewCertificate(payloadToSend).subscribe({
      next: (resp: any) => {
        this.generating = false;
        // try { this.dialogRef?.close?.('generated'); } catch (e) { }
        let blob: Blob | null = null;
        if (resp instanceof Blob) {
          blob = resp;
        } else if (resp && resp.body instanceof Blob) {
          blob = resp.body;
        } else if (resp && resp.data instanceof Blob) {
          blob = resp.data;
        } else if (resp && resp._body instanceof Blob) {
          blob = resp._body;
        }

        if (!blob) {
          Swal.fire('Error', 'No file received from server for preview.', 'error');
          return;
        }
        if (blob.type && blob.type.indexOf('application/json') !== -1) {
          const reader = new FileReader();
          reader.onload = () => {
            try {
              const txt = String(reader.result || '');
              const json = JSON.parse(txt);
              Swal.fire('Error', json?.message || 'Preview failed (server returned JSON).', 'error');
            } catch (e) {
              Swal.fire('Error', 'Preview failed (invalid JSON returned).', 'error');
            }
          };
          reader.readAsText(blob);
          return;
        }

        const opened = this.openBlobInNewTab(blob);
        if (!opened) {
          Swal.fire('Error', 'Unable to open preview tab (popup blocked?)', 'error');
        }
      },
      error: (err: HttpErrorResponse) => {
        console.error('Preview error:', err);
        this.generating = false;
        try { this.dialogRef?.close?.(); } catch (e) { }
        Swal.fire('Error', 'An error occurred while previewing the certificate.', 'error');
      }
    });
  }


  private openBlobInNewTab(blob: Blob, suggestedFilename?: string): boolean {
    try {
      const url = URL.createObjectURL(blob);
      const newTab = window.open(url, '_blank');
      if (!newTab) {
        URL.revokeObjectURL(url);
        return false;
      }
      setTimeout(() => URL.revokeObjectURL(url), 60_000);
      return true;
    } catch (e) {
      console.error('openBlobInNewTab error', e);
      return false;
    }
  }
  private prepareBackendPayload(basePayload: any): any {
    const out: any = {};
    Object.keys(basePayload || {}).forEach(k => {
      if (/^\d+$/.test(k)) {
        out[`application_data.${k}`] = basePayload[k];
      } else {
        out[k] = basePayload[k];
      }
    });
    return out;
  }

  generateCertificate(): void {
    if (!this.selectedAppId && !this.form.get('application_id')) {
      Swal.fire('Info', 'Please enter/select Application ID before generating', 'info');
      return;
    }

    this.generating = true;
    const basePayload: any = {
      application_id: this.selectedAppId || this.form.value.application_id || null,
      ...this.form.value
    };

    if (basePayload.add_watermark) {
      basePayload.add_watermark = basePayload.add_watermark === 'yes' ? 'yes' : 'no';
    }
    if (basePayload.valid_upto) {
      basePayload.valid_upto = this.formatToDDMMYYYY(basePayload.valid_upto);
    }

    basePayload.is_preview = "no";

    // convert numeric keys to application_data.<id>
    const payloadToSend = this.prepareBackendPayload(basePayload);

    this.genericService.generateCertificate(payloadToSend).subscribe({
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

  inputTypeForKey(key: string, explicitType?: string): string {
    if (explicitType) {
      const t = explicitType.toString().toLowerCase();
      if (t === 'file' || t === 'image' || t === 'photo') return 'image';
      if (t === 'textarea' || t === 'notes' || t === 'description') return 'textarea';
      if (t === 'date' || t === 'dob') return 'date';
      if (t === 'email') return 'email';
      if (t === 'tel' || t === 'phone' || t === 'mobile') return 'tel';
      if (t === 'number' || t === 'numeric' || t === 'int' || t === 'float') return 'number';
      if (t === 'password') return 'password';
      if (t === 'dropdown' || t === 'select') return 'dropdown';
    }
    if (!key) return 'text';
    const k = key.toLowerCase();
    const idAsTextExceptions = ['license_id', 'licence_id', 'license no', 'licence no', 'business_pan_no'];
    if (k.endsWith('_id') && !idAsTextExceptions.includes(k)) {
      return 'number';
    }

    if (k === 'add_watermark') return 'dropdown';
    if (k.includes('date') || k.includes('dob') || k.includes('issued_on') || k.includes('valid_from') || k.includes('valid_upto')) return 'date';
    if (k.includes('email')) return 'email';
    if (k.includes('phone') || k.includes('mobile') || k.includes('contact')) return 'tel';
    if (k.includes('amount') || k.includes('fee') || k.includes('number') || k.includes('no')) return 'number';
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
