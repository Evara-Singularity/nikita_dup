import {
  Title,
  Meta,
  TransferState,
  makeStateKey,
} from "@angular/platform-browser";
import { isPlatformServer, isPlatformBrowser, DOCUMENT } from "@angular/common";
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
  Output,
  EventEmitter,
  ViewContainerRef,
  ComponentFactoryResolver,
  Injector,
} from "@angular/core";
import { HomeService } from "./home.service";
import { LocalStorageService, LocalStorage } from "ngx-webstorage";
import { Subject } from "rxjs";
import { fade } from "src/app/pages/animation/animations";
import { map } from "rxjs/operators/map";
import { SiemaCarouselComponent } from "src/app/modules/siemaCarousel/siemaCarousel.component";
import CONSTANTS from "src/app/config/constants";
import { DataService } from "src/app/utils/services/data.service";
import { CartService } from "src/app/utils/services/cart.service";
import { FooterService } from "src/app/utils/services/footer.service";
import { LocalAuthService } from "src/app/utils/services/auth.service";
import { CommonService } from "src/app/utils/services/common.service";

// const HPDK = makeStateKey<any>('homepagedata'); // Home page data key
// const TCK = makeStateKey<any>('topcarouseldata'); // Home page data key
const FDK = makeStateKey<string>("flyout");
// const MIJDL = makeStateKey<string>("middlejson");
// const FBDK = makeStateKey<string>('featr_brandjson');//Featured Brand data key
// const FADK = makeStateKey<string>('featr_arrivaljson');//Featured Arrival data key

declare let dataLayer;
declare var digitalData: {};
declare let _satellite;

