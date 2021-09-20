import { LibertyService } from './liberty.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import {
	Component,
	OnInit,
	ViewChild,
} from '@angular/core';
import { Title, Meta } from '@angular/platform-browser';
import { SiemaCarouselComponent } from '@app/modules/siemaCarousel/siemaCarousel.component';
import CONSTANTS from '@app/config/constants';
import { CommonService } from '@app/utils/services/common.service';

@Component({
	selector: 'app-liberty',
	templateUrl: './liberty.component.html',
	styleUrls: ['./liberty.component.scss'],
})
export class LibertyComponent implements OnInit {
	@ViewChild(SiemaCarouselComponent)
	_siemaCarouselComponent: SiemaCarouselComponent;
	imagePath = CONSTANTS.IMAGE_BASE_URL;
	defaultImage = CONSTANTS.IMAGE_BASE_URL + CONSTANTS.ASSET_IMG;
	appendSiemaItemSubject$ = new Subject<Array<{}>>();
	supplierReviewsSiemaItems$ = new Subject<Array<{}>>();
	manufacturerBestSellerSiemaItems$ = new Subject<Array<{}>>();
	paginationUpdated: Subject<any>;
	sortByComponentUpdated: Subject<any>;
	pageName: string;
	selectedIndex: number = 0;
	isServer: boolean;
	isBrowser: boolean;
	itemCount: boolean;
	categoryId: any;
	image_data: any;
	bestSellerData: any;
	pageTitle: any;
	bannerData: any;
	reviewData: any;
	brandData: any;
	iconsData: any;
	percentageData: any;
	awardsData: any;
	whyChooseUsData: any;
	whyChooseusBanner: any;
	banner_bg: any;
	viewAll_data: any;
	brandKeysData: Array<any> = [];
	block_data: any;
	newarrivalData: any;
	manufacturer_name: any;

	options = {
		duration: 500,
		startIndex: 0,
		draggable: false,
		threshold: 20,
		loop: false,
		onInit: () => {
			setTimeout(() => {
				this._siemaCarouselComponent.scrollInitialize();
			}, 500);
		},
	};
	supplierReviewOptions = {
		selector: '.supplier-siema',
		manufacturer: true,
		perPage: 1.1,
		nav: true,
		loop: false,
		navHide: true,
	};
	manufacturerBestSellerOptions = {
		selector: '.mfr-bestseller-siema',
		mfrBestSeller: true,
		perPage: 2.2,
		nav: true,
		loop: false,
		navHide: true,
	};
	manufacturerNewArrival = {
		selector: '.mfr-newarrival-siema',
		mfrNewArrival: true,
		perPage: 2.2,
		nav: true,
		loop: false,
		navHide: true,
	};

	prod = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
	similarProducts: Array<any> = [];
	bestSellerArray: Array<any> = [];
	reviewsArray: Array<any> = [];
	newArrivalArray: Array<any> = [];

	constructor(
		private _router: Router,
		private _activatedRoute: ActivatedRoute,
		private _libertyService: LibertyService,
		private title: Title,
		private meta: Meta,
		public _commonService: CommonService
	) {
		this.paginationUpdated = new Subject<any>();
		this.sortByComponentUpdated = new Subject<any>();
		this.isServer = _commonService.isServer;
        this.isBrowser = _commonService.isBrowser;
	}

	ngOnInit() {
		let title = 'Manufacturer Store - Moglix.com';
		this.title.setTitle(title);
		this.meta.addTag({ name: 'og:title', content: title });
		let metaDesc =
			'Shop online from Moglix Manufacturer store at best prices now! Moglix is a one-stop shop for buying genuine products online. Free Shipping & COD available.';
		this.meta.addTag({ name: 'description', content: metaDesc });
		this.meta.addTag({ name: 'og:description', content: metaDesc });

		let sParams = this._activatedRoute.snapshot.params;
		this.manufacturer_name = decodeURI(sParams['manufacturer']);
		this.getData(this.manufacturer_name);
	}

	getData(manufacturer) {
		this._libertyService.getManufacturerData(manufacturer).subscribe((res) => {
			let data = res['data'];
			this.block_data = data[0].block_data;
			let brandKeys = [];
			brandKeys = Object.keys(this.block_data);
			this.brandKeysData = brandKeys.filter((key) => key.startsWith('brand_'));
			this.image_data = data[0].block_data.image_block;
			//  Map of Keys of image_title
			let imgData = {};
			data[0].block_data.image_block.forEach((item) => {
				if (imgData.hasOwnProperty(item['image_title'])) {
					imgData[item['image_title']].push(item);
				} else {
					if (!imgData.hasOwnProperty(item['image_title'])) {
						imgData[item['image_title']] = [];
					}
					imgData[item['image_title']].push(item);
				}
			});
			this.newarrivalData = this.block_data.new_arrival;
			this.bestSellerData = this.block_data.bestseller;
			this.bannerData = imgData['imageblock_banner'];
			this.reviewData = imgData['imageblock_testimonial'];
			this.percentageData = imgData['imageblock_offer'];
			this.iconsData = imgData['imageblock_icons'];
			this.whyChooseUsData = imgData['imageblock_choose_icon'];
			this.whyChooseusBanner = imgData['imageblock_choose_banner'];
			this.banner_bg = imgData['imageblock_banner'][0].image_name;
			this.viewAll_data = this.block_data.general_block[0].element_url;
			this.bestSellerData.forEach((el) => {
				this.bestSellerArray.push(el);
			});
			this.reviewData.forEach((item) => {
				this.reviewsArray.push(item);
			});
			this.newarrivalData.forEach((item) => {
				this.newArrivalArray.push(item);
			});
		});
	}

	getBrandName(brand) {
		let brand_name = brand.split('brand_')[1];
		return brand_name;
	}
}
