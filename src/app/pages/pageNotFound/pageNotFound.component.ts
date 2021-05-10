
import { Component, PLATFORM_ID, Inject, Optional } from '@angular/core';
import { isPlatformServer, isPlatformBrowser } from '@angular/common';
import { RESPONSE } from '@nguniversal/express-engine/tokens';
import { FooterService } from 'src/app/utils/services/footer.service';
import CONSTANTS from 'src/app/config/constants';

@Component({
    selector: 'pagenot-found',
    templateUrl: './pageNotFound.component.html',
    styleUrls: ['./pageNotFound.component.scss']
})
export class PageNotFoundComponent {
    
    API: {}
    isBrowser: boolean;
    isServer: boolean;

    constructor(
        @Inject(PLATFORM_ID) private platformId: Object,
        @Optional() @Inject(RESPONSE) private response,
        public footerService: FooterService) {

        this.isServer = isPlatformServer(platformId);
        this.isBrowser = isPlatformBrowser(platformId);

    }

    ngOnInit() {
        this.API = CONSTANTS;
        if (isPlatformServer(this.platformId)) {
            this.response.status(404);
        }
        if (this.isBrowser) {
            if (window.outerWidth >= 768) {
                setTimeout(() => {
                    this.footerService.setFooterObj({ footerData: true });
                    this.footerService.footerChangeSubject.next(this.footerService.getFooterObj());
                }, 1000)
            }
            else {
                this.footerService.setMobileFoooters();
            }
        }
        if (this.isServer) {
            this.footerService.setFooterObj({ footerData: true });
            this.footerService.footerChangeSubject.next(this.footerService.getFooterObj());
        }
    }
}