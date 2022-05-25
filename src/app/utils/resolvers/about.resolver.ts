import {
  Router, Resolve,
  RouterStateSnapshot,
  ActivatedRouteSnapshot
} from '@angular/router';
import { Observable, of } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import CONSTANTS from '@app/config/constants';
import { catchError, tap } from 'rxjs/operators';
import { makeStateKey, TransferState } from '@angular/platform-browser';
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { isPlatformServer } from '@angular/common';

@Injectable({
  providedIn: 'root'
})


export class AboutResolver implements Resolve<boolean> {

  constructor(
    @Inject(PLATFORM_ID) private platformId,
    private http: HttpClient,
    private transferState: TransferState,
  ) { }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {

    const ABOUT_US_KEY = makeStateKey<any>('ABOUTUS');
    if (this.transferState.hasKey(ABOUT_US_KEY)) {
      const response = this.transferState.get<any>(ABOUT_US_KEY, null);
      this.transferState.remove(ABOUT_US_KEY);
      return of(response);
    }
    else {
      const url = CONSTANTS.NEW_MOGLIX_API + '/category/getparentcategoryjsonbody?requestType=about-us_d';
      return this.http.get(url)
        .pipe(
          catchError((err) => { return of(err); }),
          tap(response => {
            if (isPlatformServer(this.platformId)) {
              this.transferState.set(ABOUT_US_KEY, response);
            }
          })
        );
    }
  }
}
