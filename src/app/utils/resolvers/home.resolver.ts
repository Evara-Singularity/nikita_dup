import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { makeStateKey, TransferState } from '@angular/platform-browser';
import {
  Resolve,
  RouterStateSnapshot,
  ActivatedRouteSnapshot
} from '@angular/router';
import { forkJoin, Observable, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators'
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { isPlatformServer } from '@angular/common';
import { ENDPOINTS } from '@app/config/endpoints';

@Injectable({
  providedIn: 'root'
})
export class HomeResolver implements Resolve<object> {

  constructor(
    @Inject(PLATFORM_ID) private platformId,
    private transferState: TransferState,
    private http: HttpClient,
  ) { }


  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<object> {

    const STATE_KEY = makeStateKey<object>('layout-homepage');

    if (this.transferState.hasKey(STATE_KEY)) {
      const stateObj = this.transferState.get<object>(STATE_KEY, null);
      this.transferState.remove(STATE_KEY);
      return of([stateObj]);
    } else {
      const LAYOUT_URL = environment.BASE_URL + ENDPOINTS.GET_LAYOUT_HOME;
      const stateObs = this.http.get(LAYOUT_URL);
      // forkJoin is implemented as we might need to add more APIs to resolvers
      return forkJoin([stateObs]).pipe(
        catchError((err) => {
          return of(err);
        }),
        tap(result => {
          if (isPlatformServer(this.platformId)) {
            //this.loaderService.setLoaderState(false);
            this.transferState.set(STATE_KEY, result[0]);
          }
        })
      )
    }

  }

}
