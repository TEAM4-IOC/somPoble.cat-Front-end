import { HttpInterceptorFn, HttpEvent, HttpHandlerFn, HttpRequest, HttpResponse } from '@angular/common/http';
import { tap } from 'rxjs/operators';
import { Observable } from 'rxjs';

export const authInterceptorFn: HttpInterceptorFn = (req: HttpRequest<any>, next: HttpHandlerFn): Observable<HttpEvent<any>> => {
  return next(req).pipe(
    tap((event) => {
      if (event instanceof HttpResponse && event.status === 200) {
        console.log('✅ Respuesta 200 detectada:', event.body);

        // Filtrar si la respuesta viene del login
        if (req.url.includes('/login')) {  
          console.log('Respuesta del LOGIN detectada:', event.body);
        } else {
          console.log('Respuesta de otra petición detectada:', event.body);
        }
      }
    })
  );
};



