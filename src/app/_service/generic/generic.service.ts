import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Observable, Subject } from 'rxjs';
import { NavigationEnd, Router } from '@angular/router';
import { FormGroup, FormArray } from '@angular/forms';
// import { CookieService } from 'ngx-cookie-service';
import { MatDialog } from '@angular/material/dialog';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class GenericService {
  // Inject dependencies using Angular 20's inject() for standalone compatibility
  private http = inject(HttpClient);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);
  // private cookieService = inject(CookieService);
  private dialog = inject(MatDialog);

  // Backend URL from environment
  private baseUrl: string = environment.backendUrl;
  public claimThresholdAmount = 500000.00; // Move to config if dynamic
  public reCaptchaKey = environment.reCaptchaKey; // Move to environment
  public maxDate: Date = new Date();
  private loginStatus = new Subject<boolean>();
  public currentDate = new Date();
  public financialYearFirstDate = this.currentDate.getMonth() >= 3
    ? new Date(this.currentDate.getFullYear(), 3, 1)
    : new Date(this.currentDate.getFullYear() - 1, 3, 1);
  public financialYearLastDate = this.currentDate.getMonth() >= 3
    ? new Date(this.currentDate.getFullYear() + 1, 2, 31)
    : new Date(this.currentDate.getFullYear(), 2, 31);
  public companyConstitutionChanged = -1;
  public companyProposalForChanged = '';

  getSiteKey(): string {
    return this.reCaptchaKey;
  }

  getAll(apiObject: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/${apiObject}/`);
  }

  getById(id: string | number, apiObject: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/${apiObject}/${id}/`);
  }

  getByQueryParameter(endPoint: string, queryData: Record<string, any>): Observable<any> {
    const params = new URLSearchParams(queryData).toString();
    return this.http.get(`${this.baseUrl}${endPoint}?${params}`);
  }

  deleteByQueryParameter(endPoint: string, queryData: Record<string, any>): Observable<any> {
    const params = new URLSearchParams(queryData).toString();
    return this.http.delete(`${this.baseUrl}${endPoint}?${params}`);
  }

  updateByField(updateParams: any, conditionParams: any, apiObject: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/${apiObject}/`, { update: updateParams, condition: conditionParams });
  }

  getByConditions(conditionParams: any, apiObject: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/${apiObject}/`, conditionParams);
  }

  getByConditionsExternal(conditionParams: any, apiObject: string): Observable<any> {
    return this.http.post(apiObject, conditionParams);
  }

  setCompanyConstitutionValue(value: number = -1): void {
    this.companyConstitutionChanged = value;
  }

  getCompanyConstitutionValue(): number {
    return this.companyConstitutionChanged;
  }

  setCompanyProposalForValue(value: string = ''): void {
    this.companyProposalForChanged = value;
  }

  getCompanyProposalForValue(): string {
    return this.companyProposalForChanged;
  }

  openSnackBar(message: string, action: string): void {
    const panelClass = action === 'Success' ? ['snack-bar-custom-style'] : ['snack-bar-error'];
    this.snackBar.open(message, action, {
      duration: 4000,
      verticalPosition: 'top',
      panelClass
    });
  }

  // getCookie(key: string): string {
  //   return this.cookieService.get(key);
  // }

  // setCookie(key: string, value: string): void {
  //   this.cookieService.set(key, value, { secure: true, sameSite: 'Strict' });
  // }

  // removeCookie(key: string): void {
  //   this.cookieService.delete(key);
  // }

  convertToNumber(n: string | number): number {
    return Number(n);
  }

  setLoginStatus(status: boolean): void {
    this.loginStatus.next(status);
  }

  getLoginStatus(): Observable<boolean> {
    return this.loginStatus.asObservable();
  }

  isNumeric(event: KeyboardEvent): boolean {
    const charCode = event.which || event.keyCode;
    return !(charCode > 31 && (charCode < 48 || charCode > 57));
  }

  validateCode(val: string): boolean {
    return /^[a-zA-Z0-9]+$/.test(val);
  }

  // Replaced with ViewChild in components
  showErrorOnFieldHover(fieldId: string, index: number | null = null): void {
    const id = index != null ? `${fieldId}${index}` : fieldId;
    const element = document.getElementById(id);
    if (element && !element.classList.contains('show-error')) {
      element.classList.add('show-error');
    }
  }

  hideErrorOnFieldHoverOut(fieldId: string, index: number | null = null): void {
    const id = index != null ? `${fieldId}${index}` : fieldId;
    const element = document.getElementById(id);
    if (element && element.classList.contains('show-error')) {
      element.classList.remove('show-error');
    }
  }

  storeSessionData(response: any, rememberMe: boolean): void {
    if (!response?.result || !response?.token) return;

    // Clear existing session data
    this.clearSessionData();

    // Store in sessionStorage instead of localStorage for security
    const storage = rememberMe ? localStorage : sessionStorage;
    storage.setItem('session_id', response.session_id);
    storage.setItem('session_name', response.session_name);
    storage.setItem('token', response.token); // Consider HTTP-only cookies for tokens
    storage.setItem('user_details', JSON.stringify(response.result));
    storage.setItem('user_role', response.result.roles);
    storage.setItem('unique_id', response.result.uniqueID);
    storage.setItem('user_additional_roles', JSON.stringify(response.result.additional_roles));
    storage.setItem('isInspectionActive', response.result.isInspectionActive);
    storage.setItem('isJointInspectionActive', response.result.isJointInspectionActive);
    storage.setItem('isAppellate', response.result.isAppellate);
    storage.setItem('appellateLevel', response.result.appellateLevel);
    storage.setItem('isCustomerSupport', response.result.IsCustomerSupport);

    if (response.result.roles !== 'industrial') {
      storage.setItem('department_id', response.result.department_id);
    } else {
      storage.setItem('organization_status', response.result.organization_status);
      storage.setItem('partnership_status', response.result.partnership_status);
      storage.setItem('society_status', response.result.society_status);
      storage.setItem('companyType', response.result.companyType);
      storage.setItem('IsNodalOfficer', response.result.IsNodalOfficer);
      storage.setItem('partnership_frm_status', response.result.partnership_frm_status);
      storage.setItem('society_frm_status', response.result.society_frm_status);
      if (response.result.csc_operator_id) {
        storage.setItem('csc_operator_id', response.result.csc_operator_id);
      }
    }

    if (response.result.roles === 'csc_operator') {
      storage.setItem('uid', response.result.uid);
      storage.setItem('full_name', response.result.full_name);
      storage.setItem('csc_operator_id', response.result.uid);
    }

    this.setLoginStatus(true);
    this.router.navigate(['dashboard/home']);
  }

  clearSessionData(): void {
    const storages = [localStorage, sessionStorage];
    storages.forEach(storage => {
      storage.removeItem('user_details');
      storage.removeItem('user_role');
      storage.removeItem('unique_id');
      storage.removeItem('user_additional_roles');
      storage.removeItem('token');
      storage.removeItem('session_id');
      storage.removeItem('session_name');
      storage.removeItem('department_id');
      storage.removeItem('organization_status');
      storage.removeItem('applyForApprovalDetails');
      storage.removeItem('isInspectionActive');
      storage.removeItem('isJointInspectionActive');
      storage.removeItem('companyType');
      storage.removeItem('IsNodalOfficer');
      storage.removeItem('isAppellate');
      storage.removeItem('appellateLevel');
      storage.removeItem('isCustomerSupport');
      storage.removeItem('partnership_frm_status');
      storage.removeItem('society_frm_status');
    });
    this.setLoginStatus(false);
    this.router.navigate(['/']);
  }

  logoutUser(): void {
    this.getByConditions({}, 'api/logout').subscribe({
      next: () => this.clearSessionData(),
      error: (error) => {
        console.error('Logout error:', error);
        if (error.status === 403) {
          this.clearSessionData();
        }
      }
    });
  }

  // Remove encryption for simplicity; use server-side security
  // encryptData(data: any): string { ... }
  // decryptData(data: string): any { ... }

  chooseDocument(id: string): void {
    // Prefer ViewChild in components
    document.getElementById(id)?.click();
  }

  getErrorCount(formGroup: FormGroup): number {
    let errorCount = 0;
    for (const controlKey in formGroup.controls) {
      if (formGroup.controls[controlKey].errors) {
        errorCount += Object.keys(formGroup.controls[controlKey].errors!).length;
      }
    }
    return errorCount;
  }

  getTotalErrorCount(form: FormGroup | FormArray): number {
    let errorCount = 0;
    const recursiveFunc = (form: FormGroup | FormArray) => {
      Object.keys(form.controls).forEach(field => {
        const control = form.get(field);
        if (control?.invalid) {
          errorCount += Object.keys(control.errors!).length;
        }
        if (control instanceof FormGroup || control instanceof FormArray) {
          recursiveFunc(control);
        }
      });
    };
    recursiveFunc(form);
    return errorCount;
  }

  findInvalidControlsRecursive(form: FormGroup | FormArray): string[] {
    const invalidControls: string[] = [];
    const recursiveFunc = (form: FormGroup | FormArray) => {
      Object.keys(form.controls).forEach(field => {
        const control = form.get(field);
        if (control?.invalid) {
          if (control instanceof FormGroup || control instanceof FormArray) {
            recursiveFunc(control);
          } else {
            invalidControls.push(field);
          }
        }
      });
    };
    recursiveFunc(form);
    return invalidControls;
  }

  getLoggedInUserRole(): string | null {
    return localStorage.getItem('user_role');
  }

  getLoggedInUserRoleText(): string {
    return this.getLoggedInUserRole()?.replace('_', ' ').toUpperCase() ?? '';
  }

  getLoggedInUserUniqueId(): string | null {
    return localStorage.getItem('unique_id');
  }

  getLoggedInUserName(): string {
    const userDetails = JSON.parse(localStorage.getItem('user_details') ?? '{}');
    return userDetails.user_name ?? '';
  }

  getLoggedInName(): string {
    const userDetails = JSON.parse(localStorage.getItem('user_details') ?? '{}');
    return userDetails.full_name ?? '';
  }

  getLoggedInUserId(): string {
    const userDetails = JSON.parse(localStorage.getItem('user_details') ?? '{}');
    return userDetails.uid ?? '';
  }

  getIsCustomerSupport(): number {
    return Number(localStorage.getItem('isCustomerSupport') ?? '0');
  }

  scrollTop(x: number = 0, y: number = 0): void {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        window.scrollTo({ top: y, left: x, behavior: 'smooth' });
      }
    });
  }

  getElementPositionAndScroll(id: string, navigateRoute: string = '/page/home'): void {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      this.router.navigate([navigateRoute]);
      setTimeout(() => this.getElementPositionAndScroll(id, navigateRoute), 500);
    }
  }

  getSelectValue(id: string | number, list: any[], key: string = 'name', idKey: string = 'id'): string {
    if (!id || !list.length) return '';
    const data = list.find(item => item[idKey] == id);
    return data ? data[key] : '';
  }

  getRadioValue(id: string | number, list: any[], key: string = 'name'): string {
    if (!id || !list.length) return '';
    const data = list.find(item => item.value == id);
    return data ? data[key] : '';
  }

  goBackToList(): void {
    const route = this.getLoggedInUserRole() === 'industrial'
      ? '/manufacturing-process/combined-list'
      : '/manufacturing-process/combined-dept-list';
    this.router.navigate([route]);
  }

  // checkStatusForCfeAndCfo(nocDetailsId: string = ''): void {
  //   this.getByConditions({ noc_id: nocDetailsId }, 'api/fetch-noc-status').subscribe({
  //     next: (res) => {
  //       if (res.status_code === 1 && !['draft', 'clarification_required', 'approved'].includes(res.result.noc_status_key)) {
  //         this.router.navigate(['/dashboard/home']);
  //         this.dialog.open(ErrorDialogComponent, {
  //           data: { message: 'You are not authorized to access this page.' },
  //           panelClass: 'custom-dialog'
  //         });
  //       }
  //     },
  //     error: (error) => {
  //       console.error(error);
  //       this.clearSessionData();
  //     }
  //   });
  // }

  getExtension(data: string): string {
    return data.substring(data.lastIndexOf('.') + 1);
  }

  checkFormGroupPropsInvalid(formGroup: FormGroup): void {
    for (const key in formGroup.controls) {
      if (formGroup.controls[key].invalid) {
        console.log(`'${key}' is invalid with errors:`, formGroup.controls[key].errors);
      }
    }
  }
}
