import { CommonModule } from '@angular/common';
import {
	Component,
	Input,
	Output,
	EventEmitter,
	NgModule,
	OnInit,
} from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonService } from '../../utils/services/common.service';
import { LazyLoadImageModule } from 'ng-lazyload-image';
import { ObserveVisibilityDirectiveModule } from '../../utils/directives/observe-visibility.directive';
import { ProductCardFeature, ProductsEntity } from '@app/utils/models/product.listing.search';
import { ProductCardHorizontalScrollModule } from '../ui/product-card-horizontal-scroll/product-card-horizontal-scroll.module';
import { ProductCardVerticalContainerModule } from '@app/modules/ui/product-card-vertical-container/product-card-vertical-container.module';
import { ProductCardVerticalGridViewModule } from '../product-card/product-card-vertical-grid-view/product-card-vertical-grid-view.module';
import { ProductCardHorizontalGridViewModule } from '../product-card/product-card-horizontal-grid-view/product-card-horizontal-grid-view.module';
import { ProductCardVerticalBlockViewModule } from '../product-card/product-card-vertical-block-view/product-card-vertical-block-view.module';
import { ProductService } from '@app/utils/services/product.service';
import { CONSTANTS } from '@app/config/constants';
import { GlobalAnalyticsService } from '@app/utils/services/global-analytics.service';



@Component({
	selector: 'home-categories',
	templateUrl: './categories.component.html',
	styleUrls: ['./categories.component.scss'],
})
export class Categories implements OnInit {
	@Input('middleImageJsonData') middleImageJsonData;
	@Input('categories') categories;
	@Input('carouselData') carouselData;
	@Input('defaultImage') defaultImage;
	@Input('imagePath') imagePath;
	@Input('recentProductList') recentProductList;
	@Output('sendDataToPopUP') sendDataToPopUP = new EventEmitter();
	readonly produrl=CONSTANTS.PROD;
	readonly oosSimilarcardFeaturesConfig: ProductCardFeature = {
		// feature config
		enableAddToCart: false,
		enableBuyNow: false,
		enableFeatures: false,
		enableRating: true,
		enableVideo: false,
		// design config
		enableCard: false,
		verticalOrientation: true,
		horizontalOrientation: false,
		lazyLoadImage: false
	}
	readonly cardFeaturesConfig: ProductCardFeature = {
		// feature config
		enableAddToCart: true,
		enableBuyNow: true,
		enableFeatures: false,
		enableRating: true,
		enableVideo: false,
		// design config
		enableCard: true,
		verticalOrientation: true,
		horizontalOrientation: false,
		verticalOrientationV2: true,
		lazyLoadImage: false
	}
	openPopup;
	categoryNameFromHomePage;
	readonly imageCdnPath = CONSTANTS.IMAGE_BASE_URL;

	constructor(
		public _commonService: CommonService,
		private _productService: ProductService,
		private _analytics: GlobalAnalyticsService,
	) {}

	getCategoryLabel(categoryName) {
		this.categoryNameFromHomePage = categoryName;
		setTimeout(() => {
			window.scrollTo(window.scrollX, window.scrollY + 1);
			window.scrollTo(window.scrollX, window.scrollY - 1);
		}, 100);
	}

	ngOnInit(): void {
		// console.log('carouselData before =====>', this.carouselData);
		// this.carouselData = (ncd as any[]).map(product => this.productService.searchResponseToProductEntity(product));
		for (let i = 0; i < this.categories.length; i++) {
			if (this.categories[i]['dataKey'] && this.carouselData[this.categories[i]['dataKey']]) {
				for (let j = 0; j < this.carouselData[this.categories[i]['dataKey']]['data']['product_data'].length; j++) {
					const producModified = this._productService.productLayoutJsonToProductEntity(this.carouselData[this.categories[i]['dataKey']]['data']['product_data'][j], "", "");
					this.carouselData[this.categories[i]['dataKey']]['data']['product_data'][j] = producModified;
				}
			}
		}
		// console.log('carouselData after =====>', this.carouselData);
	}

