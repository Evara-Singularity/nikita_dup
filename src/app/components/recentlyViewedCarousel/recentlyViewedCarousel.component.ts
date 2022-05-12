import {
	Component,
	Input,
	NgModule,
	Output,
	Injector,
	ComponentFactoryResolver,
	EventEmitter,
	ViewChild,
  ViewContainerRef,
} from '@angular/core';
import { Router } from '@angular/router';
import { debounceTime, distinctUntilChanged, filter, map } from 'rxjs/operators';

import { LocalStorageService } from 'ngx-webstorage';
import {
	CommonModule,
} from '@angular/common';
import CONSTANTS from '../../config/constants';
import { CommonService } from '../../utils/services/common.service';
import { RouterModule } from '@angular/router';

import { MathFloorPipeModule } from '../../utils/pipes/math-floor';
import { PopUpModule } from '../../modules/popUp/pop-up.module';
import { LazyLoadImageModule } from 'ng-lazyload-image';
import { SiemaCarouselModule } from '../../modules/siemaCarousel/siemaCarousel.module';
import { MathCeilPipeModule } from '../../utils/pipes/math-ceil';
import { CharacterremovePipeModule } from '../../utils/pipes/characterRemove.pipe';
import { ObserveVisibilityDirectiveModule } from '@app/utils/directives/observe-visibility.directive';
import { DataService } from '@app/utils/services/data.service';
import { ENDPOINTS } from '@app/config/endpoints';

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
	defaultImage = CONSTANTS.IMAGE_BASE_URL + CONSTANTS.ASSET_IMG;
	imagePath = CONSTANTS.IMAGE_BASE_URL;
	shortDescParsed: boolean = false;
	recentProductList: Array<any> = [];
	productOutOfStock: boolean = false;
	setCId;
	recentProductsInstance = null;
  @ViewChild("recentProducts", { read: ViewContainerRef })
  recentProductsContainerRef: ViewContainerRef;

	constructor(
		public localStorageService: LocalStorageService,
		public _commonService: CommonService,
		public router: Router,
		private _dataservice: DataService,
		private injector: Injector,
		private cfr: ComponentFactoryResolver,

	) {
		this.isServer = _commonService.isServer;
		this.openPopup = false;
		this.isBrowser = _commonService.isBrowser;
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
						ENDPOINTS.RECENTLY_VIEWED +
						this.setCId
				)
				.subscribe((res) => {
					if (res['statusCode'] === 200) {
						this.recentProductList = res['data'];
						this.prodList = this.recentProductList;
						if (this.prodList && this.prodList.length > 0) {
							this.isDataAvailable.emit(true);
							if (this.prodList.length > this.options.perPage) {
								this.options.loop = true;
							}
							this.prodList.map((product) => {
								//ODP-1837 (Temporary fix)
								if (product.productImage.charAt(0) == "/") product.productImage = product.productImage.substr(1);					
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

	async onVisibleRecentProduct(htmlElement) {
		// console.log('onVisibleRecentProduct', htmlElement);
		if (!this.recentProductsInstance) {
			const { RecentViewedProductsComponent } = await import(
				"./../../components/recent-viewed-products/recent-viewed-products.component"
			);
			const factory = this.cfr.resolveComponentFactory(
				RecentViewedProductsComponent
			);
			this.recentProductsInstance =
				this.recentProductsContainerRef.createComponent(
					factory,
					null,
					this.injector
				);
			this.recentProductsInstance.instance["outOfStock"] =
				this.productOutOfStock;
			const custData = this._commonService.custDataTracking;
			//   const orderData = this.orderTracking;
			//   const TAXONS = this.taxons;
			const page = {
				pageName: null,
				channel: "pdp",
				subSection: "Recently Viewed",
				// linkPageName: `moglix:${TAXONS[0]}:${TAXONS[1]}:${TAXONS[2]}:pdp`,
				linkName: null,
				loginStatus: this._commonService.loginStatusTracking,
			};
			this.recentProductsInstance.instance["analytics"] = {
				page: page,
				custData: custData,
				// order: orderData,
			};
		}
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
		ObserveVisibilityDirectiveModule
	],
	providers: [],
})
export class RecentlyViewedCarouselModule {}
