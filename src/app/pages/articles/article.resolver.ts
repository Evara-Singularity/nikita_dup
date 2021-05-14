import { isPlatformServer } from '@angular/common';
import { Inject, Injectable, Optional, PLATFORM_ID } from '@angular/core';
import { makeStateKey, TransferState } from '@angular/platform-browser';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { RESPONSE } from '@nguniversal/express-engine/tokens';
import { Observable, of } from 'rxjs';
import { first, tap } from 'rxjs/operators';
import { ArticleService } from './article.service';


@Injectable()
export class ArticleResolver implements Resolve<any> {

    constructor(
        private articleService: ArticleService,
        @Inject(PLATFORM_ID) private platformId,
        private transferState: TransferState,
        @Optional() @Inject(RESPONSE) private response,
    ) {

    }

    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> {
        let name = (route.params['name'] as string).trim();
        
        const ARTICLE_KEY = makeStateKey<any>('ASRK');
        if (this.transferState.hasKey(ARTICLE_KEY)) {
            const response = this.transferState.get<any>(ARTICLE_KEY, {});
            this.transferState.remove(ARTICLE_KEY);
            return of(response);
        }
        else {
            return this.articleService.getArticlePageData(name)
                .pipe(
                    first(),
                    tap(response => {
                        if (isPlatformServer(this.platformId)) {
                            response['data'] != null ? this.transferState.set(ARTICLE_KEY, response) : this.response.status(404);
                        }
                    })
                );
        }
    }
}