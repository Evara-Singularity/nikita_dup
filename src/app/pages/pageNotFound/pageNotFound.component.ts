
import { Component, PLATFORM_ID, Inject, Optional } from '@angular/core';
import { isPlatformServer } from '@angular/common';
import { RESPONSE } from '@nguniversal/express-engine/tokens';
import { FooterService } from '@app/utils/services/footer.service';
import CONSTANTS from '@app/config/constants';
import { CommonService } from '@app/utils/services/common.service';
import { Title } from '@angular/platform-browser';

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
        public footerService: FooterService,
        public _commonService: CommonService,
        private title:Title) {

        this.isServer = _commonService.isServer;
        this.isBrowser = _commonService.isBrowser;

    }

    ngOnInit() {
        debugger;
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
        this.title.setTitle("Page Not Found");
    }
}