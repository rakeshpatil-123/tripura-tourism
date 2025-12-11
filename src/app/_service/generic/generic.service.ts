import { Injectable } from '@angular/core';
import {
  HttpClient,
  HttpErrorResponse,
  HttpHeaders,
  HttpParams,
  HttpResponse,
} from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';
import { catchError, Observable, Subject, throwError } from 'rxjs';
import { Router, NavigationEnd } from '@angular/router';
import { FormGroup, FormArray } from '@angular/forms';
import { CookieService } from 'ngx-cookie-service';
import * as CryptoJS from 'crypto-js';
import Swal from 'sweetalert2';

@Injectable({
  providedIn: 'root', // Makes the service available app-wide in standalone setup
})
export class GenericService {
  // API URLs (same as provided)
  static DEV_BACKEND_URL = 'http://swaagatstaging.tripura.cloud';
  static QA_BACKEND_URL = 'http://swaagatstaging.tripura.cloud';
  static UAT_BACKEND_URL = 'http://swaagatstaging.tripura.cloud';
  static CERTIN_BACKEND_URL = 'http://swaagatstaging.tripura.cloud';
  static PRODUCTION_BACKEND_URL = 'http://swaagatstaging.tripura.cloud';

  public static BACKEND_URL(): string {
    console.log(window.location.origin);
    if (window.location.origin.includes('swaagat-qa')) {
      return GenericService.QA_BACKEND_URL;
    } else if (window.location.origin.includes('swaagat-uat')) {
      return GenericService.UAT_BACKEND_URL;
    } else if (window.location.origin.includes('swaagat-certin')) {
      return GenericService.CERTIN_BACKEND_URL;
    } else if (window.location.origin.includes('swaagatstaging.tripura')) {
      return GenericService.PRODUCTION_BACKEND_URL;
    }
    return GenericService.DEV_BACKEND_URL;
  }

  public baseUrl: string = GenericService.BACKEND_URL();
  public claimThresholdAmount = 500000.0;
  private encryptSecretKey = 'René Über';
  public maxDate: Date = new Date();
  private loginStatus = new Subject<boolean>();
  public reCaptcha_key = '6LduT_QUAAAAAKKDWXmKYw710NFYd4S-9GlI-pWj';
  public currentDate = new Date();
  public financialYearFirstDate =
    this.currentDate.getMonth() >= 3
      ? new Date(this.currentDate.getFullYear(), 3, 1)
      : new Date(this.currentDate.getFullYear() - 1, 3, 1);
  public financialYearLastDate =
    this.currentDate.getMonth() >= 3
      ? new Date(this.currentDate.getFullYear() + 1, 2, 31)
      : new Date(this.currentDate.getFullYear(), 2, 31);
  public companyConstitutionChanged = -1;
  public companyProposalForChanged = '';

  constructor(
    private http: HttpClient,
    private router: Router,
    private snackBar: MatSnackBar,
    private cookieService: CookieService
  ) { }

  loginUser(credentials: {
    username: string;
    password: string;
  }): Observable<any> {
    return this.http.post(`${this.baseUrl}/api/user/login`, credentials);
  }

  getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    let headers = new HttpHeaders();

    if (token) {
      headers = headers.set(
        'Authorization',
        `Bearer ${this.decryptData(token)}`
      );
    }

