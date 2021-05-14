import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { makeStateKey, TransferState } from '@angular/platform-browser';
import {
  Resolve,
  RouterStateSnapshot,
  ActivatedRouteSnapshot
} from '@angular/router';
import { Observable, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators'
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { GlobalLoaderService } from '../services/global-loader.service';


@Injectable({
  providedIn: 'root'
})
export class HomeResolver implements Resolve<object> {

  constructor(
    @Inject(PLATFORM_ID) private platformId,
    private transferState: TransferState,
    private http: HttpClient,
    private loaderService: GlobalLoaderService
  ) { }
  set loaderStatus(value) {
    this.loaderService.setLoaderState(value)
  }
  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<object> {
    this.loaderStatus(true);
    const layoutData = makeStateKey<object>('layout');

    const layOutJSON = environment.BASE_URL + '/homepage/layoutbyjson?requestType=mobile';

    const JSONdata = this.http.get(layOutJSON);

    return JSONdata.pipe(
      catchError((err) => {
        console.log('err', err);
        this.loaderStatus(false);
        return of(err);
      }),
      tap(result => {
        this.transferState.set(layoutData, JSONdata);
        this.loaderStatus(false);
      })
    )
  }

}
