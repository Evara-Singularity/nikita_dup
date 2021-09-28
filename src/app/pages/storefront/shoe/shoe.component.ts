import {
	ViewEncapsulation,
	Inject,
	PLATFORM_ID,
	Renderer2,
	ElementRef,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { isPlatformServer, isPlatformBrowser } from '@angular/common';
import { Component } from '@angular/core';
@Component({
	selector: 'shoe',
	templateUrl: 'shoe.html',
	styleUrls: ['shoe.scss'],
	encapsulation: ViewEncapsulation.None,
})
export class ShoeComponent {
	isServer: boolean;
	isBrowser: boolean;
	shoeData: any;
	constructor(
		private elementRef: ElementRef,
		private _renderer2: Renderer2,
		public router: Router,
		@Inject(PLATFORM_ID) private platformId: Object,
		private route: ActivatedRoute
	) {
		this.isServer = isPlatformServer(this.platformId);
		this.isBrowser = isPlatformBrowser(this.platformId);
	}

	ngOnInit() {
		this.route.data.subscribe((rawData) => {
			if (!rawData['shoeData']['error']) {
				this.shoeData = rawData['shoeData'];
			}
		});
		setTimeout(() => {
			// wait for DOM rendering
			this.reinsertLinks();
		}, 0);
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
