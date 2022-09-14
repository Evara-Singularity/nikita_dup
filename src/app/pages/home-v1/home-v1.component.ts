import { Component, ComponentFactoryResolver, Injector, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import CONSTANTS from '@app/config/constants';
import { CategoryData } from '@app/utils/models/categoryData';
import { CommonService } from '@app/utils/services/common.service';
import { environment } from 'environments/environment';
import { GlobalAnalyticsService } from '@app/utils/services/global-analytics.service';



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


  constructor(
    private route: ActivatedRoute,
    public _commonService: CommonService,
    private cfr: ComponentFactoryResolver,
    private injector: Injector,
    private analytics: GlobalAnalyticsService,

  ) {
    this.isServer = _commonService.isServer;
    this.isBrowser = _commonService.isBrowser;
  }

  ngOnInit() {
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
  }

  homePageData(response: any) {
    response['data'].forEach((block) => {
      const layoutCode = block.layout_code;

      switch (layoutCode) {
        case environment.NEW_CMS_IDS.PRIMARY_BANNER:
          this.fetchingMainCarouselData(block.block_data.image_block);
          break;

        case environment.NEW_CMS_IDS.SECONDARY_BANNER_ADS:
          this.fetchingMainCarouselData(block.block_data.image_block);
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


  

}
