import { ViewEncapsulation, Renderer2, ElementRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Component } from '@angular/core';

@Component({
	selector: 'power-tools',
	templateUrl: './power-tools.html',
	styleUrls: ['./power-tools.scss'],
	encapsulation: ViewEncapsulation.None,
})
export class PowerToolsComponent {
	powerData: any;
	bannerCarsl = [1, 2, 3, 4];
	branddata = [1, 2, 3, 4, 5, 6, 7, 8];
	logoCarsl = [1, 2, 3, 4, 5, 6];
	isServer: boolean = typeof window !== 'undefined' ? false : true;
	constructor(
		private elementRef: ElementRef,
		private _renderer2: Renderer2,
		public router: Router,
		private route: ActivatedRoute
	) {}
	ngOnInit() {
		this.route.data.subscribe((rawData) => {
			if (!rawData['data']['error']) {
				this.powerData = rawData['data'];
				setTimeout(() => {
					// wait for DOM rendering
					this.reinsertLinks();
				}, 0);
			}
		});
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
