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
  set isShowLoader(value) {
    this.loaderService.setLoaderState(value)
  }
  constructor(
    @Inject(PLATFORM_ID) private platformId,
    private transferState: TransferState,
    private http: HttpClient,
    private loaderService: GlobalLoaderService
  ) { }
  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<object> {
    this.isShowLoader = true;
    const layoutData = makeStateKey<object>('layout');

    const layOutJSON = environment.BASE_URL + '/homepage/layoutbyjson?requestType=mobile';

    const JSONdata = this.http.get(layOutJSON);

    return JSONdata.pipe(
      catchError((err) => {
        console.log('err', err);
        this.isShowLoader = false;
        return of(err);
      }),
      tap(result => {
        this.transferState.set(layoutData, JSONdata);
        this.isShowLoader = false;
      })
    )
  }

}
