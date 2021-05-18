import { Title, Meta } from '@angular/platform-browser';
import { isPlatformServer, isPlatformBrowser, DOCUMENT } from '@angular/common';
import {
	Component,
	ViewEncapsulation,
	OnInit,
	PLATFORM_ID,
	Inject,
	Renderer2,
	ViewChild,
	AfterViewInit,
	OnDestroy,
	Input,
	EventEmitter,
	ViewContainerRef,
	ComponentFactoryResolver,
	Injector,
} from '@angular/core';
import { LocalStorageService } from 'ngx-webstorage';
import { Subject } from 'rxjs';
import { fade } from '@utils/animations/animation';
import CONSTANTS from '@app/config/constants';
import { DataService } from '@app/utils/services/data.service';
import { CartService } from '@app/utils/services/cart.service';
import { FooterService } from '@app/utils/services/footer.service';
import { LocalAuthService } from '@app/utils/services/auth.service';
import { ActivatedRoute } from '@angular/router';
import { GlobalAnalyticsService } from '@app/utils/services/global-analytics.service';
@Component({
	selector: 'home',
	templateUrl: './home.html',
	styleUrls: ['./home.scss'],
	animations: [fade],
	encapsulation: ViewEncapsulation.None,
})
export class HomeComponent implements OnInit, AfterViewInit, OnDestroy {
	@Input() data;
	isServer: boolean;
	bannerDataJson: any = {};
	bannerImagesScroll: any = {};
	middleImageJsonData: any = [];
	middleImageJsonDataLink: any = [];
	featureBrandData: any = [];
	featureArrivalData: any = [];
	dataKeyToPopUpPage: any;
	categoryNameFromHomePage: any;
	openPopup: boolean;
	arrivalPopup: boolean;
	isBrowser: boolean;
	isMobile: boolean;
	recentProductList: Array<any> = [];
	result: any;
	bannerCarouselSelector = '.banner-carousel-siema';
	selectedBanner: Number = 0;
	carouselData: any = {};
	MOBILE_IMAGE_CATEGORY = '381';
	defaultImage = CONSTANTS.IMAGE_BASE_URL + CONSTANTS.ASSET_IMG;
	defaultBannerImage = CONSTANTS.IMAGE_BASE_URL + 'image_placeholder.jpg';
	tocd: {};
	options = {
		interval: 5000,
		selector: this.bannerCarouselSelector,
		duration: 200,
		perPage: 1,
		startIndex: 0,
		draggable: false,
		threshold: 20,
		loop: true,
		autoPlay: false,
	};
	topOptions: any = this.options;

	clustorCategories = CONSTANTS.clusterCategories;

	categories: Array<{}> = CONSTANTS.siemaCategories;
	imagePath = CONSTANTS.IMAGE_BASE_URL;
	imagePathBanner = CONSTANTS.IMAGE_BASE_URL;
	pageImages = CONSTANTS.IMAGE_BASE_URL + CONSTANTS.pwaImages.imgFolder;
	appendSiemaItemSubjects: {};
	showRecentlyViewedCarousel = true;
	// ondemad loaded components: feature brands
	featuredBrandsInstance = null;
	@ViewChild('FeaturedBrands', { read: ViewContainerRef })
	featuredBrandsContainerRef: ViewContainerRef;
	// ondemad loaded components: Feature Arrivals
	featuredArrivalsInstance = null;
	@ViewChild('FeaturedArrivals', { read: ViewContainerRef })
	featuredArrivalsContainerRef: ViewContainerRef;
	// ondemad loaded components: PWA Categories
	categoriesInstance = null;
	@ViewChild('Categories', { read: ViewContainerRef })
	CategoriesContainerRef: ViewContainerRef;
	// ondemad loaded components: PWA Categories
	popUpInstance = null;
	@ViewChild('HomePopupComponet', { read: ViewContainerRef })
	HomePopupComponetContainerRef: ViewContainerRef;

	carouselInstance = null;
	@ViewChild('RecentlyViewedCarouselComponent', { read: ViewContainerRef })
	carouselContainerRef: ViewContainerRef;