    return headers;
  }

  registerUser(userData: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/api/user/register`, userData, {
      headers: this.getHeaders(),
    });
  }

  loginAdmin(adminData: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/api/user/login`, adminData);
  }

  getSiteKey(): string {
    return this.reCaptcha_key;
  }

  getAll(apiObject: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/${apiObject}/`);
  }

  getById(id: string | number, apiObject: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/${apiObject}/${id}/`);
  }

  getByQueryParameter(endPoint: string, queryData: object): Observable<any> {
    let queryString = Object.entries(queryData)
      .map(([key, value]) => `${key}=${value}`)
      .join('&');
    return this.http.get(`${this.baseUrl}${endPoint}?${queryString}`);
  }

  deleteByQueryParameter(endPoint: string, queryData: object): Observable<any> {
    let queryString = Object.entries(queryData)
      .map(([key, value]) => `${key}=${value}`)
      .join('&');
    return this.http.delete(`${this.baseUrl}${endPoint}?${queryString}`);
  }

  updateByField(
    updateParams: any,
    conditionParams: any,
    apiObject: string
  ): Observable<any> {
    return this.http.post(`${this.baseUrl}/${apiObject}/`, {
      update: updateParams,
      condition: conditionParams,
    });
  }

  // getByConditions(conditionParams: any, apiObject: string): Observable<any> {
  //   return this.http.post(`${this.baseUrl}/${apiObject}`, conditionParams);
  // }

  /**
   * Get decrypted user ID from localStorage
   * @returns string - decrypted user ID or null if not found
   */
  getDecryptedUserId(): string | null {
    try {
      const encryptedId = localStorage.getItem('id');
      if (!encryptedId) {
        console.warn('User ID not found in localStorage');
        return null;
      }

      // Decrypt the ID using existing decryptData method
      const decryptedId = this.decryptData(encryptedId);
      return decryptedId;
    } catch (error) {
      console.error('Failed to decrypt user ID:', error);
      return null;
    }
  }
  // getDecryptedUserType(): string | null {
  //   try {
  //     const encryptedType = localStorage.getItem('user_type');
  //     if (!encryptedType) {
  //       console.warn('User ID not found in localStorage');
  //       return null;
  //     }

  //     // Decrypt the ID using existing decryptData method
  //     const decryptedType = this.decryptData(encryptedType);
  //     return decryptedType;
  //   } catch (error) {
  //     console.error('Failed to decrypt user ID:', error);
  //     return null;
  //   }
  // }

  decryptLocalStorageItem(key: string): string {
    try {
      const encryptedValue = localStorage.getItem(key);

      // If key doesn't exist, return empty string (not null)
      if (!encryptedValue) {
        console.warn(
          `Encrypted value not found in localStorage for key: "${key}"`
        );
        return '';
      }

      // Decrypt using your existing method
      const decryptedValue = this.decryptData(encryptedValue);

      return typeof decryptedValue === 'string' ? decryptedValue : '';
    } catch (error) {
      console.error(`Failed to decrypt value for key "${key}":`, error);
      return ''; // Always return string — never null
    }
  }

  // getByConditions(conditionParams: any, apiObject: string): Observable<any> {
  //   const token = localStorage.getItem('token');
  //   let headers = new HttpHeaders();
  //   // console.log(token,"token");

  //   if (token) {
  //     headers = headers.set(
  //       'Authorization',
  //       `Bearer ${this.decryptData(token)}`
  //     );
  //     console.log(headers, "headers");

  //   }

  //   return this.http.post(`${this.baseUrl}/${apiObject}`, conditionParams, {
  //     headers,
  //   });
  // }

  // getByConditions(conditionParams: any, apiObject: string): Observable<any> {
  //   const token = localStorage.getItem('token');
  //   let headers = new HttpHeaders({ 'Content-Type': 'application/json' });

  //   if (token) {
  //     headers = headers.set(
  //       'Authorization',
  //       `Bearer ${this.decryptData(token)}`
  //     );
  //   }

  //   return this.http
  //     .post(`${this.baseUrl}/${apiObject}`, conditionParams, { headers })
  //     .pipe(
  //       catchError((error: HttpErrorResponse) => {
  //         if (error.error && typeof error.error === 'object') {
  //           const message = error.error.message;

  //           if (message === 'Unauthenticated.' || message === 'Unauthorised') {
  //             console.warn(
  //               'Session expired or invalid. Redirecting to login...'
  //             );
  //             this.handleUnauthenticated();
  //           }
  //         } else if (error.status === 401) {
  //           console.warn('401 Unauthorized. Redirecting to login...');
  //           this.handleUnauthenticated();
  //         }

  //         return throwError(() => error);
  //       })
  //     );
  // }

  getByConditions(conditionParams: any, apiObject: string): Observable<any> {
    const token = localStorage.getItem('token');
    let headers = new HttpHeaders();

    if (token) {
      headers = headers.set(
        'Authorization',
        `Bearer ${this.decryptData(token)}`
      );
    }

    if (!(conditionParams instanceof FormData)) {
      headers = headers.set('Content-Type', 'application/json');
    }

    return this.http
      .post(`${this.baseUrl}/${apiObject}`, conditionParams, {
        headers,
      })
      .pipe(
        catchError((error: HttpErrorResponse) => {
          if (error.error && typeof error.error === 'object') {
            const message = error.error.message;
            if (
              message === 'Unauthenticated.' ||
              message === 'Unauthorised' ||
              message === 'Session expired or logged out' ||
              message === 'Session expired due to inactivity'
            ) {
              console.warn(
                'Session expired or invalid. Redirecting to login...'
              );
              this.handleUnauthenticated();
            }
          } else if (error.status === 401) {
            this.handleUnauthenticated();
          }

          return throwError(() => error);
        })
      );
  }

  postPublicApi(conditionParams: any, apiObject: string): Observable<any> {
    // const token = localStorage.getItem('token');
    let headers = new HttpHeaders();

    // if (token) {
    //   headers = headers.set(
    //     'Authorization',
    //     `Bearer ${this.decryptData(token)}`
    //   );
    // }

    if (!(conditionParams instanceof FormData)) {
      headers = headers.set('Content-Type', 'application/json');
    }

    return this.http
      .post(`${this.baseUrl}/${apiObject}`, conditionParams, {
        headers,
      })
      .pipe(
        catchError((error: HttpErrorResponse) => {
          if (error.error && typeof error.error === 'object') {
            const message = error.error.message;

            if (
              message === 'Unauthenticated.' ||
              message === 'Unauthorised' ||
              message === 'Session expired or logged out' ||
              message === 'Session expired due to inactivity'
            ) {
              console.warn(
                'Session expired or invalid. Redirecting to login...'
              );
              this.handleUnauthenticated();
            }
          } else if (error.status === 401) {
            console.warn('401 Unauthorized. Redirecting to login...');
            this.handleUnauthenticated();
          }

          return throwError(() => error);
        })
      );
  }

  getPublicApi(apiObject: string, queryParams?: any): Observable<any> {
    // Create options object with query parameters if provided
    const options = {
      params: queryParams
    };

    return this.http
      .get(`${this.baseUrl}/${apiObject}`, options)
      .pipe(
        catchError((error: HttpErrorResponse) => {
          // Handle authentication errors
          if (error.error && typeof error.error === 'object') {
            const message = error.error.message;

            if (
              message === 'Unauthenticated.' ||
              message === 'Unauthorised' ||
              message === 'Session expired or logged out' ||
              message === 'Session expired due to inactivity'
            ) {
              console.warn('Session expired or invalid. Redirecting to login...');
              this.handleUnauthenticated();
            }
          } else if (error.status === 401) {
            console.warn('401 Unauthorized. Redirecting to login...');
            this.handleUnauthenticated();
          }

          return throwError(() => error);
        })
      );
  }


  getThirdPartyRedirect(url: string): Observable<string> {
    const token = localStorage.getItem('token');
    let headers = new HttpHeaders();

    if (token) {
      headers = headers.set(
        'Authorization',
        `Bearer ${this.decryptData(token)}`
      );
    }

    return this.http.post<string>(
      `${this.baseUrl}/${url}`,
      {},
      {
        responseType: 'text' as 'json',
        headers,
      }
    );
  }

   postAsText(endpoint: string, body: any): Observable<string> {
    const url = `${this.baseUrl}/${endpoint}`;

    let headers = new HttpHeaders({
      'Content-Type': 'text/plain,application/json',
      'Accept': 'application/json, text/plain, */*'
    });
    const token = localStorage.getItem('token');
    if (token) {
      headers = headers.set(
        'Authorization',
        `Bearer ${this.decryptData(token)}`
      );
    }
    const rawBody = JSON.stringify(body);
    return this.http.post(url, rawBody, { headers, responseType: 'text' });
  }

  private handleUnauthenticated(): void {
    localStorage.clear();
    this.setLoginStatus(false);

    window.location.href = '/page/login';
  }

  getByConditionsExternal(
    conditionParams: any,
    apiObject: string
  ): Observable<any> {
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
    const panelClass = action === 'Success' ? 'snack-bar-cumtom-style' : 'red';
    this.snackBar.open(message, action, {
      duration: 3000,
      verticalPosition: 'top',
      horizontalPosition: 'center',
      panelClass: [panelClass, 'snack-bar-global'],
    });
  }

  getCookie(key: string): string {
    return this.cookieService.get(key);
  }

  setCookie(key: string, value: string): void {
    this.cookieService.set(key, value);
  }

  removeCookie(key: string): void {
    this.cookieService.delete(key);
  }

  convertToNumber(n: string | number): number {
    return Number(n);
  }

  setLoginStatus(status: boolean): void {
    this.loginStatus.next(status);
  }

  getLoginStatus(): Observable<boolean> {
    return this.loginStatus.asObservable();
  }

  public isNumeric(evt: KeyboardEvent): boolean {
    const charCode = evt.which ? evt.which : evt.keyCode;
    if (charCode > 31 && (charCode < 48 || charCode > 57)) {
      return false;
    }
    return true;
  }

  public validateCode(val: string): boolean {
    return !/[^a-zA-Z0-9]/.test(val);
  }

  showErrorOnFieldHover(fieldId: string, index: number | null = null): void {
    if (index !== null) {
      fieldId = fieldId + index;
    }
    const element = document.getElementById(fieldId);
    if (element && !element.classList.contains('show-error')) {
      element.classList.add('show-error');
    }
  }

  hideErrorOnFieldHoverOut(fieldId: string, index: number | null = null): void {
    if (index !== null) {
      fieldId = fieldId + index;
    }
    const element = document.getElementById(fieldId);
    if (element && element.classList.contains('show-error')) {
      element.classList.remove('show-error');
    }
  }

  storeSessionData(response: any, rememberme: boolean): void {
    if (response['data'] && response['token']) {
      // Clear existing storage
      localStorage.clear();

      // Required keys from response
      const keysToStore = [
        'token',
        'id',
        'name_of_enterprise',
        'authorized_person_name',
        'mobile_no',
        'user_name',
        'bin',
        'registered_enterprise_address',
        'registered_enterprise_city',
        'user_type',
        'status',
      ];

      keysToStore.forEach((key) => {
        if (response['data'][key] || response[key]) {
          const value =
            typeof response['data'][key] === 'object'
              ? JSON.stringify(response['data'][key])
              : this.encryptData(response['data'][key] || response[key]);
          localStorage.setItem(key, value);
        }
      });

      this.setLoginStatus(true);
      this.router.navigate(['dashboard/home']);
    }
  }

  // storeSessionData(response: any, rememberme: boolean): void {
  //   if (response['result'] && response['token']) {
  //     // Clear existing storage
  //     localStorage.clear();
  //     // Store session data
  //     const keysToStore = [
  //       'session_id',
  //       'session_name',
  //       'token',
  //       'user_details',
  //       'user_role',
  //       'unique_id',
  //       'user_additional_roles',
  //       'isInspectionActive',
  //       'isJointInspectionActive',
  //       'IsNodalOfficer',
  //       'isAppellate',
  //       'appellateLevel',
  //       'isCustomerSupport',
  //       'department_id',
  //       'organization_status',
  //       'partnership_status',
  //       'society_status',
  //       'companyType',
  //       'partnership_frm_status',
  //       'society_frm_status',
  //       'uid',
  //       'full_name',
  //       'csc_operator_id',
  //     ];
  //     keysToStore.forEach((key) => {
  //       if (response['result'][key] || response[key]) {
  //         const value =
  //           key === 'user_details' || key === 'user_additional_roles'
  //             ? JSON.stringify(response['result'][key] || response[key])
  //             : this.encryptData(response['result'][key] || response[key]);
  //         localStorage.setItem(key, value);
  //       }
  //     });
  //     this.setLoginStatus(true);
  //     this.router.navigate(['dashboard/home']);
  //   }
  // }

  userDashData(): Observable<any> {
    const uid = localStorage.getItem('userId');
    const payload = { user_id: uid };

    return this.getByConditions(
      payload,
      `api/user/get-total-applications-by-user`
    );
  }

  postWithoutAuth(apiObject: string, body: any = {}): Observable<any> {
    return this.http.post(`${this.baseUrl}/${apiObject}`, body);
  }

  removeSessionData(): void {
    localStorage.clear();
    sessionStorage.clear();
    this.setLoginStatus(false);
  }

  removeSessionAndReturn(error: any): boolean {
    if (error.status === 403) {
      this.removeSessionData();
    }
    return false;
  }

  logoutUser(): void {
    this.getByConditions({}, 'api/user/logout').subscribe({
      next: (res: any) => {
        Swal.fire({
          title: 'Logging Out...',
          html: `<strong>${res.message || 'You have been successfully logged out.'
            }</strong>`,
          timer: 2500,
          timerProgressBar: true,
          allowOutsideClick: false,
          allowEscapeKey: false,
          didOpen: () => {
            Swal.showLoading();
          },
          showClass: {
            popup: 'animate__animated animate__fadeInDown',
          },
          hideClass: {
            popup: 'animate__animated animate__fadeOutUp',
          },
          background: '#f0f4f8',
          color: '#1e293b',
          iconColor: '#10b981',
          icon: 'success',
        }).then(() => {
          this.removeSessionData();
          // this.router.navigate(['/']);
          window.location.href = '/';
        });
      },
      error: (error) => {
        console.error(error);
        Swal.fire({
          title: 'Logging Out...',
          html: `<strong>Something went wrong. Logging you out automatically.</strong>`,
          timer: 3000,
          timerProgressBar: true,
          allowOutsideClick: false,
          allowEscapeKey: false,
          didOpen: () => {
            Swal.showLoading();
          },
          showClass: {
            popup: 'animate__animated animate__fadeInDown',
          },
          hideClass: {
            popup: 'animate__animated animate__fadeOutUp',
          },
          background: '#fff7ed',
          color: '#b45309',
          iconColor: '#f59e0b',
          icon: 'warning',
        }).then(() => {
          this.removeSessionData();
          window.location.href = '/';
          // this.router.navigate(['/']);
        });
      },
    });
  }

  autoLogout(): void {
    localStorage.clear();
    sessionStorage.clear();
    this.setLoginStatus(false);
    Swal.fire({
      title: 'Session Expired!',
      html: `<strong>Your session has ended. Please log in again to continue.</strong>`,
      icon: 'warning',
      iconColor: '#f59e0b',
      background: '#fff7ed',
      color: '#b45309',
      timer: 3500,
      timerProgressBar: true,
      allowOutsideClick: false,
      allowEscapeKey: false,
      didOpen: () => {
        Swal.showLoading();
      },
      showClass: {
        popup: 'animate__animated animate__fadeInDown animate__faster',
      },
      hideClass: {
        popup: 'animate__animated animate__fadeOutUp animate__faster',
      },
    }).then(() => {
      // this.router.navigate(['/page/login']);
      window.location.href = '/page/login';
    });
  }

  encryptData(data: any): string {
    try {
      return CryptoJS.AES.encrypt(
        JSON.stringify(data),
        this.encryptSecretKey
      ).toString();
    } catch (e) {
      console.error(e);
      return '';
    }
  }

  decryptData(data: string): any {
    try {
      const bytes = CryptoJS.AES.decrypt(data, this.encryptSecretKey);
      if (bytes.toString()) {
        return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
      }
      return data;
    } catch (e) {
      console.error(e);
      return data;
    }
  }

  chooseDocument(id: string): void {
    const element = document.getElementById(id) as HTMLInputElement;
    if (element) {
      element.click();
    }
  }

  getErrorCount(container: FormGroup | FormArray): number {
    let errorCount = 0;
    for (const controlKey in container.controls) {
      if (container.controls.hasOwnProperty(controlKey)) {
        const control = container.get(controlKey);
        if (control?.errors) {
          errorCount +=
            control instanceof FormArray
              ? Object.keys(control.errors).length
              : 1;
        }
      }
    }
    return errorCount;
  }

  getTotalErrorCount(formToInvestigate: FormGroup | FormArray): number {
    let errorCount = 0;
    const recursiveFunc = (form: FormGroup | FormArray) => {
      Object.keys(form.controls).forEach((field) => {
        const control = form.get(field);
        if (control?.invalid) {
          errorCount += Object.keys(control.errors || {}).length;
        }
        if (control instanceof FormGroup || control instanceof FormArray) {
          recursiveFunc(control);
        }
      });
    };
    recursiveFunc(formToInvestigate);
    return errorCount;
  }

  findInvalidControlsRecursive(
    formToInvestigate: FormGroup | FormArray
  ): string[] {
    const invalidControls: string[] = [];
    const recursiveFunc = (form: FormGroup | FormArray) => {
      Object.keys(form.controls).forEach((field) => {
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
    recursiveFunc(formToInvestigate);
    return invalidControls;
  }

  getLoggedInUserRole(): string | null {
    return localStorage.getItem('user_role');
  }

  getLoggedInUserRoleText(): string {
    return (localStorage.getItem('user_role') || '')
      .replace('_', ' ')
      .toUpperCase();
  }

  getLoggedInUserUniqueId(): string | null {
    return localStorage.getItem('unique_id');
  }

  getLoggedInUserName(): string {
    const userDetails = JSON.parse(
      localStorage.getItem('user_details') || '{}'
    );
    return userDetails.user_name || '';
  }

  getLoggedInName(): string {
    const userDetails = JSON.parse(
      localStorage.getItem('user_details') || '{}'
    );
    return userDetails.full_name || '';
  }

  getLoggedInUserId(): string {
    const userDetails = JSON.parse(
      localStorage.getItem('user_details') || '{}'
    );
    return userDetails.uid || '';
  }

  getIsCustomerSupport(): number {
    return Number(localStorage.getItem('isCustomerSupport') || '0');
  }

  scrollTop(x: number = 0, y: number = 0): void {
    this.router.events.subscribe((evt) => {
      if (evt instanceof NavigationEnd) {
        window.scrollTo(x, y);
      }
    });
  }

  getElementPositionAndScroll(
    id: string = '',
    navigateRoute: string = '/page/home'
  ): void {
    const testDiv = document.getElementById(id);
    if (testDiv) {
      window.scrollTo({
        top: testDiv.offsetTop,
        left: 0,
        behavior: 'smooth',
      });
    } else {
      this.router.navigate([navigateRoute]);
      setTimeout(
        () => this.getElementPositionAndScroll(id, navigateRoute),
        500
      );
    }
  }

  getSelectValue(
    id: string | number,
    list: any[],
    key: string = 'name',
    idKey: string = 'id'
  ): string {
    if (id && list.length > 0) {
      const data = list.find((item) => item[idKey] == id);
      return data ? data[key] : '';
    }
    return '';
  }

  getRadioValue(
    id: string | number,
    list: any[],
    key: string = 'name'
  ): string {
    if (id && list.length > 0) {
      const data = list.find((item) => item.value == id);
      return data ? data[key] : '';
    }
    return '';
  }

  goBackToList(): void {
    const route =
      this.getLoggedInUserRole() === 'industrial'
        ? '/manufacturing-process/combined-list'
        : '/manufacturing-process/combined-dept-list';
    this.router.navigate([route]);
  }

  checkStatusForCfeAndCfo(noc_details_id: string = ''): void {
    const data = { noc_id: noc_details_id };
    this.getByConditions(data, 'api/fetch-noc-status').subscribe({
      next: (res) => {
        if (
          res['status_code'] === 1 &&
          !['draft', 'clarification_required', 'approved'].includes(
            res['result']['noc_status_key']
          )
        ) {
          this.router.navigate(['/dashboard/home']);
          Swal.fire({
            text: 'You are not authorized to access this page.',
            confirmButtonColor: '#04578D',
          });
        }
      },
      error: (error) => {
        console.error(error);
        this.removeSessionData();
      },
    });
  }

  getExtension(data: string = ''): string {
    return data ? data.substring(data.lastIndexOf('.') + 1) : '';
  }

  checkFormGroupPropsInvalid(formGroup: FormGroup): void {
    for (const key in formGroup.controls) {
      if (formGroup.controls[key].invalid) {
        console.log(
          `'${key}' is invalid with errors:`,
          formGroup.controls[key].errors
        );
      }
    }
  }

  getAdminServices() {
    const token = localStorage.getItem('token');
    let headers = new HttpHeaders();

    if (token) {
      headers = headers.set(
        'Authorization',
        `Bearer ${this.decryptData(token)}`
      );
    }

    return this.http.post<any>(
      `${this.baseUrl}/api/fetch-all-services`,
      {},
      { headers }
    );
  }

  addNewService(body: any) {
    const token = localStorage.getItem('token');
    let headers = new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('Accept-Language', 'en-US,en;q=0.7');

    if (token) {
      headers = headers.set(
        'Authorization',
        `Bearer ${this.decryptData(token)}`
      );
    }

    return this.http.post(
      this.baseUrl + '/api/admin/service-master-store',
      body,
      {
        headers,
      }
    );
  }
  getUpdationDataServiceAdmin(body: any): Observable<any> {
    const token = localStorage.getItem('token');

    let headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept-Language': 'en-US,en;q=0.7',
    });

    if (token) {
      headers = headers.set(
        'Authorization',
        `Bearer ${this.decryptData(token)}`
      );
    }

    return this.http.post<any>(
      `${this.baseUrl}/api/fetch-service-details`,
      body,
      { headers }
    );
  }

  updateAdminService(body: any): Observable<any> {
    const token = localStorage.getItem('token');
    let headers = new HttpHeaders();

    if (token) {
      headers = headers.set(
        'Authorization',
        `Bearer ${this.decryptData(token)}`
      );
    }

    return this.http.post(
      `${this.baseUrl}/api/admin/service-master-update`,
      body,
      {
        headers,
      }
    );
  }

  deleteAdminService(serviceId: number): Observable<any> {
    const token = localStorage.getItem('token');
    let headers = new HttpHeaders();

    if (token) {
      headers = headers.set(
        'Authorization',
        `Bearer ${this.decryptData(token)}`
      );
    }

    return this.http.post(
      `${this.baseUrl}/api/admin/service-master-delete`,
      { id: serviceId },
      { headers }
    );
  }

  saveQuestionnaire(payload: any): Observable<any> {
    const token = localStorage.getItem('token');
    let headers = new HttpHeaders();

    if (token) {
      headers = headers.set(
        'Authorization',
        `Bearer ${this.decryptData(token)}`
      );
    }
    return this.http.post<any>(
      `${this.baseUrl}/api/admin/service-questionnaire-store`,
      payload,
      { headers }
    );
  }

  updateQuestionnaire(payload: any): Observable<any> {
    const token = localStorage.getItem('token');
    let headers = new HttpHeaders();

    if (token) {
      headers = headers.set(
        'Authorization',
        `Bearer ${this.decryptData(token)}`
      );
    }

    return this.http.post<any>(
      `${this.baseUrl}/api/admin/service-questionnaire-update`,
      payload,
      { headers }
    );
  }

  getServiceQuestionnaires(service_id: any): Observable<any> {
    const token = localStorage.getItem('token');
    let headers = new HttpHeaders();

    if (token) {
      headers = headers.set(
        'Authorization',
        `Bearer ${this.decryptData(token)}`
      );
    }
    return this.http.post<any>(
      `${this.baseUrl}/api/service-questionnaire-view`,
      { service_id: service_id },
      { headers }
    );
  }

  deleteServiceQuestionnaires(serviceId: number): Observable<any> {
    const token = localStorage.getItem('token');
    let headers = new HttpHeaders();

    if (token) {
      headers = headers.set(
        'Authorization',
        `Bearer ${this.decryptData(token)}`
      );
    }

    return this.http.post<any>(
      `${this.baseUrl}/api/admin/service-questionnaire-delete`,
      { id: serviceId },
      { headers }
    );
  }

  getColumns(table: string): Observable<string[]> {
    const token = localStorage.getItem('token');
    let headers = new HttpHeaders();

    if (token) {
      headers = headers.set(
        'Authorization',
        `Bearer ${this.decryptData(token)}`
      );
    }

    return this.http.post<string[]>(
      `${this.baseUrl}/api/table-columns`,
      { table },
      { headers }
    );
  }

  getAllDepartmentNames(): Observable<any> {
    const token = localStorage.getItem('token');
    let headers = new HttpHeaders();

    if (token) {
      headers = headers.set(
        'Authorization',
        `Bearer ${this.decryptData(token)}`
      );
    }
    return this.http.post<any>(
      `${this.baseUrl}/api/department-get-all-departments`,
      {},
      { headers }
    );
  }

  addDepartment(body: any) {
    const token = localStorage.getItem('token');
    let headers = new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('Accept-Language', 'en-US,en;q=0.7');

    if (token) {
      headers = headers.set(
        'Authorization',
        `Bearer ${this.decryptData(token)}`
      );
    }

    return this.http.post(
      this.baseUrl + '/api/department-store-department',
      body,
      {
        headers,
      }
    );
  }

  updateDepartment(body: any): Observable<any> {
    const token = localStorage.getItem('token');
    let headers = new HttpHeaders();

    if (token) {
      headers = headers.set(
        'Authorization',
        `Bearer ${this.decryptData(token)}`
      );
    }

    return this.http.post<any>(
      `${this.baseUrl}/api/department-update-department`,
      body,
      { headers }
    );
  }

  getDepartmentDetails(departmentId: number): Observable<any> {
    const token = localStorage.getItem('token');
    let headers = new HttpHeaders();

    if (token) {
      headers = headers.set(
        'Authorization',
        `Bearer ${this.decryptData(token)}`
      );
    }
    return this.http.post<any>(
      `${this.baseUrl}/api/department-show-department`,
      { id: departmentId },
      { headers }
    );
  }

  deleteDepartment(departmentId: number): Observable<any> {
    const token = localStorage.getItem('token');
    let headers = new HttpHeaders();

    if (token) {
      headers = headers.set(
        'Authorization',
        `Bearer ${this.decryptData(token)}`
      );
    }

    return this.http.post(
      `${this.baseUrl}/api/department-destroy-department`,
      { id: departmentId },
      { headers }
    );
  }

  addServiceFeeRule(body: any): Observable<any> {
    const token = localStorage.getItem('token');
    let headers = new HttpHeaders();

    if (token) {
      headers = headers.set(
        'Authorization',
        `Bearer ${this.decryptData(token)}`
      );
    }

    return this.http.post(
      `${this.baseUrl}/api/admin/service-fee-rule-store`,
      body,
      {
        headers,
      }
    );
  }

  updateServiceFeeRule(body: any): Observable<any> {
    const token = localStorage.getItem('token');
    let headers = new HttpHeaders();

    if (token) {
      headers = headers.set(
        'Authorization',
        `Bearer ${this.decryptData(token)}`
      );
    }

    return this.http.post<any>(
      `${this.baseUrl}/api/admin/service-fee-rule-update`,
      body,
      { headers }
    );
  }

  getServiceFeeRule(serviceId: number): Observable<any> {
    const token = localStorage.getItem('token');
    let headers = new HttpHeaders();

    if (token) {
      headers = headers.set(
        'Authorization',
        `Bearer ${this.decryptData(token)}`
      );
    }
    return this.http.post<any>(
      `${this.baseUrl}/api/service-fee-rule-view`,
      { service_id: serviceId },
      { headers }
    );
  }

  deleteServiceFeeRule(id: number): Observable<any> {
    const token = localStorage.getItem('token');
    let headers = new HttpHeaders();

    if (token) {
      headers = headers.set(
        'Authorization',
        `Bearer ${this.decryptData(token)}`
      );
    }

    const body = { id };

    return this.http.post<any>(
      `${this.baseUrl}/api/admin/service-fee-rule-delete`,
      body,
      { headers }
    );
  }

  addRenewalCycle(body: any): Observable<any> {
    const token = localStorage.getItem('token');
    let headers = new HttpHeaders();

    if (token) {
      headers = headers.set(
        'Authorization',
        `Bearer ${this.decryptData(token)}`
      );
    }

    return this.http.post(
      `${this.baseUrl}/api/admin/renewal-cycle-store`,
      body,
      {
        headers,
      }
    );
  }

  getRenewalCycle(serviceId: number): Observable<any> {
    const token = localStorage.getItem('token');
    let headers = new HttpHeaders();

    if (token) {
      headers = headers.set(
        'Authorization',
        `Bearer ${this.decryptData(token)}`
      );
    }
    return this.http.post<any>(
      `${this.baseUrl}/api/renewal-cycle-view`,
      { service_id: serviceId },
      { headers }
    );
  }

  updateRenewalCycle(body: any): Observable<any> {
    const token = localStorage.getItem('token');
    let headers = new HttpHeaders();

    if (token) {
      headers = headers.set(
        'Authorization',
        `Bearer ${this.decryptData(token)}`
      );
    }

    return this.http.post<any>(
      `${this.baseUrl}/api/admin/renewal-cycle-update`,
      body,
      { headers }
    );
  }

  deleteRenewalCycle(id: number): Observable<any> {
    const token = localStorage.getItem('token');
    let headers = new HttpHeaders();

    if (token) {
      headers = headers.set(
        'Authorization',
        `Bearer ${this.decryptData(token)}`
      );
    }

    const body = { id };

    return this.http.post<any>(
      `${this.baseUrl}/api/admin/renewal-cycle-delete`,
      body,
      { headers }
    );
  }

  addRenewalFeeRule(body: any): Observable<any> {
    const token = localStorage.getItem('token');
    let headers = new HttpHeaders();

    if (token) {
      headers = headers.set(
        'Authorization',
        `Bearer ${this.decryptData(token)}`
      );
    }

    return this.http.post(
      `${this.baseUrl}/api/admin/renewal-fee-rule-store`,
      body,
      {
        headers,
      }
    );
  }

  getRenewalFeeRule(serviceId: number): Observable<any> {
    const token = localStorage.getItem('token');
    let headers = new HttpHeaders();

    if (token) {
      headers = headers.set(
        'Authorization',
        `Bearer ${this.decryptData(token)}`
      );
    }
    return this.http.post<any>(
      `${this.baseUrl}/api/renewal-fee-rule-view`,
      { service_id: serviceId },
      { headers }
    );
  }

  updateRenewalFeeRule(body: any): Observable<any> {
    const token = localStorage.getItem('token');
    let headers = new HttpHeaders();

    if (token) {
      headers = headers.set(
        'Authorization',
        `Bearer ${this.decryptData(token)}`
      );
    }

    return this.http.post<any>(
      `${this.baseUrl}/api/admin/renewal-fee-rule-update`,
      body,
      { headers }
    );
  }

  deleteRenewalFeeRule(id: number): Observable<any> {
    const token = localStorage.getItem('token');
    let headers = new HttpHeaders();

    if (token) {
      headers = headers.set(
        'Authorization',
        `Bearer ${this.decryptData(token)}`
      );
    }

    const body = { id };

    return this.http.post<any>(
      `${this.baseUrl}/api/admin/renewal-fee-rule-delete`,
      body,
      { headers }
    );
  }

  getApprovalFlow(serviceId: number): Observable<any> {
    const token = localStorage.getItem('token');
    let headers = new HttpHeaders();

    if (token) {
      headers = headers.set(
        'Authorization',
        `Bearer ${this.decryptData(token)}`
      );
    }
    return this.http.post<any>(
      `${this.baseUrl}/api/service-approval-flow-view`,
      { service_id: serviceId },
      { headers }
    );
  }

  addApprovalFlow(body: any): Observable<any> {
    const token = localStorage.getItem('token');
    let headers = new HttpHeaders().set('Accept', 'application/json');

    if (token) {
      headers = headers.set(
        'Authorization',
        `Bearer ${this.decryptData(token)}`
      );
    }

    return this.http.post(
      `${this.baseUrl}/api/admin/service-approval-flow-store`,
      body,
      { headers }
    );
  }

  updateApprovalFlow(body: any): Observable<any> {
    const token = localStorage.getItem('token');
    let headers = new HttpHeaders();

    if (token) {
      headers = headers.set(
        'Authorization',
        `Bearer ${this.decryptData(token)}`
      );
    }

    return this.http.post<any>(
      `${this.baseUrl}/api/admin/service-approval-flow-update`,
      body,
      { headers }
    );
  }

  deleteApprovalFlow(id: number): Observable<any> {
    const token = localStorage.getItem('token');
    let headers = new HttpHeaders();

    if (token) {
      headers = headers.set(
        'Authorization',
        `Bearer ${this.decryptData(token)}`
      );
    }

    const body = { id };

    return this.http.post<any>(
      `${this.baseUrl}/api/admin/service-approval-flow-delete`,
      body,
      { headers }
    );
  }
getDepartmentalUserProfile(params?: any): Observable<any> {
  const body = params ?? {};
  const headers = this.ensureJsonHeaders(this.getHeaders());
  return this.http.post<any>(
    `${this.baseUrl}/api/department/get-department-users`,
    body,
    { headers }
  );
}
exportDepartmentalUsersExcelAdmin(params?: any): Observable<HttpResponse<Blob>> {
  const body = { ...(params ?? {}), export: 'excel' };
  const headers = this.ensureJsonHeaders(this.getHeaders());
  return this.http.post(
    `${this.baseUrl}/api/admin/fetch-all-department-users`,
    body,
    {
      headers,
      responseType: 'blob' as 'blob',
      observe: 'response' as 'response'
    }
  );
}

exportDepartmentalUsersExcelDept(params?: any): Observable<HttpResponse<Blob>> {
  const body = { ...(params ?? {}), export: 'excel' };
  const headers = this.ensureJsonHeaders(this.getHeaders());
  return this.http.post(
    `${this.baseUrl}/api/department/get-department-users`,
    body,
    {
      headers,
      responseType: 'blob' as 'blob',
      observe: 'response' as 'response'
    }
  );
}


getAdminDepartmentalUserProfile(params?: any): Observable<any> {
  const body = params ?? {};
  const headers = this.ensureJsonHeaders(this.getHeaders());
  return this.http.post<any>(
    `${this.baseUrl}/api/admin/fetch-all-department-users`,
    body,
    { headers }
  );
}

  private ensureJsonHeaders(headers?: HttpHeaders): HttpHeaders {
  const base = headers ?? this.getHeaders();
  return base.has('Content-Type') ? base : base.set('Content-Type', 'application/json');
}
  updateProfile(payload: any): Observable<any> {
    return this.http.post<any>(
      `${this.baseUrl}/api/user/profile-update`,
      payload,
      { headers: this.getHeaders() }
    );
  }
  changePassword(payload: any): Observable<any> {
    return this.http.post<any>(
      `${this.baseUrl}/api/user/change-password`,
      payload,
      { headers: this.getHeaders() }
    );
  }
  getProfile(): Observable<any> {
    return this.http.post<any>(
      `${this.baseUrl}/api/user/get-profile`,
      {},
      { headers: this.getHeaders() }
    );
  }
// inside GenericService
getBusinessUsersDetails(page: number = 1, rowCount: number = 10, search?: string) {
  const body: any = {
    page,
    row_count: rowCount
  };

  if (search && search.toString().trim()) {
    body.search = search.toString().trim();
  }

  return this.http.post<any>(
    `${this.baseUrl}/api/admin/fetch-all-business-users`,
    body,
    { headers: this.getHeaders() }
  );
}

/**
 * Export business users Excel. Returns HttpResponse<Blob> so the component can
 * examine headers & body (file or JSON error).
 */
exportBusinessUsersExcel(params?: any): Observable<HttpResponse<Blob>> {
  const body = { ...(params ?? {}), export: 'excel' };
  const headers = this.ensureJsonHeaders(this.getHeaders());
  return this.http.post(`${this.baseUrl}/api/admin/fetch-all-business-users`, body, {
    headers,
    responseType: 'blob' as 'blob',
    observe: 'response' as 'response'
  });
}

  addHoliday(body: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/api/holidays-store`, body, {
      headers: this.getHeaders(),
    });
  }
  updateHoliday(body: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/api/holidays-update`, body, {
      headers: this.getHeaders(),
    });
  }
  viewHolidays(id: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/api/holidays-view`, id, {
      headers: this.getHeaders(),
    });
  }
  deleteHoliday(id: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/api/holiday-delete`, id, {
      headers: this.getHeaders(),
    });
  }

  generateServiceCertificateGenerate(body: any): Observable<any> {
    return this.http.post<any>(
      `${this.baseUrl}/api/admin/service-template-store`,
      body,
      { headers: this.getHeaders() }
    );
  }

  getServiceCertificateView(serviceId: number): Observable<any> {
    return this.http.post<any>(
      `${this.baseUrl}/api/admin/service-template-show`,
      { service_id: serviceId },
      { headers: this.getHeaders() }
    );
  }

  downloadServiceCertificate(applicationId: any): any {
    return this.http.post<any>(
      `${this.baseUrl}/api/admin/download-application-pdf`,
      { application_id: applicationId },
      { headers: this.getHeaders() }
    );
  }

  downloadUserServiceCertificate(applicationId: any): any {
    return this.http.post<any>(
      `${this.baseUrl}/api/user/download-user-application-pdf`,
      { application_id: applicationId },
      { headers: this.getHeaders() }
    );
  }

  getDashboardData(department_id: any): any {
    return this.http.post<any>(
      `${this.baseUrl}/api/department/get-total-applications-by-department`,
      { department_id: department_id },
      { headers: this.getHeaders() }
    );
  }

  getNocIssuedList(deptId: string, page: number = 1) {
    return this.http.post<any>(
      `${this.baseUrl}/api/department/get-list-of-NOC-issued-by-department`,
      {
        department_id: deptId,
        page: page,
      },
      { headers: this.getHeaders() }
    );
  }

  getIncentivesScheme() {
    return this.http.post<any>(
      `${this.baseUrl}/api/admin/incentive/scheme-list`,
      {},
      { headers: this.getHeaders() }
    );
  }

  getProformasByScheme(proformaId: any) {
    return this.http.post<any>(
      `${this.baseUrl}/api/admin/incentive/proforma-list`,
      {
        scheme_id: proformaId,
      },
      { headers: this.getHeaders() }
    );
  }

  createIncentiveScheme(payload: any) {
    return this.http.post<any>(
      `${this.baseUrl}/api/admin/incentive/scheme-store`,
      payload,
      { headers: this.getHeaders() }
    );
  }
  updateIncentiveScheme(payload: any) {
    return this.http.post<any>(
      `${this.baseUrl}/api/admin/incentive/scheme-update`,
      payload,
      { headers: this.getHeaders() }
    );
  }
  deleteIncentiveScheme(schemeId: any) {
    return this.http.post<any>(
      `${this.baseUrl}/api/admin/incentive/scheme-delete`,
      { id: schemeId },
      { headers: this.getHeaders() }
    );
  }
  createProforma(payload: any) {
    return this.http.post<any>(
      `${this.baseUrl}/api/admin/incentive/proforma-store`,
      payload,
      { headers: this.getHeaders() }
    );
  }
  updateProforma(payload: any) {
    return this.http.post<any>(
      `${this.baseUrl}/api/admin/incentive/proforma-update`,
      payload,
      { headers: this.getHeaders() }
    );
  }
  deleteProforma(proformaId: any) {
    return this.http.post<any>(
      `${this.baseUrl}/api/admin/incentive/proforma-delete`,
      { id: proformaId },
      { headers: this.getHeaders() }
    );
  }
  viewSingleProforma(id: any): Observable<any> {
    return this.http.post<any>(
      `${this.baseUrl}/api/admin/incentive/fetch-proforma-details`,
      { proforma_id: id },
      { headers: this.getHeaders() }
    );
  }
  viewSingleScheme(id: any): Observable<any> {
    return this.http.post<any>(
      `${this.baseUrl}/api/admin/incentive/fetch-scheme-details`,
      { scheme_id: id },
      { headers: this.getHeaders() }
    );
  }
  viewSingleIncentiveQuestion(id: any): Observable<any> {
    return this.http.post<any>(
      `${this.baseUrl}/api/admin/incentive/fetch-proforma-questionnaire-details`,
      { questionnaire_id: id },
      { headers: this.getHeaders() }
    );
  }
  getIncentiveQuestions(proformaId: any) {
    return this.http.post<any>(
      `${this.baseUrl}/api/admin/incentive/proforma-questionnaire-view`,
      {
        proforma_id: proformaId,
      },
      { headers: this.getHeaders() }
    );
  }
  createIncentiveQuestion(payload: any) {
    return this.http.post<any>(
      `${this.baseUrl}/api/admin/incentive/proforma-questionnaire-store`,
      payload,
      { headers: this.getHeaders() }
    );
  }
  //below method is for single view incentive question right now it now in use
  viewIncentiveQuestion(questionId: any) {
    return this.http.post<any>(
      `${this.baseUrl}/api/admin/incentive/proforma-questionnaire-details`,
      { id: questionId },
      { headers: this.getHeaders() }
    );
  }
  updateIncentiveQuestion(payload: any) {
    return this.http.post<any>(
      `${this.baseUrl}/api/admin/incentive/proforma-questionnaire-update`,
      payload,
      { headers: this.getHeaders() }
    );
  }
  deleteIncentiveQuestion(incentiveQuestionId: any) {
    return this.http.post<any>(
      `${this.baseUrl}/api/admin/incentive/proforma-questionnaire-delete`,
      { id: incentiveQuestionId },
      { headers: this.getHeaders() }
    );
  }
  createThirdPartyParams(payload: any) {
    return this.http.post<any>(
      `${this.baseUrl}/api/admin/service-third-party-params-store`,
      payload,
      { headers: this.getHeaders() }
    );
  }
  updateThirdPartyParams(payload: any) {
    return this.http.post<any>(
      `${this.baseUrl}/api/admin/service-third-party-params-update`,
      payload,
      { headers: this.getHeaders() }
    );
  }
  viewThirdPartyParams(thirdPartyId: any) {
    return this.http.post<any>(
      `${this.baseUrl}/api/admin/service-third-party-params-view`,
      { service_id: thirdPartyId },
      { headers: this.getHeaders() }
    );
  }
  deleteThirdPartyParams(thirdPartyId: any) {
    return this.http.post<any>(
      `${this.baseUrl}/api/admin/service-third-party-params-delete`,
      { id: thirdPartyId },
      { headers: this.getHeaders() }
    );
  }
  getSingleDepartmentalUserDetails(deptUserId: any) {
    return this.http.post<any>(
      `${this.baseUrl}/api/admin/get-department-user-details`,
      {
        id: deptUserId,
      },
      { headers: this.getHeaders() }
    );
  }
  updateBusinessUserStatus(userId: any) {
    return this.http.post<any>(
      `${this.baseUrl}/api/admin/update-user-status/${userId.id}`,
      {},
      { headers: this.getHeaders() }
    );
  }
  updateDepartmentalUserStatus(userId: any) {
    return this.http.post<any>(
      `${this.baseUrl}/api/admin/update-user-status/${userId.id}`,
      {},
      { headers: this.getHeaders() }
    );
  }
  getServiceQuestionnaireSection(serviceId: any) {
    return this.http.post<any>(
      `${this.baseUrl}/api/admin/fetch-questionnaire-section`,
      {
        service_id: serviceId,
      },
      { headers: this.getHeaders() }
    );
  }
  updateAdminServiceStatus(serviceId: any) {
    return this.http.post<any>(
      `${this.baseUrl}/api/admin/update-service-status/${serviceId.id}`,
      {},
      { headers: this.getHeaders() }
    );
  }
  getServiceExportExcel(): any {
    return this.http.post(
      `${this.baseUrl}/api/admin/export-services`,
      {},
      {
        headers: this.getHeaders(),
        responseType: 'blob',
      }
    );
  }
  getAllDepartmentalApplicationExportExcel(): any {
    return this.http.post(
      `${this.baseUrl}/api/department/export-service-applications`,
      {},
      {
        headers: this.getHeaders(),
        responseType: 'blob',
      }
    );
  }
  exportApplicationsAsBlob(apiPath: string = 'api/admin/applications/export-full', payload: any = {}): Observable<HttpResponse<Blob>> {
    const path = String(apiPath || '').replace(/^\/+/, '');
    const url = `${this.baseUrl}/${path}`;
    const headers = (typeof (this as any).getHeaders === 'function')
      ? (this as any).getHeaders()
      : new HttpHeaders({ 'Accept': 'application/json' });
    return this.http.post(url, payload, {
      headers,
      observe: 'response' as const,
      responseType: 'blob' as const
    }) as unknown as Observable<HttpResponse<Blob>>;
  }

