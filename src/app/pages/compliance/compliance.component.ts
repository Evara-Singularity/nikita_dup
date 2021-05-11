import { Component, Renderer2, Inject, PLATFORM_ID } from '@angular/core';
import { Router } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { isPlatformServer, isPlatformBrowser, DOCUMENT } from '@angular/common';
import CONSTANTS from 'src/app/config/constants';

declare let $: any;

@Component({
    selector: 'compliance',
    templateUrl: 'compliance.html',
    styleUrls: ['compliance.scss']
})

export class ComplianceComponent {

    API = CONSTANTS;

    isBrowser: boolean;
    isServer: boolean;

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

        this.title.setTitle("Compliance-Moglix.com");
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
