import { Component, Renderer2, Inject } from '@angular/core';
import { Router } from '@angular/router';
import { DOCUMENT } from '@angular/common';
import { Title } from '@angular/platform-browser';
import CONSTANTS from '@app/config/constants';
import { FooterService } from '@app/utils/services/footer.service';
import { CommonService } from '@app/utils/services/common.service';
declare let $: any;

@Component({
    selector: 'press',
    templateUrl: 'terms.html',
    styleUrls: ['terms.scss']
})

export class TermsComponent {
    API: {};
    imagePath = CONSTANTS.IMAGE_BASE_URL;
    isBrowser: boolean;
    isServer: boolean;
    constructor(
        private title: Title,
        private _renderer2: Renderer2,
        private _router: Router,
        @Inject(DOCUMENT) private _document,
        public footerService: FooterService,
        public _commonService: CommonService) {
        this.isServer = _commonService.isServer;
        this.isBrowser = _commonService.isBrowser;
    }

    ngOnInit() {
        this.API = CONSTANTS;
        this.title.setTitle("Terms-Moglix.com");

        if (this.isBrowser) {
            (<HTMLInputElement>document.querySelector("#search-input")).value = "";
            (<HTMLInputElement>document.querySelector("#search-input")).blur();

            if (window.outerWidth >= 768) {
                this.footerService.setFooterObj({ footerData: false });
                this.footerService.footerChangeSubject.next(this.footerService.getFooterObj());
            }
            else {
                this.footerService.setMobileFoooters();
            }
        }

        if (this.isServer) {
            this.footerService.setFooterObj({ footerData: false });
            this.footerService.footerChangeSubject.next(this.footerService.getFooterObj());
        }

        if (this.isServer) {
            let links = this._renderer2.createElement('link');
            links.rel = "canonical";
            links.href = CONSTANTS.PROD + this._router.url;
            this._renderer2.appendChild(this._document.head, links);
        }

    }
}