	constructor(
		public dataService: DataService,
		private _renderer2: Renderer2,
		@Inject(DOCUMENT) private _document,
		private title: Title,
		private meta: Meta,
		@Inject(PLATFORM_ID) platformId,
		public _lss: LocalStorageService,
		public cartService: CartService,
		public footerService: FooterService,
		private _localAuthService: LocalAuthService,
		private cfr: ComponentFactoryResolver,
		private injector: Injector,
		private route: ActivatedRoute,
		private analytics: GlobalAnalyticsService
	) {
		this.isServer = isPlatformServer(platformId);
		this.isBrowser = isPlatformBrowser(platformId);
		this.initConstructorData();
	}

	ngOnInit() {
		this.route.data.subscribe((rawData) => {
			if (!rawData['homeData']['error']) {
				this.fetchHomePageData(rawData.homeData[0]);
			}
		});

		this.setMetaData();
		this.footerService.setFooterObj({ footerData: true });
		if (this.isBrowser) {
			this.isMobile = true;
			var trackData = {
				event_type: 'page_load',
				label: 'view',
				channel: 'Home',
				page_type: 'home_page',
			};
			this.dataService.sendMessage(trackData);
			this.setAnalyticTags();
			setTimeout(() => {
				if (document.querySelector('#search-input')) {
					(<HTMLInputElement>document.querySelector('#search-input')).value =
						'';
					(<HTMLInputElement>document.querySelector('#search-input')).blur();
				}
			}, 0);
		}
	}

	fetchHomePageData(response) {
		if (response && response['statusCode'] === 200 && response['data']) {
			const data: any = {};
			response['data'].forEach((block) => {
				if (
					block.layout_code &&
					CONSTANTS.IDS_MAP.hasOwnProperty(block.layout_code) &&
					!data.hasOwnProperty(CONSTANTS.IDS_MAP[block.layout_code])
				) {
					let localData = [],
						bannerData = [],
						secondaryBanner = [];
					if (block && block.block_data) {
						const blockData = block.block_data;
						if (
							blockData.product_data &&
							blockData.product_data.length &&
							blockData.product_block_order
						) {
							(localData = blockData), blockData;
						} else if (
							blockData.image_block &&
							blockData.image_block.length &&
							block.layout_code == 'cm915657'
						) {
							let parsedBannerData = this.parseAndOrderBannerData(
								blockData.image_block
							);
							bannerData = parsedBannerData.bannerData;
							secondaryBanner = parsedBannerData.secondaryBanner;
						} else if (
							blockData.image_block &&
							blockData.image_block.length &&
							block.layout_code == CONSTANTS.CMS_IDS.MIDDLE_BANNER_ADS
						) {
							this.middleImageJsonData = blockData.image_block;
						} else if (
							blockData.image_block &&
							blockData.image_block.length &&
							block.layout_code == CONSTANTS.CMS_IDS.FEATURE_BRANDS
						) {
							this.featureBrandData = blockData.image_block;
						} else if (
							blockData.image_block &&
							blockData.image_block.length &&
							block.layout_code == CONSTANTS.CMS_IDS.FEATURE_ARRIVAL
						) {
							this.featureArrivalData = blockData.image_block;
						}
					}

					switch (CONSTANTS.IDS_MAP[block.layout_code]) {
						case 'BEST_SELLER':
							data.bestSellerData = {
								data: localData,
								layout_name: block['layout_name'],
								layout_url: block['layout_url'],
							};
							break;
						case 'BANNER':
							data.bannerData = {
								data: bannerData,
								layout_name: block['layout_name'],
								layout_url: block['layout_url'],
							};
							this.bannerDataJson = {
								data: bannerData,
								layout_name: block['layout_name'],
								layout_url: block['layout_url'],
							};
							data.secondaryBanner = {
								data: secondaryBanner,
								layout_name: block['layout_name'],
								layout_url: block['layout_url'],
							};
							break;
						case 'SAFETY':
							data.safetyData = {
								data: localData,
								layout_name: block['layout_name'],
								layout_url: block['layout_url'],
							};
							break;
						case 'CAT_B':
							data.powerData = {
								data: localData,
								layout_name: block['layout_name'],
								layout_url: block['layout_url'],
							};
							break;
						case 'CAT_C':
							data.pumpData = {
								data: localData,
								layout_name: block['layout_name'],
								layout_url: block['layout_url'],
							};
							break;
						case 'CAT_D':
							data.electricalData = {
								data: localData,
								layout_name: block['layout_name'],
								layout_url: block['layout_url'],
							};
							break;
						case 'CAT_E':
							data.officeData = {
								data: localData,
								layout_name: block['layout_name'],
								layout_url: block['layout_url'],
							};
							break;
						case 'CAT_F':
							data.medicalData = {
								data: localData,
								layout_name: block['layout_name'],
								layout_url: block['layout_url'],
							};
							break;
						case 'CAT_G':
							data.lightData = {
								data: localData,
								layout_name: block['layout_name'],
								layout_url: block['layout_url'],
							};
							break;
					}
				}
			});
			if (
				this.bannerDataJson &&
				this.bannerDataJson['data'] &&
				this.bannerDataJson['data'].length
			) {
				this.bannerDataJson['data'].map((bdj) => {
					bdj.image_name = this.imagePathBanner + bdj.image_name;
				});
				this.bannerImagesScroll = this.bannerDataJson;
			}
			const carousalDataKeys = Object.keys(data);

			const ncd = JSON.parse(JSON.stringify(data));

			for (let i = 0; i < carousalDataKeys.length; i++) {
				if (
					carousalDataKeys[i] == 'bannerData' ||
					carousalDataKeys[i] == 'secondaryBanner'
				) {
					ncd[carousalDataKeys[i]]['data'] = data[carousalDataKeys[i]][
						'data'
					].filter((item, i) => i < 1);
				} else {
					ncd[carousalDataKeys[i]]['data'].product_data =
						data[carousalDataKeys[i]]['data'].product_data;
				}
			}
			this.carouselData = ncd; //carousel data

			if (this.middleImageJsonData && this.middleImageJsonData.block_data) {
				this.middleImageJsonDataLink = this.middleImageJsonData.block_data[
					'image_block'
				];
			}
			setTimeout(() => {
				this.appendSiemaItemSubjects['bannerData'].next(
					data['bannerData']['data'].filter((item, i) => i >= 1)
				);
			}, 1000);
		}
	}