exportDepartmentalUsersExcel(payload: any): Observable<Blob> {
  const form = new FormData();
  form.append('export', 'excel');

  if (payload?.search && payload.search.trim() !== '') {
    form.append('search', payload.search.trim());
  }

  if (payload?.department_id !== undefined && payload.department_id !== null && payload.department_id !== '') {
    form.append('department_id', String(payload.department_id));
  } else if (payload?.deptId !== undefined && payload.deptId !== null && payload.deptId !== '') {
    form.append('department_id', String(payload.deptId));
  }

  if (payload?.page !== undefined && payload.page !== null) {
    form.append('page', String(payload.page));
  }
  if (payload?.per_page !== undefined && payload.per_page !== null) {
    form.append('per_page', String(payload.per_page));
  }
  let headers = (typeof (this as any).getHeaders === 'function')
    ? (this as any).getHeaders()
    : new HttpHeaders({ 'Accept': 'application/json' });

  if (headers.has('Content-Type')) {
    headers = headers.delete('Content-Type');
  }
  return this.http.post(`${this.baseUrl}/api/admin/fetch-all-department-users`, form, {
    headers,
    responseType: 'blob' as 'blob'
  });
}
  getAllIncentiveApplications(): any {
    return this.http.post(
      `${this.baseUrl}/api/department/incentive/applications`,
      {},
      { headers: this.getHeaders() }
    );
  }
  changeIncentiveStatus(payload: any): any {
    return this.http.post(
      `${this.baseUrl}/api/department/incentive/update-application-status`,
      payload,
      { headers: this.getHeaders() }
    );
  }
  getViewDetailsOfIncentive(applicationId: any): any {
    return this.http.post(
      `${this.baseUrl}/api/department/incentive/application-details`,
      { application_id: applicationId },
      { headers: this.getHeaders() }
    );
  }
  getAllInspectorList(deptId: any): any {
    return this.http.post(
      `${this.baseUrl}/api/inspectors-by-department`,
      { department_id: deptId },
      { headers: this.getHeaders() }
    );
  }
  getUnitsList(): any {
    return this.http.post(
      `${this.baseUrl}/api/unit-list`,
      {},
      { headers: this.getHeaders() }
    );
  }
  getUnitDetails(unitId: number): any {
    return this.http.post(
      `${this.baseUrl}/api/get-unit-details`,
      { id: unitId },
      { headers: this.getHeaders() }
    );
  }
  getInspection(unitId: number | string): any {
    return this.http.post(
      `${this.baseUrl}/api/get-unit-details`,
      { id: unitId },
      { headers: this.getHeaders() }
    );
  }
  getCertificateGenerationVariables(): any {
    return this.http.post(
      `${this.baseUrl}/api/department/certificate-variables-list`,
      {},
      { headers: this.getHeaders() }
    );
  }
  getCertificateApplicationData(appId: any): any {
    return this.http.post(
      `${this.baseUrl}/api/department/user-certificate-view`, { application_id: appId }, { headers: this.getHeaders() }
    )
  }
  previewCertificate(body: any): Observable<Blob> {
    const url = `${this.baseUrl}/api/department/user-certificate-generate`;
    return this.http.post(url, body, { responseType: 'blob', headers: this.getHeaders() }) as Observable<Blob>;
  }
  generateCertificate(payload: any): any {
    return this.http.post(
      `${this.baseUrl}/api/department/user-certificate-generate `, payload, { headers: this.getHeaders() }
    )
  }
  updateInspectionRequestStatus(body: any): Observable<any> {
    return this.http.post<any>(
      `${this.baseUrl}/api/department/update-joint-inspection`,
      body,
      { headers: this.getHeaders() }
    );
  }
  updateInspectionRequesDateChangetStatus(body: any): Observable<any> {
    return this.http.post<any>(
      `${this.baseUrl}/api/department/inspection-date-update-by-inspector`,
      body,
      { headers: this.getHeaders() }
    );
  }
}
