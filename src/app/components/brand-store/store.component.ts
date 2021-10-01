import {
	Component,
	ViewEncapsulation,
	Renderer2,
	Inject,
	PLATFORM_ID,
	ElementRef,
} from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { isPlatformServer, isPlatformBrowser, DOCUMENT } from '@angular/common';
import { Title, Meta, TransferState } from '@angular/platform-browser';
import CONSTANTS from '@app/config/constants';
import { ClientUtility } from '@app/utils/client.utility';

@Component({
	selector: 'store',
	templateUrl: 'store.html',
	styleUrls: ['store.scss'],
	encapsulation: ViewEncapsulation.None,
})
export class StoreComponent {
	bosch = 'cm755792';
	godrej = 'cm104867';
	havells = 'cm484415';
	vguard = 'cm987844';
	eveready = 'cm604845';
	luminous = 'cm849659';
	makita = 'cm106721';
	karam = 'cm338483';
	philips = 'cm645889';
	threem = 'cm909874';
	blackDecker = 'cm105550';
    dewalt = 'cm709642';
    stanley = 'cm523993';
	storeData: any;
	isServer: boolean;
	isBrowser: boolean;
	constructor(
		private elementRef: ElementRef,
		private _tState: TransferState,
		private _renderer2: Renderer2,
		@Inject(DOCUMENT) private _document,
		@Inject(PLATFORM_ID) private platformId: Object,
		public _router: Router,
		private meta: Meta,
		private _activatedRoute: ActivatedRoute,
		private title: Title,
		private router: Router,
		private route: ActivatedRoute
	) {
		let path = this.router.url.split('?');
		path = path[0].split('/');
		this.isServer = isPlatformServer(platformId);
		this.isBrowser = isPlatformBrowser(platformId);
		this.route.data.subscribe((rawData) => {
			if (!rawData['data']['error']) {
				this.storeData = rawData['data'];
			}
		});
		if (this.isBrowser) {
			ClientUtility.scrollToTop(100);
		}
		this.getStoreData(path);
	}

	getStoreData(path) {
		let id = '';
		let video = '';
		let title = '';
		let description = '';
		switch (path[2]) {
			case 'bosch': {
				id = this.bosch;
				video = 'https://www.youtube.com/embed/lQWkyd57w-4';
				break;
			}
			case 'havells': {
				id = this.havells;
				video = 'https://www.youtube.com/embed/sEuGVFjZoGY';
				break;
			}
			case 'vguard': {
				id = this.vguard;
				video = 'https://www.youtube.com/embed/1Mqvuhku4P8';
				break;
			}
			case 'eveready': {
				id = this.eveready;
				video = 'https://www.youtube.com/embed/oqSjaOfu0FU';
				break;
			}
			case 'luminous': {
				id = this.luminous;
				video = 'https://www.youtube.com/embed/2P_7yozwhcM';
				break;
			}
			case 'makita': {
				id = this.makita;
				video = 'https://www.youtube.com/embed/9FdvPVBEYio';
				break;
			}
			case 'karam': {
				id = this.karam;
				video = 'https://www.youtube.com/embed/zzwEPqYzXyI';
				break;
			}
			case 'philips': {
				id = this.philips;
				video = 'https://www.youtube.com/embed/ixq6S3DEiV8';
				break;
			}
			case '3m': {
				id = this.threem;
				video = 'https://www.youtube.com/embed/9-y6EwJD7hQ';
				break;
			}
			case 'godrej': {
				id = this.godrej;
				video = 'https://www.youtube.com/embed/1lfvvQb9PPs';
				break;
			}
			case 'dewalt': {
				id = this.dewalt;
				video = 'https://www.youtube.com/embed/jYG_wjXMZ0g';
				break;
			}
			case 'stanley': {
				id = this.stanley;
				video = 'https://www.youtube.com/embed/1UtBRAOtI7I';
				break;
			}
			case 'black-decker': {
				id = this.blackDecker;
				video = 'https://www.youtube.com/embed/aqXDENG5MC8';
				break;
			}
		}
		title = path[2] + ' Brand Store';
		description =
			'Get to know more about ' +
			path[2] +
			' brand. Shop bestsellers and range of exclusive products from ' +
			path[2] +
			' at Moglix';
		this.title.setTitle(title);
		this.meta.addTag({ property: 'og:title', content: title });
		this.meta.addTag({ property: 'og:description', content: description });
		this.meta.addTag({
			property: 'og:url',
			content: CONSTANTS.PROD + '/brand-store/' + path[2],
		});
		this.meta.addTag({
			name: 'description',
			content:
				'Get to know more about ' +
				path[2] +
				' brand. Shop bestsellers and range of exclusive products from ' +
				path[2] +
				' at Moglix',
		});
		if (this.isServer) {
			let links = this._renderer2.createElement('link');
			links.rel = 'canonical';
			links.href =
				CONSTANTS.PROD + this._router.url.split('?')[0].split('#')[0];
			this._renderer2.appendChild(this._document.head, links);
		}
		setTimeout(() => {
			// wait for DOM rendering
			this.reinsertLinks();
		}, 0);
		setTimeout(() => {
			if (!this.isServer) {
				if (typeof window != undefined && document) {
					document.querySelector('.video_container').innerHTML =
						'<iframe width="600" height="400" src="' +
						video +
						'" frameborder="0" allowfullscreen></iframe>';
				}
			}
		}, 500);
	}
	
	reinsertLinks() {
		const links = <HTMLAnchorElement[]>(
			this.elementRef.nativeElement.getElementsByTagName('a')
		);

		if (links) {
			const linksInitialLength = links.length;
			for (let i = 0; i < linksInitialLength; i++) {
				const link = links[i];

				if (link.host === window.location.host) {
					this._renderer2.listen(link, 'click', (event) => {
						event.preventDefault();
						this.router.navigate([
							link.href
								.replace(link.host, '')
								.replace(link.protocol, '')
								.replace('//', ''),
						]);
					});
				}
			}
		}
	}
}