	setAnalyticTags() {
		const userSession = this._localAuthService.getUserSession();
		if (
			userSession &&
			userSession.authenticated &&
			userSession.authenticated == 'true'
		) {
			/*Start Criteo DataLayer Tags */
			const obj = {
				event: 'viewHome',
				email: userSession && userSession.email ? userSession.email : '',
			};
			this.analytics.sendGTMCall(obj);
			/*End Criteo DataLayer Tags */
		} else {
			const obj = {
				event: 'viewHome',
				email: '',
			};
			this.analytics.sendGTMCall(obj);
		}
		/*Start Adobe Analytics Tags */
		let page = {
			pageName: 'moglix:home',
			channel: 'home',
			subSection: 'moglix:home',
			loginStatus:
				userSession &&
				userSession.authenticated &&
				userSession.authenticated == 'true'
					? 'registered user'
					: 'guest',
		};
		let custData = {
			customerID:
				userSession && userSession['userId'] ? btoa(userSession['userId']) : '',
			emailID:
				userSession && userSession['email'] ? btoa(userSession['email']) : '',
			mobile:
				userSession && userSession['phone'] ? btoa(userSession['phone']) : '',
			customerType:
				userSession && userSession['userType'] ? userSession['userType'] : '',
		};
		let order = {};
		let digitalData = {};
		digitalData['page'] = page;
		digitalData['custData'] = custData;
		digitalData['order'] = order;
		this.analytics.sendAdobeCall(digitalData);
	}

	initConstructorData() {
		this.topOptions.selector = '.top-banner';
		this.topOptions.topCarousel = true;
		this.topOptions.navHide = true;
		this.topOptions.autoPlay = false;
		this.openPopup = false;
		this.appendSiemaItemSubjects = {};
		this.appendSiemaItemSubjects['bannerData'] = new Subject<Array<{}>>();
		this.appendSiemaItemSubjects['bestSellerData'] = new Subject<Array<{}>>();
	}

