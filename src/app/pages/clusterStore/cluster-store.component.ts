import { DOCUMENT, isPlatformBrowser, isPlatformServer } from '@angular/common';
import {
	Component,
	ComponentFactoryResolver,
	Inject,
	Injector,
	OnInit,
	PLATFORM_ID,
	Renderer2,
	ViewChild,
	ViewContainerRef,
	ViewEncapsulation,
} from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { ClientUtility } from '@app/utils/client.utility';
import { Subject } from 'rxjs';
import CONSTANTS from '../../config/constants';
import { ToastMessageService } from '../../modules/toastMessage/toast-message.service';
import { GlobalLoaderService } from '../../utils/services/global-loader.service';

@Component({
	selector: 'app-cluster-store',
	templateUrl: './cluster-store.component.html',
	styleUrls: ['./cluster-store.component.scss'],
	encapsulation: ViewEncapsulation.None,
})
export class ClusterStoreComponent implements OnInit {
	// ondemad loaded components: feature brands
	appBannerInstance = null;
	@ViewChild('BannerComponent', { read: ViewContainerRef })
	appBannerContainerRef: ViewContainerRef;

	allcategoriesInstance = null;
	@ViewChild('AllCategoryComponent', { read: ViewContainerRef })
	allCategoriesContainerRef: ViewContainerRef;

	newArrivalInstance = null;
	@ViewChild('NewArrivalComponent', { read: ViewContainerRef })
	newArrivalContainerRef: ViewContainerRef;

	trendingCategoryInstance = null;
	@ViewChild('TrendingCategoryComponent', { read: ViewContainerRef })
	trendingCategoryContainerRef: ViewContainerRef;

	featuredBrandInstance = null;
	@ViewChild('FeaturedBrandComponent', { read: ViewContainerRef })
	featuredBrandContainerRef: ViewContainerRef;

	featureBannerInstance = null;
	@ViewChild('FeatureBannerComponent', { read: ViewContainerRef })
	featureBannerContainerRef: ViewContainerRef;

	bestSellerInstance = null;
	@ViewChild('BestSellerComponent', { read: ViewContainerRef })
	bestSellerContainerRef: ViewContainerRef;

	featuredCategoriesInstance = null;
	@ViewChild('FeaturedCategoryComponent', { read: ViewContainerRef })
	featuredCategoriesContainerRef: ViewContainerRef;

	clusterVideoInstance = null;
	@ViewChild('ClusterVideoComponent', { read: ViewContainerRef })
	clusterVideoContainerRef: ViewContainerRef;


	isServer: boolean;
	isBrowser: boolean;
	extraData: {};
	private cDistryoyed = new Subject();
	data: {};
	clusterStoreUrl = CONSTANTS.PROD;
	set isShowLoader(value) {
		this.loaderService.setLoaderState(value);
	}
	constructor(
		private _router: Router,
		private _activatedRoute: ActivatedRoute,
		@Inject(PLATFORM_ID) platformId,
		public title: Title,
		public meta: Meta,
		private _renderer2: Renderer2,
		@Inject(DOCUMENT) private _document,
		private toastMessageService: ToastMessageService,
		private cfr: ComponentFactoryResolver,
		private injector: Injector,
		private loaderService: GlobalLoaderService
	) {
		this.isServer = isPlatformServer(platformId);
		this.isBrowser = isPlatformBrowser(platformId);
		this.isShowLoader = false;
	}

	ngOnInit() {
		this._activatedRoute.data.subscribe((rawData) => {
			let response = rawData['clusterStoreData'];
			if (
				response['statusCode'] === 200 &&
				response['data'] != null &&
				response['data'][0]['block_data']
			) {
				const cType = this._activatedRoute.snapshot.params.type;
				this.extraData = { currentRoute: 'store/' + cType };
				this.clusterStoreUrl =
					this.clusterStoreUrl +
					(
						this._router.url.split('?')[0].split('#')[0] as string
					).toLowerCase();
				this.initialize(response);
			} else {
				this.toastMessageService.show({
					type: 'error',
					text: response['message'],
				});
			}
		});
	}

