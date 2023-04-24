import { CommonModule } from '@angular/common';
import { Component, Input, NgModule } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { LazyLoadImageModule } from 'ng-lazyload-image';
import CONSTANTS from '@app/config/constants';
import { CommonService } from '@app/utils/services/common.service';

@Component({
	selector: 'home-feature-brands',
	templateUrl: './featuredBrands.html',
	styleUrls: ['./featuredBrands.scss'],
})
export class FeaturedBrands {
	@Input('featureBrandData') featureBrandData;
	@Input('defaultImage') defaultImage;
	imageBasePath=CONSTANTS.CDN_IMAGE_PATH;
	readonly produrl=CONSTANTS.PROD;
	
	constructor(private _commonService: CommonService, private router:Router){}

	setCookieFeatured(imageTitle, url) {
		const isAbsoluteUrl = this._commonService.isAbsoluteUrl(url);
        isAbsoluteUrl ? window.open(url, '_blank') : this.router.navigateByUrl('/'+url);
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
	declarations: [FeaturedBrands],
	imports: [CommonModule, RouterModule, LazyLoadImageModule],
	exports: [FeaturedBrands]
})
export class FeaturedBrandsModule {}
