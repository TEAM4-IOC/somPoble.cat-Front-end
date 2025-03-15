import { Injectable } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LoadingService {
  loadingRequestCount = 0;
  private isLoadingSubject = new BehaviorSubject<boolean>(false);
  isLoading$ = this.isLoadingSubject.asObservable(); // Observable accesible en el HTML

  constructor(private spinnerService:NgxSpinnerService) { }

  loading() {
    this.loadingRequestCount++;
    this.isLoadingSubject.next(true);
    this.spinnerService.show(undefined, {
      type: 'pacman',
      bdColor: 'rgba(25, 25, 25, 0.8)',
      color: '#fff',
      size: 'default'
    });
  }

  idle() {
    this.loadingRequestCount--;
    if (this.loadingRequestCount <= 0) {
      this.loadingRequestCount = 0;
      this.isLoadingSubject.next(false);
      this.spinnerService.hide();
    }
  }
}