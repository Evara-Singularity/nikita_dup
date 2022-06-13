import {
	Component,
	Input,
	NgModule,
} from '@angular/core';
import { Router } from '@angular/router';
import { LocalStorageService } from 'ngx-webstorage';
import { CommonModule } from '@angular/common';
import CONSTANTS from '../../config/constants';
import { CommonService } from '../../utils/services/common.service';
import { RouterModule } from '@angular/router';
import { DataService } from '@app/utils/services/data.service';
import { ENDPOINTS } from '@app/config/endpoints';
import { ProductsEntity } from '@app/utils/models/product.listing.search';
import { ProductService } from '@app/utils/services/product.service';
import { ProductCardVerticalGridViewModule } from '@app/modules/product-card/product-card-vertical-grid-view/product-card-vertical-grid-view.module';
import { ProductCardSkeletonModule } from '@app/modules/product-card/product-card-skeleton/product-card-skeleton.module';
import { ProductCardVerticalContainerModule } from '@app/modules/ui/product-card-vertical-container/product-card-vertical-container.module';
import { ProductCardHorizontalGridViewModule } from '@app/modules/product-card/product-card-horizontal-grid-view/product-card-horizontal-grid-view.module';
import { ProductCardHorizontalScrollModule } from '@app/modules/ui/product-card-horizontal-scroll/product-card-horizontal-scroll.module';

@Component({
	selector: 'recently-viewed-carousel',
	templateUrl: './recentlyViewedCarousel.html',
	styleUrls: ['./recentlyViewedCarousel.scss'],
})
export class RecentlyViewedCarouselComponent {

	@Input() clickFromSection: String;
	isBrowser: boolean;
	isServer: boolean;

	recentlyViewedProducts: ProductsEntity[] = [];
	isRecentDataLoaded: boolean = false;

	constructor(
		public localStorageService: LocalStorageService,
		public _commonService: CommonService,
		public router: Router,
		private _dataservice: DataService,
		private _productService: ProductService,
	) {
		this.isServer = _commonService.isServer;
		this.isBrowser = _commonService.isBrowser;
	}

	ngOnInit() {
		if (this.isBrowser) {
			let user_id = this.localStorageService.retrieve('user');
			this.getRecentViewed(user_id['userId'] || 'null');
		}
	}

	private getRecentViewed(setCId) {
		this._dataservice
			.callRestful(
				'GET',
				CONSTANTS.NEW_MOGLIX_API +
				ENDPOINTS.RECENTLY_VIEWED +
				setCId
			)
			.subscribe((res) => {
				if ((res['statusCode'] === 200) && res['data'] && res['data'].length > 0) {
					this.recentlyViewedProducts = (res['data'] as any[]).map((item) => this._productService.recentProductResponseToProductEntity(item));
				}
				this.isRecentDataLoaded = true;
			});
	}

	outData(data) {
		this[data.selector] = !this[data.selector];
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
		RouterModule,
		ProductCardHorizontalGridViewModule,
		ProductCardSkeletonModule,
		ProductCardVerticalContainerModule,
		ProductCardHorizontalScrollModule
	],
	providers: [],
})
export class RecentlyViewedCarouselModule { }