	initialize(response) {
		this.getSelectedCategoryTop(
			response['data'][0]['block_data']['category_cluster']
		);
		this.data = response['data'][0]['block_data'];
		this.reInitializeLazyComponents();
		if (this.isServer) {
			this.setMetaInformation(
				response['metaTitle'],
				response['metaDescritpion']
			);
			this.setCanonicalUrl();
		} else {
			this.title.setTitle(response['metaTitle']);
		}
	}
	setMetaInformation(title, description) {
		this.meta.addTag({ name: 'robots', content: CONSTANTS.META.ROBOT });
		this.title.setTitle(title);
		this.meta.addTag({ name: 'og:title', content: title });
		this.meta.addTag({ name: 'description', content: description });
		this.meta.addTag({ name: 'og:description', content: description });
	}

	setCanonicalUrl() {
		let ampLink = this._renderer2.createElement('link');
		ampLink.rel = 'canonical';
		ampLink.href = this.clusterStoreUrl;
		this._renderer2.appendChild(this._document.head, ampLink);
	}

	getSelectedCategoryTop(category_cluster) {
		let selectedItem;
		if (category_cluster && category_cluster['data'].length > 0) {
			category_cluster['data'] = category_cluster['data'].filter((item) => {
				if (this.extraData['currentRoute'] != item['category_url']) {
					return true;
				}
				selectedItem = item;
				return false;
			});
			category_cluster['data'] = [selectedItem].concat(
				category_cluster['data']
			);
		}
	}

	async onVisibleAppBanner() {
		const { BannerComponent } = await import(
			'../../components/cluster-store/banner/banner.component'
		);
		const factory = this.cfr.resolveComponentFactory(BannerComponent);
		this.appBannerInstance = this.appBannerContainerRef.createComponent(
			factory,
			null,
			this.injector
		);
		this.appBannerInstance.instance['data'] = this.data['main_banner'];
	}

	async onVisibleAllCategoryComponent() {
		const { AllCategoryComponent } = await import(
			'../../components/cluster-store/all-category/all-category.component'
		);
		const factory = this.cfr.resolveComponentFactory(AllCategoryComponent);
		this.allcategoriesInstance = this.allCategoriesContainerRef.createComponent(
			factory,
			null,
			this.injector
		);
		this.allcategoriesInstance.instance['data'] = this.data['all_categories'];
	}

	async onVisibleNewArrivals() {
		const { NewArrivalComponent } = await import(
			'../../components/cluster-store/new-arrival/new-arrival.component'
		);
		const factory = this.cfr.resolveComponentFactory(NewArrivalComponent);
		this.newArrivalInstance = this.newArrivalContainerRef.createComponent(
			factory,
			null,
			this.injector
		);
		this.newArrivalInstance.instance['data'] = this.data['new_arrival'];
	}

	async onVisibleTrendingCategories() {
		const { TrendingCategoryComponent } = await import(
			'../../components/cluster-store/trending-category/trending-category.component'
		);
		const factory = this.cfr.resolveComponentFactory(TrendingCategoryComponent);
		this.trendingCategoryInstance = this.trendingCategoryContainerRef.createComponent(
			factory,
			null,
			this.injector
		);
		this.trendingCategoryInstance.instance['data'] = this.data[
			'trending_categories'
		];
	}

	async onVisibleFeaturedBrands() {
		const { FeaturedBrandComponent } = await import(
			'../../components/cluster-store/featured-brand/featured-brand.component'
		);
		const factory = this.cfr.resolveComponentFactory(FeaturedBrandComponent);
		this.featuredBrandInstance = this.featuredBrandContainerRef.createComponent(
			factory,
			null,
			this.injector
		);
		this.featuredBrandInstance.instance['data'] = this.data['featured_brands'];
	}

