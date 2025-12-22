import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthStore } from './auth.store';

// Attach Authorization: Bearer <token> to API calls
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthStore);
  const token = auth.token();

  // Only attach to our API host or proxied /api path
  const isApi = req.url.startsWith('https://localhost:7276/') || req.url.startsWith('/api');

  if (token && isApi) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  return next(req);
};
