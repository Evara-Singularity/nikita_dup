import { CommonModule } from '@angular/common';
import {
	Component,
	Input,
	Output,
	EventEmitter,
	NgModule,
	HostBinding,
} from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonService } from '../../utils/services/common.service';
import { LazyLoadImageModule } from 'ng-lazyload-image';
import { ObserveVisibilityDirectiveModule } from '../../utils/directives/observe-visibility.directive';
import { ProductHorizontalCardModule } from '../product-horizontal-card/product-horizontal-card.module';
import { ProductCardFeature, ProductsEntity } from '@app/utils/models/product.listing.search';
import { ProductCardHorizontalScrollComponent } from '../ui/product-card-horizontal-scroll/product-card-horizontal-scroll.component';
import { ProductCardHorizontalScrollModule } from '../ui/product-card-horizontal-scroll/product-card-horizontal-scroll.module';
import { ProductCardVerticalContainerModule } from '@app/modules/ui/product-card-vertical-container/product-card-vertical-container.module';


@Component({
	selector: 'home-categories',
	templateUrl: './categories.component.html',
	styleUrls: ['./categories.component.scss'],
})
export class Categories {
	@Input('middleImageJsonData') middleImageJsonData;
	@Input('categories') categories;
	@Input('carouselData') carouselData;
	@Input('defaultImage') defaultImage;
	@Input('imagePath') imagePath;
	@Input('recentProductList') recentProductList;
	@Output('sendDataToPopUP') sendDataToPopUP = new EventEmitter();
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
		lazyLoadImage: true
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
		verticalOrientationV2:true,
        lazyLoadImage: false
    }
	openPopup;
	categoryNameFromHomePage;

	constructor(
		private _commonService: CommonService,
	) {}

	getCategoryLabel(categoryName) {
		this.categoryNameFromHomePage = categoryName;
		setTimeout(() => {
			window.scrollTo(window.scrollX, window.scrollY + 1);
			window.scrollTo(window.scrollX, window.scrollY - 1);
		}, 100);
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
            filterableAttributes: null,
            avgRating:null, //this.product.avgRating,
            itemInPack: null,
            ratingCount:  null, //this.product.ratingCount,
            reviewCount:  null //this.product.reviewCount
        };
        return productInfo;
	}


}

@NgModule({
	declarations: [Categories],
	imports: [
		CommonModule,
		RouterModule,
		LazyLoadImageModule,
		ObserveVisibilityDirectiveModule,
		ProductHorizontalCardModule,
		ProductCardHorizontalScrollModule,
		ProductCardVerticalContainerModule
	],
	providers: [],
})
export class FeaturedArrivalModule {}
