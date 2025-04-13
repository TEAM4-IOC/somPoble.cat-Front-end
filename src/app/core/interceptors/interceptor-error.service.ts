import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';

export const interceptorError: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const translate = inject(TranslateService);

  return next(req).pipe(
    catchError((error: unknown) => {
      if (error instanceof HttpErrorResponse) {
        console.error('Error Interceptor: An error occurred', error);

        switch (error.status) {
          case 400:
            console.error('Bad Request (400):', error.error?.message);
            break;
          case 404:
            console.error('Not Found (404):', error.error?.message);
            router.navigate(['/not-found']);
            break;
          case 500:
            console.error('Internal Server Error (500):', error.error?.message);
            window.alert(translate.instant('interceptor.error_500'));
            router.navigate(['/not-found']);
            break;
          default:
            console.error('Unhandled error status:', error.status);
            break;
        }
      } else {
        console.error('Unexpected error:', error);
      }
      return throwError(() => error);
    })
  );
};
