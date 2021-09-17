import { DOCUMENT } from '@angular/common';
import {
	Component,
	Inject,
	OnInit,
	Optional,
	Renderer2,
} from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import CONSTANTS from '@app/config/constants';
import { CommonService } from '@app/utils/services/common.service';
import { RESPONSE } from '@nguniversal/express-engine/tokens';

@Component({
	selector: 'app-popular-search',
	templateUrl: './popular-search.component.html',
	styleUrls: ['./popular-search.component.scss'],
})
export class PopularSearchComponent implements OnInit {
	categories: any[] = [];
	isServer;
	isBrowser;
	constructor(
		@Optional() @Inject(RESPONSE) private response,
		private title: Title,
		private route: ActivatedRoute,
		private _renderer2: Renderer2,
		@Inject(DOCUMENT) private _document,
		public _router: Router,
		public _commonService: CommonService
	) {
		this.isServer = _commonService.isServer;
        this.isBrowser = _commonService.isBrowser;
	}

	ngOnInit() {
		if (this.route.snapshot.data['searchTerms']) {
			let response = this.route.snapshot.data['searchTerms'];
			if (response['statusCode'] === 200 && response['data'] != null) {
				this.categories = response['data'];
			} else {
				this.categories = [];
				this.response.status(404);
			}
		}
		if (this.isBrowser) {
			this.setTitle();
		}
		if (this.isServer) {
			this.setTitle();
			this.setCanonicalUrls();
		}
	}

	setTitle() {
		this.title.setTitle('Popular Search Terms on Moglix');
	}

	setCanonicalUrls() {
		if (this.isServer) {
			const links = this._renderer2.createElement('link');
			const currentRoute = this._router.url.split('?')[0].split('#')[0];
			links.rel = 'canonical';
			links.href = CONSTANTS.PROD + currentRoute.toLowerCase();
			this._renderer2.appendChild(this._document.head, links);
		}
	}
}
