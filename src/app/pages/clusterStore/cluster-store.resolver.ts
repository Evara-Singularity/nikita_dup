import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { Observable, of } from 'rxjs';
import { first, tap } from 'rxjs/operators';
import { isPlatformServer } from '@angular/common';
import { makeStateKey, TransferState } from '@angular/platform-browser';
import { ClusterStoreService } from './cluster-store.service';


@Injectable()
export class ClusterStoreResolver implements Resolve<any> {

    constructor(
        private clusterStoreService: ClusterStoreService,
        @Inject(PLATFORM_ID) private platformId,
        private transferState: TransferState
    )
    {

    }

    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any>
    {
        let cType = (route.params['type'] as string).trim();
        const CLSUTER_STORE_KEY = makeStateKey<any>('CSSK');
        if (this.transferState.hasKey(CLSUTER_STORE_KEY)) {
            const response = this.transferState.get<any>(CLSUTER_STORE_KEY, null);
            this.transferState.remove(CLSUTER_STORE_KEY);
            return of(response);
        }
        else {
            return this.clusterStoreService.getData(cType)
                .pipe(
                    first(),
                    tap(response =>
                    {
                        if (isPlatformServer(this.platformId)) {
                            this.transferState.set(CLSUTER_STORE_KEY, response);
                        }
                    })
                );
        }
    }
}