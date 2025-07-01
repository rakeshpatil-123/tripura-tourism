import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LoaderService {
  private loaderStatus = new BehaviorSubject<boolean>(false);

  getLoaderStatus(): Observable<boolean> {
    return this.loaderStatus.asObservable();

  }

  constructor() { }

  showLoader() {
    this.loaderStatus.next(true);
  }
  hideLoader() {
    this.loaderStatus.next(false);
  }


}