@Component({
  selector: "home",
  templateUrl: "./home.html",
  styleUrls: ["./home.scss"],
  animations: [fade],
  encapsulation: ViewEncapsulation.None,
})
export class HomeComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild(SiemaCarouselComponent)
  _siemaCarouselComponent: SiemaCarouselComponent;
  @Input() data;
  @Output() outData$: EventEmitter<{}>;
  isServer: boolean;
  bannerDataJson: any = {};
  bannerImagesScroll: any = {};
  middleImageJsonData: any = [];
  middleImageJsonDataLink: any = [];
  featureBrandDataLink: any = [];
  featureArrivalDataLink: any = [];

  middleBannerData: any = {};
  featureData: any;
  featureBrandData: any = [];
  featureArrival: any;
  featureArrivalData: any = [];

  dataKeyToPopUpPage: any;
  categoryNameFromHomePage: any;
  openPopup: boolean;
  arrivalPopup: boolean;
  isBrowser: boolean;
  isMobile: boolean;
  recentProductList: Array<any> = [];
  result: any;
  homeServiceUnsub;
  getFlyOutDataUnsub;
  bannerCarouselSelector = ".banner-carousel-siema";
  selectedBanner: Number = 0;
  carouselData: any = {};
  siemaOptionsObject = {
    outerWrapperClass: ["product_block_container"],
    innerWrapperClass: ["product_block"],
  };
  DESKTOP_IMAGE_CATEGORY = "246";
  MOBILE_IMAGE_CATEGORY = "381";
  defaultImage = CONSTANTS.IMAGE_BASE_URL + "assets/img/home_card.webp";
  defaultBannerImage = CONSTANTS.IMAGE_BASE_URL + "image_placeholder.jpg";
  @LocalStorage()
  tocd: {};
  options = {
    interval: 5000,
    selector: this.bannerCarouselSelector,
    duration: 200,
    // easing: 'ease-out',
    perPage: 1,
    startIndex: 0,
    draggable: false,
    threshold: 20,
    loop: true,
    autoPlay: false,
  };
  topOptions: any = this.options;
  flyOutData: Array<{}>;

  clustorCategories = CONSTANTS.clusterCategories;

  categories: Array<{}> = CONSTANTS.siemaCategories;
  imagePath = CONSTANTS.IMAGE_BASE_URL;
  imagePathBanner = CONSTANTS.IMAGE_BASE_URL;
  pageImages = CONSTANTS.IMAGE_BASE_URL + CONSTANTS.pwaImages.imgFolder;
  appendSiemaItemSubjects: {};

  // ondemad loaded components offer compare section popup
  featuredBrandsInstance = null;
  @ViewChild('FeaturedBrands', { read: ViewContainerRef }) featuredBrandsContainerRef: ViewContainerRef;

  constructor(
    public dataService: DataService,
    private _tState: TransferState,
    private _renderer2: Renderer2,
    @Inject(DOCUMENT) private _document,
    private title: Title,
    private meta: Meta,
    @Inject(PLATFORM_ID) platformId,
    public _lss: LocalStorageService,
    public cartService: CartService,
    public footerService: FooterService,
    private _localAuthService: LocalAuthService,
    private homeService: HomeService,
    private cfr: ComponentFactoryResolver,
    private _commonService: CommonService,
    private injector: Injector
  ) {
    this.isServer = isPlatformServer(platformId);
    this.isBrowser = isPlatformBrowser(platformId);
    this.initConstructorData();
  }

  ngOnInit() {
    this.setMetaData();
    if (this.isBrowser) {
      this.isMobile = true;
      var trackData = {
        event_type: "page_load",
        label: "view",
        channel: "Home",
        page_type: "home_page",
      };
      this.dataService.sendMessage(trackData);
      this.fetchHomePageData();
      this.cartService.homePageFlyOut.next(false);
      this.setAnalyticTags();
      setTimeout(() => {
        if (document.querySelector("#search-input")) {
          (<HTMLInputElement>document.querySelector("#search-input")).value =
            "";
          (<HTMLInputElement>document.querySelector("#search-input")).blur();
        }
      }, 0);
    }
    this.getFlyOutData();
    this.footerService.setFooterObj({ footerData: true });
  }

  fetchHomePageData() {
    this.homeServiceUnsub = this.homeService
      .getHomePageData()
      .subscribe((response) => {
        if (response && response["statusCode"] === 200 && response["data"]) {
          const data: any = {};
          response["data"].forEach((block) => {
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
                  block.layout_code == "cm915657"
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
                case "BEST_SELLER":
                  data.bestSellerData = {
                    data: localData,
                    layout_name: block["layout_name"],
                    layout_url: block["layout_url"],
                  };
                  break;
                case "BANNER":
                  data.bannerData = {
                    data: bannerData,
                    layout_name: block["layout_name"],
                    layout_url: block["layout_url"],
                  };
                  this.bannerDataJson = {
                    data: bannerData,
                    layout_name: block["layout_name"],
                    layout_url: block["layout_url"],
                  };
                  data.secondaryBanner = {
                    data: secondaryBanner,
                    layout_name: block["layout_name"],
                    layout_url: block["layout_url"],
                  };
                  break;
                case "SAFETY":
                  data.safetyData = {
                    data: localData,
                    layout_name: block["layout_name"],
                    layout_url: block["layout_url"],
                  };
                  break;
                case "CAT_B":
                  data.powerData = {
                    data: localData,
                    layout_name: block["layout_name"],
                    layout_url: block["layout_url"],
                  };
                  break;
                case "CAT_C":
                  data.pumpData = {
                    data: localData,
                    layout_name: block["layout_name"],
                    layout_url: block["layout_url"],
                  };
                  break;
                case "CAT_D":
                  data.electricalData = {
                    data: localData,
                    layout_name: block["layout_name"],
                    layout_url: block["layout_url"],
                  };
                  break;
                case "CAT_E":
                  data.officeData = {
                    data: localData,
                    layout_name: block["layout_name"],
                    layout_url: block["layout_url"],
                  };
                  break;
                case "CAT_F":
                  data.medicalData = {
                    data: localData,
                    layout_name: block["layout_name"],
                    layout_url: block["layout_url"],
                  };
                  break;
                case "CAT_G":
                  data.lightData = {
                    data: localData,
                    layout_name: block["layout_name"],
                    layout_url: block["layout_url"],
                  };
                  break;
              }
            }
          });
          if (
            this.bannerDataJson &&
            this.bannerDataJson["data"] &&
            this.bannerDataJson["data"].length
          ) {
            this.bannerDataJson["data"].map((bdj) => {
              bdj.image_name = this.imagePathBanner + bdj.image_name;
            });
            this.bannerImagesScroll = this.bannerDataJson;
          }
          const carousalDataKeys = Object.keys(data);

          const ncd = JSON.parse(JSON.stringify(data));

          for (let i = 0; i < carousalDataKeys.length; i++) {
            if (
              carousalDataKeys[i] == "bannerData" ||
              carousalDataKeys[i] == "secondaryBanner"
            ) {
              ncd[carousalDataKeys[i]]["data"] = data[carousalDataKeys[i]][
                "data"
              ].filter((item, i) => i < 1);
            } else {
              ncd[carousalDataKeys[i]]["data"].product_data =
                data[carousalDataKeys[i]]["data"].product_data;
            }
          }
          this.carouselData = ncd; //carousel data

          if (this.middleImageJsonData && this.middleImageJsonData.block_data) {
            this.middleImageJsonDataLink = this.middleImageJsonData.block_data[
              "image_block"
            ];
          }
          setTimeout(() => {
            this.appendSiemaItemSubjects["bannerData"].next(
              data["bannerData"]["data"].filter((item, i) => i >= 1)
            );
          }, 1000);
        }
      });
  }

  setAnalyticTags() {
    const userSession = this._localAuthService.getUserSession();
    if (
      userSession &&
      userSession.authenticated &&
      userSession.authenticated == "true"
    ) {
      /*Start Criteo DataLayer Tags */
      dataLayer.push({
        event: "viewHome",
        email: userSession && userSession.email ? userSession.email : "",
      });
      /*End Criteo DataLayer Tags */
    } else {
      dataLayer.push({
        event: "viewHome",
        email: "",
      });
    }
    /*Start Adobe Analytics Tags */
    let page = {
      pageName: "moglix:home",
      channel: "home",
      subSection: "moglix:home",
      loginStatus:
        userSession &&
          userSession.authenticated &&
          userSession.authenticated == "true"
          ? "registered user"
          : "guest",
    };
    let custData = {
      customerID:
        userSession && userSession["userId"] ? btoa(userSession["userId"]) : "",
      emailID:
        userSession && userSession["email"] ? btoa(userSession["email"]) : "",
      mobile:
        userSession && userSession["phone"] ? btoa(userSession["phone"]) : "",
      customerType:
        userSession && userSession["userType"] ? userSession["userType"] : "",
    };
    let order = {};
    digitalData["page"] = page;
    digitalData["custData"] = custData;
    digitalData["order"] = order;
  }

  initConstructorData() {
    this.topOptions.selector = ".top-banner";
    this.topOptions.topCarousel = true;
    this.topOptions.navHide = true;
    this.topOptions.autoPlay = false;
    this.openPopup = false;
    this.outData$ = new EventEmitter();
    this.appendSiemaItemSubjects = {};
    this.appendSiemaItemSubjects["bannerData"] = new Subject<Array<{}>>();
    this.appendSiemaItemSubjects["bestSellerData"] = new Subject<Array<{}>>();
  }

  setMetaData() {
    const title =
      "Shop Online for Industrial Tools, Safety Equipment, Power Tools & more - Moglix";
    const description =
      "Moglix is India's leading online store for industrial tools and equipment. Shop now for latest range of industrial products including safety shoes, power tools and more. Free shipping & COD available.";
    this.title.setTitle(
      "Shop Online for Industrial Tools, Safety Equipment, Power Tools & more - Moglix"
    );
    this.meta.addTag({ name: "description", content: description });
    this.meta.addTag({ property: "og:description", content: description });
    this.meta.addTag({ property: "og:title", content: title });
    this.meta.addTag({ property: "og:site_name", content: "Moglix.com" });
    this.meta.addTag({ property: "og:url", content: "https://www.moglix.com" });
    this.meta.addTag({ name: "twitter:card", content: "Summary" });
    this.meta.addTag({ name: "twitter:card", content: "Summary" });
    this.meta.addTag({ name: "twitter:site", content: "@moglix" });
    this.meta.addTag({ name: "twitter:title", content: "Moglix" });
    this.meta.addTag({
      name: "twitter:description",
      content: "Global marketplace for Business & Industrial supplies",
    });
    this.meta.addTag({ name: "twitter:creator", content: "@moglix" });
    this.meta.addTag({
      name: "twitter:url",
      content: "https://www.moglix.com",
    });
    this.meta.addTag({
      name: "twitter:image:src",
      content: CONSTANTS.IMAGE_BASE_URL + "assets/img/moglix-logo.jpg",
    });
    this.meta.addTag({ name: "robots", content: CONSTANTS.META.ROBOT });
    this.meta.addTag({
      name: "keywords",
      content:
        "Moglix, industrial equipment, industrial tools, industrial products, industrial supplies",
    });
    const links = this._renderer2.createElement("link");
    this.webSiteSchema();
    links.rel = "canonical";
    links.href = CONSTANTS.PROD;
    this._renderer2.appendChild(this._document.head, links);
  }

  getFlyOutData() {
    const url = CONSTANTS.NEW_MOGLIX_API + "/homepage/flyout?type=m";
    if (this._tState.hasKey(FDK)) {
      // this.initFlyoutData(this._tState.get(FDK, []));
      this.flyOutData = this._tState.get(FDK, []);
    } else {
      this.getFlyOutDataUnsub = this.homeService
        .getFlyoutDataApi(url)
        .pipe(
          map((res) => {
            if (res["statusCode"] === 200) {
              return res["data"];
            } else {
              return [];
            }
          })
        )
        .subscribe((data) => {
          this._tState.set(FDK, data);
          this.flyOutData = data;
        });
    }
  }

  floor(num) {
    if (!num) {
      return "";
    }
    num = num + "";
    return num.split(".")[0];
  }

  parseAndOrderBannerData(data) {
    let category = this.MOBILE_IMAGE_CATEGORY;
    const dataObj = { bannerData: [], secondaryBanner: [] };
    data.map((obj) => {
      if (
        obj &&
        obj.parent_id &&
        (obj.parent_id === category || obj.parent_id === "247")
      ) {
        const splitted = obj.image_link.split(",");

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
  changeBanner(index) {
    if (!this.isServer) {
      Array.prototype.map.call(
        document.querySelectorAll(".home_banner_caption a"),
        (el, i): boolean => {
          if (el.classList.contains("active")) {
            if (i === index) {
              return true;
            } else {
              this._siemaCarouselComponent.goTo(
                index,
                this.bannerCarouselSelector
              );
              el.classList.remove("active");
              return false;
            }
          } else {
            return false;
          }
        }
      );
      this.selectedBanner = index;
    }
  }

  getEmail(): any {
    let userEmail = " ";
    if (this._lss.retrieve("user")) {
      const user = this._lss.retrieve("user");
      if (user.authenticated === "false") {
        userEmail = user.email;
      }
    }
    return userEmail;
  }

  webSiteSchema() {
    if (this.isServer) {
      const s = this._renderer2.createElement("script");
      s.type = "application/ld+json";
      s.text = JSON.stringify({
        "@context": "https://schema.org",
        "@type": "WebSite",
        url: "https://www.moglix.com/",
        potentialAction: {
          "@type": "SearchAction",
          target:
            "https://www.moglix.com/search?controller=search&orderby=position&orderway=desc&search_query={search_term_string}",
          "query-input": "required name=search_term_string",
        },
      });
      this._renderer2.appendChild(this._document.head, s);
    }
  }

  ngAfterViewInit() {
    if (this.isBrowser) {
      setTimeout(function () {
        Array.prototype.map.call(
          document.querySelectorAll(".high_res_img"),
          function (element) {
            element.setAttribute("src", element.getAttribute("data-url"));
          }
        );
      }, 3000);
    }
  }
  ngOnDestroy() {
    this.cartService.homePageFlyOut.next(true);
    const footerObj = this.footerService.getFooterObj();
    for (let key in footerObj) {
      footerObj[key] = true;
    }
    if (this.homeServiceUnsub) this.homeServiceUnsub.unsubscribe();
    if (this.getFlyOutDataUnsub) this.getFlyOutDataUnsub.unsubscribe();
    this.footerService.setMobileFoooters();
  }
  beforeDiscount(afterDiscountPrice, discount_percentage) {
    const val = 100 / (100 - discount_percentage);
    const val2 = Math.round(val * 100) / 100;
    const original = afterDiscountPrice * val2;
    const removeDecimal = Math.round(original * 100) / 100;
    const newValue = Math.round(0.0 + removeDecimal);
    return newValue;
  }

  outData(data) {
    if (Object.keys(data).indexOf("hide") !== -1) {
      this.openPopup = !data.hide;
      this.arrivalPopup = !data.hide;
    }
  }

  sendDataToPopUP(getDataKey) {
    this.dataKeyToPopUpPage = getDataKey;
    setTimeout(() => {
      document
        .querySelector(
          ".screen-view.popup.info-update-popup.payment-popup .container .content-popup"
        )
        .addEventListener(
          "scroll",
          () => {
            window.scrollTo(window.scrollX, window.scrollY + 1);
            window.scrollTo(window.scrollX, window.scrollY - 1);
          },
          { passive: true }
        );
    }, 100);
  }

  setCookieFeatured(imageTitle) {
    var date = new Date();
    date.setTime(date.getTime() + 30 * 24 * 60 * 60 * 1000);
    document.cookie =
      "adobeClick=" +
      "Featured" +
      "_" +
      imageTitle +
      "; expires=" +
      date.toUTCString() +
      ";path=/";
  }

  setCategoryorBrandCookie(categoryName, type) {
    this._commonService.setSectionClickInformation("homepage", "listing");
    var date = new Date();
    date.setTime(date.getTime() + 30 * 24 * 60 * 60 * 1000);
    if (type === "tbrand") {
      document.cookie =
        "adobeClick=" +
        "Brand" +
        "_" +
        categoryName +
        "; expires=" +
        date.toUTCString() +
        ";path=/";
    } else if (type === "tcat") {
      document.cookie =
        "adobeClick=" +
        "Category" +
        "_" +
        categoryName +
        "; expires=" +
        date.toUTCString() +
        ";path=/";
    }
  }

  async onVisibleFeaturedBrands(htmlElement) {
    // const { FeaturedBrands } = await import('')
    const { FeaturedBrands } = await import('./featureBrands/featuredBrands.component');
    const factory = this.cfr.resolveComponentFactory(FeaturedBrands);
    this.featuredBrandsInstance = this.featuredBrandsContainerRef.createComponent(factory, null, this.injector);
    this.featuredBrandsInstance.instance['featureBrandData'] = this.featureBrandData;
    this.featuredBrandsInstance.instance['defaultImage'] = this.defaultImage;
    this.featuredBrandsInstance.instance['imagePath'] = this.imagePath;
  }

  getCategoryLabel(categoryName) {
    this.categoryNameFromHomePage = categoryName;
    setTimeout(() => {
      window.scrollTo(window.scrollX, window.scrollY + 1);
      window.scrollTo(window.scrollX, window.scrollY - 1);
    }, 100);
  }

  getBrandName(brand_description) {
    const ParsebrandName = brand_description.split("||");
    const brandName = ParsebrandName[0]; // brandName i,e Brand: ABC at 0th Position
    const afterRemoveBrandWord = brandName.replace("Brand:", "");
    return afterRemoveBrandWord;
  }
  setCookieLink(catName, categoryCodeorBannerName, type) {
    this._commonService.setSectionClickInformation("homepage", type);
    var date = new Date();
    date.setTime(date.getTime() + 30 * 24 * 60 * 60 * 1000);
    document.cookie =
      "adobeClick=" +
      catName +
      "_" +
      categoryCodeorBannerName +
      "; expires=" +
      date.toUTCString() +
      ";path=/";
  }
}
