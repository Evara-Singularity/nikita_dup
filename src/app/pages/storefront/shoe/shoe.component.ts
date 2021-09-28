import {
	ViewEncapsulation,
	Renderer2,
	ElementRef,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Component } from '@angular/core';
import { CommonService } from '@app/utils/services/common.service';
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
		private route: ActivatedRoute,
		public _commonService: CommonService
	) {
		this.isServer = _commonService.isServer;
        this.isBrowser = _commonService.isBrowser;
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
