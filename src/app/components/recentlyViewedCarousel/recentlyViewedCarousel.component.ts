import {
	Component,
	Input,
	PLATFORM_ID,
	Inject,
	NgModule,
	Output,
	EventEmitter,
} from '@angular/core';
import { Router } from '@angular/router';
import { LocalStorageService } from 'ngx-webstorage';
import {
	isPlatformServer,
	isPlatformBrowser,
	CommonModule,
} from '@angular/common';
import CONSTANTS from '../../config/constants';
import { LocalAuthService } from '../../utils/services/auth.service';
import { CommonService } from '../../utils/services/common.service';
import { RouterModule } from '@angular/router';

import { MathFloorPipeModule } from '../../utils/pipes/math-floor';
import { PopUpModule } from '../../modules/popUp/pop-up.module';
import { LazyLoadImageModule } from 'ng-lazyload-image';
import { SiemaCarouselModule } from '../../modules/siemaCarousel/siemaCarousel.module';
import { MathCeilPipeModule } from '../../utils/pipes/math-ceil';
import { CharacterremovePipeModule } from '../../utils/pipes/characterRemove.pipe';
import { DataService } from '@app/utils/services/data.service';

@Component({
	selector: 'recently-viewed-carousel',
	templateUrl: './recentlyViewedCarousel.html',
	styleUrls: ['./recentlyViewedCarousel.scss'],
})
export class RecentlyViewedCarouselComponent {
	@Input() clickFromSection: String;
	@Output() isDataAvailable: EventEmitter<boolean> = new EventEmitter<
		boolean
	>();
	@Input() prodList: any;
	@Input() showHeading: boolean = true;
	options;
	openPopup: boolean;
	isBrowser: boolean;
	categoryNameFromHomePage;
	isServer: boolean = typeof window !== 'undefined' ? false : true;
	isMobile: boolean;
	defaultImage = CONSTANTS.IMAGE_BASE_URL + 'assets/img/home_card.webp';
	imagePath = CONSTANTS.IMAGE_BASE_URL;
	shortDescParsed: boolean = false;
	recentProductList: Array<any> = [];
	setCId;

	constructor(
		public localStorageService: LocalStorageService,
		private _localAuthService: LocalAuthService,
		public _commonService: CommonService,
		public router: Router,
		@Inject(PLATFORM_ID) private platformId: Object,
		private _dataservice: DataService
	) {
		this.isServer = isPlatformServer(platformId);
		this.openPopup = false;
		this.isBrowser = isPlatformBrowser(platformId);
	}

	ngOnInit() {
		if (!this.isServer) {
			if (window.outerWidth < 768) {
				this.isMobile = true;
			} else {
				this.isMobile = false;
			}
		}
		this.options = {
			selector: '.recently-viewed-component',
			duration: 500,
			easing: 'ease-out',
			perPage: 7,
			startIndex: 0,
			draggable: false,
			threshold: 20,
			loop: false,
			recently: true,
		};
		if (this.isMobile) {
			this.options.perPage = 2;
		}
		if (this.isBrowser) {
			let user_id = this.localStorageService.retrieve('user');

			if (user_id && user_id['userId']) {
				this.setCId = user_id['userId'];
			} else {
				this.setCId = null;
			}

			this._dataservice
				.callRestful(
					'GET',
					CONSTANTS.NEW_MOGLIX_API +
						'/recentlyviewed/getRecentlyViewd?customerId=' +
						this.setCId
				)
				.subscribe((res) => {
					if (res['statusCode'] === 200) {
						this.recentProductList = res['data'];
						this.prodList = this.recentProductList;
						if (this.prodList && this.prodList.length > 0) {
							this.isDataAvailable.emit(true);
							console.log('data hai');
							if (this.prodList.length > this.options.perPage) {
								this.options.loop = true;
							}
							this.prodList.map((product) => {
								if (
									product &&
									product.shortDesc &&
									typeof product.shortDesc === 'string'
								) {
									let shortDesc = [];
									let result = product.shortDesc.split('||');
									result.forEach((element) => {
										let keyvalue = element.split(':');
										shortDesc.push({ key: keyvalue[0], value: keyvalue[1] });
									});
									product.shortDesc = shortDesc;
								}
							});
							this.shortDescParsed = true;
						} else {
							this.isDataAvailable.emit(false);
						}
					}
				});
		}
	}

	outData(data) {
		this[data.selector] = !this[data.selector];
	}

	viewAllClicked() {
		setTimeout(() => {
			document
				.querySelector(
					'.screen-view.popup.info-update-popup.payment-popup .container .content-popup'
				)
				.addEventListener(
					'scroll',
					() => {
						window.scrollTo(window.scrollX, window.scrollY + 1);
						window.scrollTo(window.scrollX, window.scrollY - 1);
					},
					{ passive: true }
				);
		}, 0);
		setTimeout(() => {
			window.scrollTo(window.scrollX, window.scrollY + 1);
			window.scrollTo(window.scrollX, window.scrollY - 1);
			window.dispatchEvent(new Event('resize'));
		}, 100);
	}

	goToProducturl(url) {
		this._commonService.setGaGtmData({ list: 'home-recently viewed' });
		this._commonService.setSectionClickInformation(
			this.clickFromSection,
			'pdp'
		);
		this.router.navigateByUrl(url);
	}

	setCookieLink(catName, categoryCodeorBannerName) {
		var date = new Date();
		date.setTime(date.getTime() + 30 * 24 * 60 * 60 * 1000);
		document.cookie =
			'adobeClick=' +
			catName +
			'_' +
			categoryCodeorBannerName +
			'; expires=' +
			date.toUTCString() +
			';path=/';
	}
}

@NgModule({
	declarations: [RecentlyViewedCarouselComponent],
	imports: [
		CommonModule,
		MathFloorPipeModule,
		PopUpModule,
		RouterModule,
		CharacterremovePipeModule,
		LazyLoadImageModule,
		SiemaCarouselModule,
		MathCeilPipeModule,
		PopUpModule,
	],
	providers: [],
})
export class RecentlyViewedCarouselModule {}
