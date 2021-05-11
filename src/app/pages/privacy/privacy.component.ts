import { Component, Renderer2, Inject, PLATFORM_ID } from '@angular/core';
import { Router } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { isPlatformServer, isPlatformBrowser, DOCUMENT } from '@angular/common';
import CONSTANTS from '../../config/constants';

declare let $: any;

@Component({
    selector: 'privacy',
    templateUrl: 'privacy.html',
    styleUrls: ['privacy.scss']
})
export class PrivacyComponent {
    imagePath = CONSTANTS.IMAGE_BASE_URL;
    isServer: boolean;
    isBrowser: boolean;
    constructor(
        private title: Title,
        private _renderer2: Renderer2,
        @Inject(DOCUMENT) private _document,
        private _router: Router,
        @Inject(PLATFORM_ID) platformId) {

        this.isServer = isPlatformServer(platformId);
        this.isBrowser = isPlatformBrowser(platformId);
    }

    ngOnInit() {
        this.title.setTitle("Privacy-Moglix.com");
        if (this.isBrowser) {
            (<HTMLInputElement>document.querySelector("#search-input")).value = "";
            (<HTMLInputElement>document.querySelector("#search-input")).blur();
        }
        if (this.isServer) {
            let links = this._renderer2.createElement('link');
            links.rel = "canonical";
            links.href = CONSTANTS.PROD + this._router.url;
            this._renderer2.appendChild(this._document.head, links);
        }

    }

}