	setMetaData() {
		const title =
			'Shop Online for Industrial Tools, Safety Equipment, Power Tools & more - Moglix';
		const description =
			"Moglix is India's leading online store for industrial tools and equipment. Shop now for latest range of industrial products including safety shoes, power tools and more. Free shipping & COD available.";
		this.title.setTitle(
			'Shop Online for Industrial Tools, Safety Equipment, Power Tools & more - Moglix'
		);
		this.meta.addTag({ name: 'description', content: description });
		this.meta.addTag({ property: 'og:description', content: description });
		this.meta.addTag({ property: 'og:title', content: title });
		this.meta.addTag({ property: 'og:site_name', content: 'Moglix.com' });
		this.meta.addTag({ property: 'og:url', content: CONSTANTS.PROD });
		this.meta.addTag({ name: 'twitter:card', content: 'Summary' });
		this.meta.addTag({ name: 'twitter:card', content: 'Summary' });
		this.meta.addTag({ name: 'twitter:site', content: '@moglix' });
		this.meta.addTag({ name: 'twitter:title', content: 'Moglix' });
		this.meta.addTag({
			name: 'twitter:description',
			content: 'Global marketplace for Business & Industrial supplies',
		});
		this.meta.addTag({ name: 'twitter:creator', content: '@moglix' });
		this.meta.addTag({
			name: 'twitter:url',
			content: CONSTANTS.PROD,
		});
		this.meta.addTag({
			name: 'twitter:image:src',
			content: CONSTANTS.IMAGE_BASE_URL + 'assets/img/moglix-logo.jpg',
		});
		this.meta.addTag({ name: 'robots', content: CONSTANTS.META.ROBOT });
		this.meta.addTag({
			name: 'keywords',
			content:
				'Moglix, industrial equipment, industrial tools, industrial products, industrial supplies',
		});
		if (this.isServer) {
			const links = this._renderer2.createElement('link');
			this.webSiteSchema();
			links.rel = 'canonical';
			links.href = CONSTANTS.PROD;
			this._renderer2.appendChild(this._document.head, links);
		}
	}

	parseAndOrderBannerData(data) {
		let category = this.MOBILE_IMAGE_CATEGORY;
		const dataObj = { bannerData: [], secondaryBanner: [] };
		data.map((obj) => {
			if (
				obj &&
				obj.parent_id &&
				(obj.parent_id === category || obj.parent_id === '247')
			) {
				const splitted = obj.image_link.split(',');

				if (splitted.length > 0) {
					obj.link = splitted[0];
					obj.title = splitted[1];
					obj.caption = splitted[2];
					obj.order = splitted[1];
					dataObj.bannerData.push(obj);
				} else {
					if (dataObj.secondaryBanner.length < 3) {
						dataObj.secondaryBanner.push(obj);
					}
				}
			}
		});
		return dataObj;
	}

	webSiteSchema() {
		if (this.isServer) {
			const s = this._renderer2.createElement('script');
			s.type = 'application/ld+json';
			s.text = JSON.stringify({
				'@context': CONSTANTS.SCHEMA,
				'@type': 'WebSite',
				url: CONSTANTS.PROD,
				potentialAction: {
					'@type': 'SearchAction',
					target:
					CONSTANTS.PROD+'/search?controller=search&orderby=position&orderway=desc&search_query={search_term_string}',
					'query-input': 'required name=search_term_string',
				},
			});
			this._renderer2.appendChild(this._document.head, s);
		}
	}

	ngAfterViewInit() {
		if (this.isBrowser) {
			setTimeout(function () {
				Array.prototype.map.call(
					document.querySelectorAll('.high_res_img'),
					function (element) {
						element.setAttribute('src', element.getAttribute('data-url'));
					}
				);
			}, 3000);
		}
	}

	ngOnDestroy() {
		const footerObj = this.footerService.getFooterObj();
		for (let key in footerObj) {
			footerObj[key] = true;
		}
		this.footerService.setMobileFoooters();
	}

	sendDataToPopUP(getDataKey) {
		this.dataKeyToPopUpPage = getDataKey;
	}

