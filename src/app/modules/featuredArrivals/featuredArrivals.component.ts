import { CommonModule } from '@angular/common';
import { Component, Input, NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { LazyLoadImageModule } from 'ng-lazyload-image';
import { ProductCardVerticalGridViewModule } from '../product-card/product-card-vertical-grid-view/product-card-vertical-grid-view.module';
import { ProductCardVerticalContainerComponent } from '../ui/product-card-vertical-container/product-card-vertical-container.component';
import { ProductCardVerticalContainerModule } from '../ui/product-card-vertical-container/product-card-vertical-container.module';

@Component({
	selector: 'home-feature-arrivals',
	templateUrl: './featuredArrivals.html',
	styleUrls: ['./featuredArrivals.scss'],
})
export class FeaturedArrivals {
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
}

@NgModule({
	declarations: [FeaturedArrivals],
	imports: [CommonModule, RouterModule, LazyLoadImageModule,ProductCardVerticalGridViewModule,ProductCardVerticalContainerModule],
	exports:[FeaturedArrivals]
})
export class FeaturedArrivalModule {}
