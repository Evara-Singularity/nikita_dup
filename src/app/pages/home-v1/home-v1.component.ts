import { Component, ComponentFactoryResolver, Inject, Injector, OnInit, Renderer2, ViewChild, ViewContainerRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import CONSTANTS from '@app/config/constants';
import { CategoryData } from '@app/utils/models/categoryData';
import { CommonService } from '@app/utils/services/common.service';
import { environment } from 'environments/environment';
import { GlobalAnalyticsService } from '@app/utils/services/global-analytics.service';
import { LocalAuthService } from '@app/utils/services/auth.service';
import { Meta,Title } from '@angular/platform-browser';
import { DOCUMENT } from '@angular/common';




@Component({
  selector: 'app-home-v1',
  templateUrl: './home-v1.component.html',
  styleUrls: ['./home-v1.component.scss']
})
export class HomeV1Component implements OnInit {


  isBrowser: boolean;
  isServer: boolean;

  //banner data var
  bannerDataFinal: any = [];
  primaryTopBannerData: any = null;
  secondaryTopBannerData: any = null;
  bannerCarouselSelector = '.banner-carousel-siema';
  options = {
    interval: 5000,
    selector: this.bannerCarouselSelector,
    duration: 200,
    perPage: 1,
    startIndex: 0,
    draggable: false,
    threshold: 20,
    loop: true,
    autoPlay: true,
  };
  topOptions: any = this.options;
  defaultBannerImage = CONSTANTS.IMAGE_BASE_URL + 'image_placeholder.jpg';
  imagePathBanner = CONSTANTS.IMAGE_BASE_URL;

  //trending categories var
  flyOutData: any;

  //whatsApp banner url
  whatsAppBannerUrl = CONSTANTS.whatsAppBannerUrl;
  readonly imageAssetURL = CONSTANTS.IMAGE_ASSET_URL;

  //categories store var
  clustorCategories = CONSTANTS.clusterCategories;
  clusterimagePath = '../../../../../assets/';

  // feature brands var
  featureBrandData: any = [];
  defaultImage = CONSTANTS.IMAGE_BASE_URL + CONSTANTS.ASSET_IMG;
  imagePath = CONSTANTS.IMAGE_BASE_URL;

  // recently view var
  carouselInstance = null;
  @ViewChild('RecentlyViewedCarouselComponent', { read: ViewContainerRef })
  carouselContainerRef: ViewContainerRef;
  showRecentlyViewedCarousel = true;
  recentProductList: Array<any> = [];

  // ondemad loaded components: PWA Categories
  categoriesInstance = null;
  @ViewChild('Categories', { read: ViewContainerRef })
  CategoriesContainerRef: ViewContainerRef;
  categories: Array<{}> = CONSTANTS.siemaCategories;
  middleImageJsonData: any = [];
  homePageCategoryCarouselData: any = {};
  // data: any = {};
  middleImageJsonDataLink: any

  //featured Arrival Data
  featureArrivalData: any = [];

  //search var
  searchTerm = '';
  isRoutedBack: boolean;

  //metadata var
  oganizationSchema: any;



  constructor(
    private route: ActivatedRoute,
    public _commonService: CommonService,
    private cfr: ComponentFactoryResolver,
    private injector: Injector,
    private analytics: GlobalAnalyticsService,
    private _localAuthService: LocalAuthService,
    private _router: Router,
    private meta: Meta,
    private title: Title,
    private _renderer2: Renderer2,
    @Inject(DOCUMENT) private _document,


  ) {
    this.isServer = _commonService.isServer;
    this.isBrowser = _commonService.isBrowser;
  }

  ngOnInit() {
    this._commonService.isHomeHeader = true;
		this._commonService.isPLPHeader = false;
    this.loadSearchTerms();
    this.route.data.subscribe((rawData) => {
      if (!rawData['homeData']['error']) {
        if (rawData.homeData[0] && rawData.homeData[0]['statusCode'] === 200 && rawData.homeData[0]['data']) {
          this.homePageData(rawData.homeData[0]);
        }
        if (rawData.homeData[1] && rawData.homeData[1]['statusCode'] === 200 && rawData.homeData[1]['data']) {
          this.flyOutData = rawData.homeData[1] && rawData.homeData[1]['data'] as CategoryData[];
        }
      }
    });
    this.initConstructorData();
    this.route.queryParams.subscribe(res => {
      this.isRoutedBack = res && res.hasOwnProperty('back') ? true : false;
    })
    //setting meta data
    this.setMetaData();
    //setting analytics
    this.setAnalyticTags();
  }

  homePageData(response: any) {
    response['data'].forEach((block) => {
      // console.log('homePageData ==>', JSON.stringify(block));
      const layoutCode = block.layout_code;

      switch (layoutCode) {
        case environment.NEW_CMS_IDS.PRIMARY_BANNER:
          this.fetchingMainCarouselData(block.block_data.image_block);
          break;

        case environment.NEW_CMS_IDS.SECONDARY_BANNER_ADS:
          const gettingOneMiddleImageJsonData=block.block_data.image_block.slice(0,1);
          this.fetchingMainCarouselData(gettingOneMiddleImageJsonData);
          this.middleImageJsonData = block.block_data.image_block;
          break;

        case environment.NEW_CMS_IDS.FEATURE_BRANDS:
          this.fetchingFeaturedBrandsData(block.block_data.image_block);
          break;

        case environment.NEW_CMS_IDS.BEST_SELLER:
          this.fetchingHomePageCategoriesCarouselData(block, "bestSellerData");
          break;

        case environment.NEW_CMS_IDS.SAFETY:
          this.fetchingHomePageCategoriesCarouselData(block, "safetyData");
          break;

        case environment.NEW_CMS_IDS.CAT_B:
          this.fetchingHomePageCategoriesCarouselData(block, "powerData");
          break;

        case environment.NEW_CMS_IDS.CAT_C:
          this.fetchingHomePageCategoriesCarouselData(block, "pumpData");
          break;

        case environment.NEW_CMS_IDS.CAT_D:
          this.fetchingHomePageCategoriesCarouselData(block, "electricalData");
          break;

        case environment.NEW_CMS_IDS.CAT_E:
          this.fetchingHomePageCategoriesCarouselData(block, "officeData");
          break;

        case environment.NEW_CMS_IDS.CAT_F:
          this.fetchingHomePageCategoriesCarouselData(block, "medicalData");
          break;

        case environment.NEW_CMS_IDS.CAT_G:
          this.fetchingHomePageCategoriesCarouselData(block, "lightData");
          break;

        case environment.NEW_CMS_IDS.FEATURE_ARRIVAL:
          this.featureArrivalData = block.block_data.image_block;
          break;

        default:
          break;
      }


    });
  }

  fetchingMainCarouselData(blockData) {
    this.bannerDataFinal = [...this.bannerDataFinal, ...blockData];
    this.bannerDataFinal.map(e => {
      const imgPath = this.isServer ? '' : this.imagePathBanner;
      e.link = e["image_link"];
      e.image_name = imgPath + e["image_name"];
      this.parseAndOrderBannerData(e);
      return e;

    });
  }

  fetchingFeaturedBrandsData(blockData) {
    this.featureBrandData = blockData;
  }

  fetchingHomePageCategoriesCarouselData(blockData, nameInCategories) {
    // console.log('fetchingHomePageCategoriesCarouselData '+nameInCategories, blockData);
    this.homePageCategoryCarouselData[nameInCategories] = {
      data: blockData.block_data,
      layout_name: blockData['layout_name'],
      layout_url: blockData['layout_url'],
    }
  }

  initConstructorData() {
    this.topOptions.selector = '.top-banner';
    this.topOptions.topCarousel = true;
    this.topOptions.navHide = true;
    this.topOptions.autoPlay = true;
  }

  parseAndOrderBannerData(e) {
    const splitted = e.image_link.split(',');
    if (splitted.length > 0) {
      e.link = splitted[0];
      e.title = splitted[1];
      e.caption = splitted[2];
      e.order = splitted[1];
    }
    return e;
  }

  async onVisibleCarousel(htmlElement) {
    if (!this.carouselInstance) {
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
    }
  }

  loadSearchNav() {
    this._commonService.loadNav.next(true);
  }

  loadSearchTerms() {
    if (this._commonService.isBrowser) {
      let terms = CONSTANTS.SEARCH_WIDGET_KEYS;
      this.searchTerm = terms[0];
      let i = null;
      setInterval(() => {
        if ((i || i == 0) && i < terms.length - 1) {
          i += 1
        } else {
          i = 0
        }
        this.searchTerm = terms[i];
      }, 2000)
    }
  }

  sendTrackingData() {
		const page = {
			"linkPageName": "moglix:home",
			"linkName": "WhatsApp",
			"loginStatus": this._commonService.loginStatusTracking
		};
		const custData = this._commonService.custDataTracking;
		const order = {};
		this.analytics.sendAdobeCall({ page,custData,order }, "genericClick");
	}

  setAnalyticTags() {
    if(this._commonService.isBrowser){
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
        linkName: this._router.url,
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
			this.orgSchema();
		}
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
						CONSTANTS.PROD + '/search?controller=search&search_query={search_term_string}',
					'query-input': 'required name=search_term_string',
				},
			});
			this._renderer2.appendChild(this._document.head, s);
		}
	}

  orgSchema() {
		this.oganizationSchema = this._renderer2.createElement('script');
		this.oganizationSchema.type = "application/ld+json";
		this.oganizationSchema.text = JSON.stringify(
			{
				"@context": CONSTANTS.SCHEMA,
				"@type": "Organization",
				"name": "Moglix",
				"url": CONSTANTS.PROD,
				"logo": `${this.imagePath}assets/img/moglix-logo.jpg`,
				"contactPoint":
					[{
						"@type": "ContactPoint",
						"telephone": "+91 8448 233 444",
						"contactType": "customer service"
					}],
				"sameAs": ["https://www.facebook.com/moglix.global/", "https://twitter.com/moglix", "https://www.youtube.com/c/MoglixOfficial", "https://www.instagram.com/moglix.official/", "https://www.linkedin.com/company/moglix/"]
			}
		)
		this._renderer2.appendChild(this._document.head, this.oganizationSchema);
	}
  

}