	async onVisibleFeaturedBrands(htmlElement) {
		const { FeaturedBrands } = await import(
			'../../modules/featuredBrands/featuredBrands.component'
		);
		const factory = this.cfr.resolveComponentFactory(FeaturedBrands);
		this.featuredBrandsInstance = this.featuredBrandsContainerRef.createComponent(
			factory,
			null,
			this.injector
		);
		this.featuredBrandsInstance.instance[
			'featureBrandData'
		] = this.featureBrandData;
		this.featuredBrandsInstance.instance['defaultImage'] = this.defaultImage;
		this.featuredBrandsInstance.instance['imagePath'] = this.imagePath;
	}

	async onVisibleCategories(htmlElement) {
		const { Categories } = await import(
			'../../modules/categories/categories.component'
		);
		const factory = this.cfr.resolveComponentFactory(Categories);
		this.categoriesInstance = this.CategoriesContainerRef.createComponent(
			factory,
			null,
			this.injector
		);
		this.categoriesInstance.instance[
			'middleImageJsonData'
		] = this.middleImageJsonData;
		this.categoriesInstance.instance['categories'] = this.categories;
		this.categoriesInstance.instance['carouselData'] = this.carouselData;
		this.categoriesInstance.instance['defaultImage'] = this.defaultImage;
		this.categoriesInstance.instance['imagePath'] = this.imagePath;
		this.categoriesInstance.instance[
			'recentProductList'
		] = this.recentProductList;
		(
			this.categoriesInstance.instance['sendDataToPopUP'] as EventEmitter<any>
		).subscribe((popupData) => {
			this.sendDataToPopUP(popupData);
			this.onOpenPopup(null);
		});
	}

	async onVisibleFeaturedArrivals(htmlElement) {
		const { FeaturedArrivals } = await import(
			'../../modules/featuredArrivals/featuredArrivals.component'
		);
		const factory = this.cfr.resolveComponentFactory(FeaturedArrivals);
		this.featuredArrivalsInstance = this.featuredArrivalsContainerRef.createComponent(
			factory,
			null,
			this.injector
		);
		this.featuredArrivalsInstance.instance[
			'featureArrivalData'
		] = this.featureArrivalData;
		this.featuredArrivalsInstance.instance['defaultImage'] = this.defaultImage;
		this.featuredArrivalsInstance.instance['imagePath'] = this.imagePath;
	}

	async onOpenPopup(htmlElement) {
		const { HomePopupComponet } = await import(
			'../../components/home-popup/home.popup.component'
		);
		const factory = this.cfr.resolveComponentFactory(HomePopupComponet);
		this.popUpInstance = this.HomePopupComponetContainerRef.createComponent(
			factory,
			null,
			this.injector
		);
		this.popUpInstance.instance['openPopup'] = true;
		this.popUpInstance.instance['arrivalPopup'] = this.arrivalPopup;
		this.popUpInstance.instance['dataKeyToPopUpPage'] = this.dataKeyToPopUpPage;
		this.popUpInstance.instance['defaultImage'] = this.defaultImage;
		this.popUpInstance.instance['carouselData'] = this.carouselData;
		this.popUpInstance.instance['imagePath'] = this.imagePath;
		this.popUpInstance.instance[
			'categoryNameFromHomePage'
		] = this.categoryNameFromHomePage;
	}

	async onVisibleCarousel(htmlElement) {
		const { RecentlyViewedCarouselComponent } = await import(
			'../../components/recentlyViewedCarousel/recentlyViewedCarousel.component'
		);
		const factory = this.cfr.resolveComponentFactory(
			RecentlyViewedCarouselComponent
		);
		this.carouselInstance = this.carouselContainerRef.createComponent(
			factory,
			null,
			this.injector
		);
		this.carouselInstance.instance['clickFromSection'] = 'recently_viewed_home';
		this.carouselInstance.instance['showHeading'] = true;
		this.carouselInstance.instance['prodList'] = this.recentProductList;
		(
			this.carouselInstance.instance['isDataAvailable'] as EventEmitter<any>
		).subscribe((value) => {
			this.showRecentlyViewedCarousel = value;
		});
	}
}