	setCategoryorBrandCookie(categoryName, type) {
		this._commonService.setSectionClickInformation('homepage', 'listing');
		var date = new Date();
		date.setTime(date.getTime() + 30 * 24 * 60 * 60 * 1000);
		if (type === 'tbrand') {
			document.cookie =
				'adobeClick=' +
				'Brand' +
				'_' +
				categoryName +
				'; expires=' +
				date.toUTCString() +
				';path=/';
		} else if (type === 'tcat') {
			document.cookie =
				'adobeClick=' +
				'Category' +
				'_' +
				categoryName +
				'; expires=' +
				date.toUTCString() +
				';path=/';
		}
	}

	setCookieLink(catName, categoryCodeorBannerName, type) {
		this._commonService.setSectionClickInformation('homepage', type);
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

	getBrandName(brand_description) {
		const ParsebrandName = brand_description.split('||');
		const brandName = ParsebrandName[0]; // brandName i,e Brand: ABC at 0th Position
		const afterRemoveBrandWord = brandName.replace('Brand:', '');
		return afterRemoveBrandWord;
	}

	beforeDiscount(afterDiscountPrice, discount_percentage) {
		const val = 100 / (100 - discount_percentage);
		const val2 = Math.round(val * 100) / 100;
		const original = afterDiscountPrice * val2;
		const removeDecimal = Math.round(original * 100) / 100;
		const newValue = Math.round(0.0 + removeDecimal);
		return newValue;
	}

	setSourceLink(url) {
		localStorage.setItem('src', url);
	}

	mapProductData(products: object[]){

		return products.map(product=>{
			return this.mapingProductSchema(product)
		})
		
	}

	mapingProductSchema(product: any){
		const productInfo: ProductsEntity= {
            moglixPartNumber: product['moglixPartNumber'],
            moglixProductNo: product['moglixProductNumber'],
            mrp: product['mrp'],
            salesPrice: product['sellingPrice'],
            priceWithoutTax: product['pricewithouttax'],
            productName: product['productName'],
            variantName: null,
            productUrl: product['productlink'],
            shortDesc: product['short_description'],
            brandId: null,
            brandName: null,
            quantityAvailable: product['quantityAvailable'],
            productMinimmumQuantity: null,
            discount: product['discount'],
            rating:null,
            categoryCodes:null,
            taxonomy:null,
			mainImageThumnailLink:product['mainImageThumnailLink'],
            mainImageLink: product['mainImageThumnailLink'],
            productTags:null,
            filterableAttributes: {},
			attributeValuesForPart: {},
            avgRating:null, //this.product.avgRating,
            itemInPack: null,
            ratingCount:  null, //this.product.ratingCount,
            reviewCount:  null, //this.product.reviewCount
			promoCodeDescription: (product.promoCodeDescription) ? this._productService.getPromoCodeDescription(product.promoCodeDescription) : null
        };
        return productInfo;
	}

	setCookieCluster(imageURL, index) {
		this._analytics.sendAdobeCall(this.clusterVisitAnalytic(imageURL, index), "genericClick")
	}

	clusterVisitAnalytic(imageURL, index) {
		const page = {
			pageName: 'home',
			channel: '',
			linkPageName: '',
			linkName: "industry_cluster_" + index + imageURL,
			loginStatus: this._commonService.loginStatusTracking,
		};
		const analytices = { page: page, custData: this._commonService.custDataTracking, order: {} }
		return analytices;
	}
	dataKeyColors: { [key: string]: string } = {
		powerData: CONSTANTS.HOME_CATEGORY_COLOR1,
		safetyData: CONSTANTS.HOME_CATEGORY_COLOR2,
		electricalData: CONSTANTS.HOME_CATEGORY_COLOR3,
		pumpData: CONSTANTS.HOME_CATEGORY_COLOR4
	  }

	  getBackgroundColor(dataKey: string): string {
		return this.dataKeyColors[dataKey] || 'gray'; // Set a default color for other data keys not in the map.
	  }


}

@NgModule({
	declarations: [Categories],
	imports: [
		CommonModule,
		RouterModule,
		LazyLoadImageModule,
		ObserveVisibilityDirectiveModule,
		ProductCardHorizontalScrollModule,
		ProductCardVerticalContainerModule,
		ProductCardVerticalGridViewModule,
		ProductCardHorizontalGridViewModule,
		ProductCardVerticalBlockViewModule,
	],
	providers: [],
	exports:[Categories]
})
export class HomeCategoryProductsModule {}
