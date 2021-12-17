import { Component, Inject, OnInit, Optional } from '@angular/core';
import { Title } from '@angular/platform-browser';
import CONSTANTS from '@app/config/constants';
import { CommonService } from '@app/utils/services/common.service';
import { FooterService } from '@app/utils/services/footer.service';
import { RESPONSE } from '@nguniversal/express-engine/tokens';

@Component({
    selector: 'app-shared-not-found',
    templateUrl: './shared-not-found.component.html',
    styleUrls: ['./shared-not-found.component.scss']
})
export class SharedNotFoundComponent implements OnInit {

    API: {}
    isBrowser: boolean;
    isServer: boolean;

    constructor(
        @Optional() @Inject(RESPONSE) private response,
        public footerService: FooterService,
        public _commonService: CommonService,
        private title:Title
    ) {

        this.isServer = _commonService.isServer;
        this.isBrowser = _commonService.isBrowser;

    }

    ngOnInit() {
        debugger;
        this.API = CONSTANTS;
        if (this.isServer) {
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
