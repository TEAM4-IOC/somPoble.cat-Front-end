import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SessionService {
  private sessionSubject = new BehaviorSubject<boolean>(this.hasSession());
  session$ = this.sessionSubject.asObservable();

  private hasSession(): boolean {
    return !!localStorage.getItem('session');
  }

  updateSession(): void {
    this.sessionSubject.next(this.hasSession());
  }

  logout(): void {
    localStorage.removeItem('session');
    this.sessionSubject.next(false);
  }
}