	async onVisibleFeatureBanner() {
		const { FeatureBannerComponent } = await import(
			'../../components/cluster-store/feature-banner/feature-banner.component'
		);
		const factory = this.cfr.resolveComponentFactory(FeatureBannerComponent);
		this.featureBannerInstance = this.featureBannerContainerRef.createComponent(
			factory,
			null,
			this.injector
		);
		this.featureBannerInstance.instance['data'] = this.data['secondary_banner'];
	}

	async onVisibleBestSeller() {
		const { BestsellerComponent } = await import(
			'../../components/cluster-store/bestseller/bestseller.component'
		);
		const factory = this.cfr.resolveComponentFactory(BestsellerComponent);
		this.bestSellerInstance = this.bestSellerContainerRef.createComponent(
			factory,
			null,
			this.injector
		);
		this.bestSellerInstance.instance['data'] = this.data['bestseller'];
	}

	async onVisibleFeturedCategories() {
		const { FeaturedCategoryComponent } = await import(
			'../../components/cluster-store/featured-category/featured-category.component'
		);
		const factory = this.cfr.resolveComponentFactory(FeaturedCategoryComponent);
		this.featuredCategoriesInstance = this.featuredCategoriesContainerRef.createComponent(
			factory,
			null,
			this.injector
		);
		this.featuredCategoriesInstance.instance['data'] = this.data[
			'featured_categories'
		];
	}

	async onVisibleClusterVideo() {
		const { ClusterVideoComponent } = await import(
			'../../components/cluster-store/cluster-video/cluster-video.component'
		);
		const factory = this.cfr.resolveComponentFactory(ClusterVideoComponent);
		this.clusterVideoInstance = this.clusterVideoContainerRef.createComponent(
			factory,
			null,
			this.injector
		);
		this.clusterVideoInstance.instance['listOfVideos'] = this.data[
			'video_block'
		]['data'];
		this.clusterVideoInstance.instance['title'] = this.data['video_block'][
			'title'
		];
	}


	reInitializeLazyComponents(initComponent = true) {
		if(this.isBrowser) {
			ClientUtility.scrollToTop(0);
		}
		if (this.appBannerInstance) {
			this.appBannerInstance = null;
			this.appBannerContainerRef.remove();
			if (initComponent) {
				this.onVisibleAppBanner();
			}
		}
		if (this.allcategoriesInstance) {
			this.allcategoriesInstance = null;
			this.allCategoriesContainerRef.remove();
			if (initComponent) {
				this.onVisibleAllCategoryComponent();
			}
		}
		if (this.newArrivalInstance) {
			this.newArrivalInstance = null;
			this.newArrivalContainerRef.remove();
			if (initComponent) {
				this.onVisibleNewArrivals();
			}
		}
		if (this.trendingCategoryInstance) {
			this.trendingCategoryInstance = null;
			this.trendingCategoryContainerRef.remove();
			if (initComponent) {
				this.onVisibleTrendingCategories();
			}
		}
		if (this.featuredBrandInstance) {
			this.featuredBrandInstance = null;
			this.featuredBrandContainerRef.remove();
			if (initComponent) {
				this.onVisibleFeaturedBrands();
			}
		}
		if (this.featureBannerInstance) {
			this.featureBannerInstance = null;
			this.featureBannerContainerRef.remove();
			if (initComponent) {
				this.onVisibleFeatureBanner();
			}
		}
		if (this.bestSellerInstance) {
			this.bestSellerInstance = null;
			this.bestSellerContainerRef.remove();
			if (initComponent) {
				this.onVisibleBestSeller();
			}
		}
		if (this.featuredCategoriesInstance) {
			this.featuredCategoriesInstance = null;
			this.featuredCategoriesContainerRef.remove();
			if (initComponent) {
				this.onVisibleFeturedCategories();
			}
		}
		if (this.clusterVideoInstance) {
			this.clusterVideoInstance = null;
			this.clusterVideoContainerRef.remove();
			if (initComponent) {
				this.onVisibleClusterVideo();
			}
		}
	}

	ngOnDestroy() {
		this.cDistryoyed.next();
		this.cDistryoyed.unsubscribe();
		this.reInitializeLazyComponents(false);
	}
}
