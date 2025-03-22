import { HttpInterceptorFn } from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { inject } from '@angular/core';
import { Router } from '@angular/router';

export const interceptorError: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  return next(req).pipe(
    catchError((error) => {
      console.error('Error Interceptor: An error occurred', error);

      if (error.status === 400) {
        console.error('Bad Request (400):', error.error?.message);
      } else if (error.status === 404) {
        console.error('Not Found (404):', error.error?.message);
        router.navigate(['/not-found']);
      } else {
        console.error('Unhandled error status:', error.status);
      }

      return throwError(() => error);
    })
  );
};
