import { DOCUMENT } from '@angular/common';
import {
	Component,
	ComponentFactoryResolver,
	Inject,
	Injector,
	OnInit,
	Renderer2,
	ViewChild,
	ViewContainerRef,
	ViewEncapsulation,
} from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { ClientUtility } from '@app/utils/client.utility';
import { CommonService } from '@app/utils/services/common.service';
import { GlobalAnalyticsService } from '@app/utils/services/global-analytics.service';
import { LocalStorageService } from 'ngx-webstorage';
import { Subject } from 'rxjs';
import CONSTANTS from '../../config/constants';
import * as kfooter from '../../config/k.footer';
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
	pageNotFound:boolean=false;
	kfooter: any = kfooter;
	footerVisible = false;
	readonly imagePath = CONSTANTS.IMAGE_BASE_URL;
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
		public title: Title,
		public meta: Meta,
		private _renderer2: Renderer2,
		@Inject(DOCUMENT) private _document,
		private toastMessageService: ToastMessageService,
		private cfr: ComponentFactoryResolver,
		private injector: Injector,
		private loaderService: GlobalLoaderService,
		public _commonService: CommonService, 
		private _localStorageService: LocalStorageService, 
		private _analytics: GlobalAnalyticsService
	) {
		this.isServer = _commonService.isServer;
        this.isBrowser = _commonService.isBrowser;
		this.isShowLoader = false;
	}

	ngOnInit() {
		this._activatedRoute.data.subscribe((rawData) => {
			let response = rawData['clusterStoreData'];
			if(!response['data'][0]){
				this.pageNotFound=true;
			}
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
				// this.toastMessageService.show({
				// 	type: 'error',
				// 	text: response['message'],
				// });
			}
			if(this.isBrowser){
				this.setAnalyticTags();
			}
		});
	}

	setAnalyticTags() {
		    let user;
            if (this._localStorageService.retrieve('user')) {
                user = this._localStorageService.retrieve('user');
            }
            /*Start Adobe Analytics Tags */
            let page = {
                'pageName': "moglix:store:" + this._router.url.split('/').pop(),
                'channel': "store",
                'subSection': "moglix:store:" + this._router.url.split('/').pop(),
                'loginStatus': this._commonService.loginStatusTracking
            }
            let custData = {
                'customerID': (user && user["userId"]) ? btoa(user["userId"]) : '',
                'emailID': (user && user["email"]) ? btoa(user["email"]) : '',
                'mobile': (user && user["phone"]) ? btoa(user["phone"]) : '',
                'customerType': (user && user["userType"]) ? user["userType"] : '',
            }
            let digitalData = {};
		    digitalData['page'] = page;
			digitalData['custData'] = custData;
            setTimeout(() => this._analytics.sendAdobeCall(digitalData), 0 );
            /*End Adobe Analytics Tags */
	}

	initialize(response) {
		console.log('initialize ==>', 'callled');
		if(this.isBrowser){	
			this.reInitializeLazyComponents();
		}
		
		this.getSelectedCategoryTop(
			response['data'][0]['block_data']['category_cluster']
		);
		this.data = response['data'][0]['block_data'];
		if (this.isServer) {
			this.setMetaInformation(
				response['metaTitle'],
				response['metaDescritpion']
			);
			this.setCanonicalUrl();
		} else {
			this.title.setTitle(response['metaTitle']);
		}

		if(this.isBrowser){	
			this.callAllLzayComponents();
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
		if(this.data['main_banner'] && this.data['main_banner']['data'] && this.data['main_banner']['data'].length > 0){
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
	}

	async onVisibleAllCategoryComponent() {
		if(this.data['all_categories'] && this.data['all_categories']['data'] && this.data['all_categories']['data'].length > 0){
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
	}

	async onVisibleNewArrivals() {
		if(this.data['new_arrival'] && this.data['new_arrival']['data'] && this.data['new_arrival']['data'].length > 0){
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
	}

	async onVisibleTrendingCategories() {
		if (this.data['trending_categories'] && this.data['trending_categories']['data'] && this.data['trending_categories']['data'].length > 0) {
			const { TrendingCategoryComponent } = await import(
				'../../components/cluster-store/trending-category/trending-category.component'
			);
			const factory = this.cfr.resolveComponentFactory(TrendingCategoryComponent);
			this.trendingCategoryInstance = this.trendingCategoryContainerRef.createComponent(
				factory,
				null,
				this.injector
			);
			this.trendingCategoryInstance.instance['data'] = this.data['trending_categories'];
		}
	}

	async onVisibleFeaturedBrands() {
		if(this.data['featured_brands'] && this.data['featured_brands']['data'] && this.data['featured_brands']['data'].length > 0){
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
	}

	async onVisibleFeatureBanner() {
		if(this.data['secondary_banner'] &&this. data['secondary_banner']['data'] &&this. data['secondary_banner']['data'].length > 0){
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
	}

	async onVisibleBestSeller() {
		if(this.data['bestseller'] && this.data['bestseller']['data'] && this.data['bestseller'] && this.data['bestseller']['data'].length > 0){
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
	}

	async onVisibleFeturedCategories() {
		if(this.data['featured_categories'] && this.data['featured_categories']['data'] && this.data['featured_categories']['data'].length > 0){
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
	}

	async onVisibleClusterVideo() {
		if(this.data['video_block'] && this.data['video_block']['data'] && this.data['video_block'] && this.data['video_block']['data'].length > 0){
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
	}


	callAllLzayComponents() {
		this.onVisibleAppBanner();
		this.onVisibleAllCategoryComponent();
		this.onVisibleNewArrivals();
		this.onVisibleTrendingCategories();
		this.onVisibleFeaturedBrands();
		this.onVisibleFeatureBanner();
		this.onVisibleBestSeller();
		this.onVisibleFeturedCategories();
		this.onVisibleClusterVideo();
	}

	reInitializeLazyComponents() {
		if(this.isBrowser) {
			ClientUtility.scrollToTop(0);
		}
		if (this.appBannerInstance) {
			this.appBannerInstance = null;
			this.appBannerContainerRef.remove();
		}
		if (this.allcategoriesInstance) {
			this.allcategoriesInstance = null;
			this.allCategoriesContainerRef.remove();
		}
		if (this.newArrivalInstance) {
			this.newArrivalInstance = null;
			this.newArrivalContainerRef.remove();
		}
		if (this.trendingCategoryInstance) {
			this.trendingCategoryInstance = null;
			this.trendingCategoryContainerRef.remove();
		}
		if (this.featuredBrandInstance) {
			this.featuredBrandInstance = null;
			this.featuredBrandContainerRef.remove();
		}
		if (this.featureBannerInstance) {
			this.featureBannerInstance = null;
			this.featureBannerContainerRef.remove();
		}
		if (this.bestSellerInstance) {
			this.bestSellerInstance = null;
			this.bestSellerContainerRef.remove();
		}
		if (this.featuredCategoriesInstance) {
			this.featuredCategoriesInstance = null;
			this.featuredCategoriesContainerRef.remove();
		}
		if (this.clusterVideoInstance) {
			this.clusterVideoInstance = null;
			this.clusterVideoContainerRef.remove();
		}
	}

	clickFooter() {
		this.footerVisible = !this.footerVisible;
		if (this.footerVisible && document.getElementById('footerContainer')) {
		  let footerOffset = document.getElementById('footerContainer').offsetTop;
		  ClientUtility.scrollToTop(1000, footerOffset - 50);
		}
	  }

	ngOnDestroy() {
		this.cDistryoyed.next();
		this.cDistryoyed.unsubscribe();
		this.reInitializeLazyComponents();
	}
}
