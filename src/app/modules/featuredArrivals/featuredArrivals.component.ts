import { CommonModule } from '@angular/common';
import { Component, Input, NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { LazyLoadImageModule } from 'ng-lazyload-image';
import { ProductCardVerticalGridViewModule } from '../product-card/product-card-vertical-grid-view/product-card-vertical-grid-view.module';
import { ProductCardVerticalContainerComponent } from '../ui/product-card-vertical-container/product-card-vertical-container.component';
import { ProductCardVerticalContainerModule } from '../ui/product-card-vertical-container/product-card-vertical-container.module';
import { ProductCardFeature } from '@app/utils/models/product.listing.search';
import { ProductService } from '@app/utils/services/product.service';

@Component({
	selector: 'home-feature-arrivals',
	templateUrl: './featuredArrivals.html',
	styleUrls: ['./featuredArrivals.scss'],
})
export class FeaturedArrivals {
	constructor(private _productService:ProductService){

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
	@Input('featureArrivalData') featureArrivalData;
	@Input('defaultImage') defaultImage;
	@Input('imagePath') imagePath;

	setCookieFeatured(imageTitle) {
		var date = new Date();
		date.setTime(date.getTime() + 30 * 24 * 60 * 60 * 1000);
		document.cookie =
			'adobeClick=' +
			'Featured' +
			'_' +
			imageTitle +
			'; expires=' +
			date.toUTCString() +
			';path=/';
	}
	ngOnInit(){
		console.log(this.featureArrivalData,"this.featureArrivalData")
		this.featureArrivalData = (this.featureArrivalData).map((item) => this._productService.productLayoutJsonToProductEntity(item));

	}
}

@NgModule({
	declarations: [FeaturedArrivals],
	imports: [CommonModule, RouterModule, LazyLoadImageModule,ProductCardVerticalGridViewModule,ProductCardVerticalContainerModule],
	exports:[FeaturedArrivals]
})
export class FeaturedArrivalModule {}
