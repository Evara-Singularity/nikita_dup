import { CommonModule } from '@angular/common';
import { Component, Input, NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { LazyLoadImageModule } from 'ng-lazyload-image';

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
	imports: [CommonModule, RouterModule, LazyLoadImageModule],
})
export class FeaturedArrivalModule {}
