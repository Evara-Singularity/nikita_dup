import { Component, Renderer2, Inject } from '@angular/core';
import { Router } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { DOCUMENT } from '@angular/common';
import {CONSTANTS} from '@app/config/constants';
import { CommonService } from '@app/utils/services/common.service';

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
        public _commonService: CommonService) {

        this.isServer = _commonService.isServer;
        this.isBrowser = _commonService.isBrowser;
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
