import { Component, ComponentFactoryResolver, Inject, Injector, OnInit, PLATFORM_ID, ViewChild, ViewContainerRef, EventEmitter, Renderer2, AfterViewInit, Optional } from '@angular/core';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import { BehaviorSubject, Subject } from 'rxjs';
import { DomSanitizer, Meta, Title } from '@angular/platform-browser';
import { LocalStorageService } from 'ngx-webstorage';
import { DOCUMENT, isPlatformBrowser, isPlatformServer } from '@angular/common';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { ObjectToArray } from '../../utils/pipes/object-to-array.pipe';
import { ClientUtility } from '../../utils/client.utility';
import { ProductService } from '../../utils/services/product.service';
import { LocalAuthService } from '../../utils/services/auth.service';
import { ProductUtilsService } from '../../utils/services/product-utils.service';
import { DataService } from '../../utils/services/data.service';
import { GlobalLoaderService } from '../../utils/services/global-loader.service';
import { SiemaCrouselService } from '../../utils/services/siema-crousel.service';
import { GlobalAnalyticsService } from '../../utils/services/global-analytics.service';
import { PageScrollService } from 'ngx-page-scroll-core';
import { RESPONSE } from '@nguniversal/express-engine/tokens';
import CONSTANTS from '@app/config/constants';
import { ToastMessageService } from '@app/modules/toastMessage/toast-message.service';
import { ModalService } from '@app/modules/modal/modal.service';
import { CartService } from '@app/utils/services/cart.service';
import { CommonService } from '@app/utils/services/common.service';
import { FbtComponent } from './../../components/fbt/fbt.component';
import { YoutubePlayerComponent } from '@app/components/youtube-player/youtube-player.component';

interface ProductDataArg {
  productBO: string;
  refreshCrousel?: boolean;
  subGroupMsnId?: string;
}

@Component({
  selector: 'app-product',
  templateUrl: './product.component.html',
  styleUrls: ['./product.component.scss']
})
export class ProductComponent implements OnInit, AfterViewInit {

  readonly imagePath = CONSTANTS.IMAGE_BASE_URL;
  readonly baseDomain = CONSTANTS.PROD;
  readonly DOCUMENT_URL = CONSTANTS.DOCUMENT_URL;
  readonly imagePathAsset = CONSTANTS.IMAGE_ASSET_URL;

  isServer: boolean;
  isBrowser: boolean
  //conditions vars
  rawProductData: any = null;
  rawProductFbtData: any = null;
  rawProductCountData: any = null;
  showLoader: boolean = true;
  uniqueRequestNo: number = 0;
  currentAddedProduct: any;
  cartSession: any;
  bulkPriceSelctedQuatity: number;
  bulkDiscount: any;
  selectedBulkQuantityIndex: any;
  productNotFound: boolean = false;
  //general product info 
  defaultPartNumber: string = null;
  productTags: any[] = null
  isCommonProduct: boolean = true;
  // productAttributesExtra: any[] = null;
  productName: string = null;
  isProductPriceValid: boolean;
  productOutOfStock: boolean = false;
  priceQuantityCountry: any;
  productAttributes: any = null;
  productMrp: number;
  priceWithoutTax: number;
  productDiscount: number = 0;
  taxPercentage: number;
  bulkSellingPrice: number = null;
  productPrice: number;
  bulkPriceWithoutTax: number = null;//bulk price without tax
  isPurcahseListProduct: boolean = false;
  productDescripton: string = null;
  productBrandDetails: any;
  productCategoryDetails: any;
  productUrl: string;
  productTax: number = 0;
  productCartThumb: string = '';
  productMinimmumQuantity: any = 1
  productFilterAttributesList: any;
  productKeyFeatures: any[] = [];
  productVideos: any[] = [];
  productDocumentInfo: any[] = [];
  questionAnswerList: any = null;
  productDefaultImage: string;
  productMediumImage: string;
  productBrandCategoryUrl: string;
  productRating: number;
  productSubPartNumber: string;
  productBulkPrices: any[];
  recentBoughtOrderCount: any;
  //Product Question answer
  questionAnswerForm: FormGroup;
  //review and rating 
  rawReviewsData = null;
  reviews: any = null
  reviewLength: number;
  selectedReviewType: string = "helpful";
  starsCount: number = null;
  //breadcrumm related data
  breadcrumpUpdated: BehaviorSubject<any> = new BehaviorSubject<any>(0);
  breadcrumbData = null;
  // product image crousel settings
  productAllImages: any[] = null
  refreshSiemaItems$ = new Subject<{ items: Array<{}>, type: string, currentSlide: number }>();
  moveToSlide$ = new Subject<number>();
  carouselInitialized: boolean = false;
  //frequently bought together
  fbtFlag = false;
  isRFQSuccessfull = false;
  similarProducts = [];

  // Q&A vars
  questionMessage: string;
  listOfGroupedCategoriesForCanonicalUrl = ['116111700'];

  // ondemand loaded components for share module
  productShareInstance = null;
  @ViewChild('productShare', { read: ViewContainerRef }) productShareContainerRef: ViewContainerRef;
  // ondemand loaded components for Frequently bought together
  fbtComponentInstance = null;
  @ViewChild('fbt', { read: ViewContainerRef }) fbtComponentContainerRef: ViewContainerRef;
  // ondemand loaded components for similar products
  similarProductInstance = null;
  @ViewChild('similarProduct', { read: ViewContainerRef }) similarProductContainerRef: ViewContainerRef;
  // ondemand loaded components for recents products
  recentProductsInstance = null;
  @ViewChild('recentProducts', { read: ViewContainerRef }) recentProductsContainerRef: ViewContainerRef;
  // ondemand loaded components RFQ form modal
  rfqFormInstance = null;
  @ViewChild('rfqForm', { read: ViewContainerRef }) rfqFormContainerRef: ViewContainerRef;
  // ondemad loaded components for pincode servicibility check
  pincodeFormInstance = null;
  @ViewChild('pincodeForm', { read: ViewContainerRef }) pincodeFormContainerRef: ViewContainerRef;
  // ondemad loaded components offer section
  offerSectionInstance = null;
  @ViewChild('offerSection', { read: ViewContainerRef }) offerSectionContainerRef: ViewContainerRef;
  // ondemad loaded components offer section popup
  offerPopupInstance = null;
  @ViewChild('offerPopup', { read: ViewContainerRef }) offerPopupContainerRef: ViewContainerRef;
  // ondemad loaded components offer compare section popup
  offerComparePopupInstance = null;
  @ViewChild('offerComparePopup', { read: ViewContainerRef }) offerComparePopupContainerRef: ViewContainerRef;
  // ondemad loaded components add to cart toast
  addToCartToastInstance = null;
  @ViewChild('addToCartToast', { read: ViewContainerRef }) addToCartToastContainerRef: ViewContainerRef;
  // ondemad loaded components similat prodict all pop up
  similarAllInstance = null;
  @ViewChild('similarAll', { read: ViewContainerRef }) similarAllContainerRef: ViewContainerRef;
  // ondemad loaded components recent viewd products all pop up
  recentAllInstance = null;
  @ViewChild('recentAll', { read: ViewContainerRef }) recentAllContainerRef: ViewContainerRef;
  // ondemad loaded components for post a product review
  writeReviewPopupInstance = null;
  @ViewChild('writeReviewPopup', { read: ViewContainerRef }) writeReviewPopupContainerRef: ViewContainerRef;
  // ondemad loaded components for popup crousel
  popupCrouselInstance = null;
  @ViewChild('popupCrousel', { read: ViewContainerRef }) popupCrouselContainerRef: ViewContainerRef;
  // ondemad loaded components for green aleart box as success messge
  alertBoxInstance = null;
  @ViewChild('alertBox', { read: ViewContainerRef }) alertBoxContainerRef: ViewContainerRef;
  // ondemand load of youtube video player in modal
  youtubeModalInstance = null;
  // ondemand loaded components for product RFQ
  productRFQInstance = null;
  @ViewChild('productRFQ', { read: ViewContainerRef }) productRFQContainerRef: ViewContainerRef;
  
  iOptions: any = null;

  featuresMap = {
    "Antiskid": "antiskid",
    "Oil Resistant": "oil-resistant",
    "Heat Resistant": "heat-resistant",
    "Puncture Resistant": "puncture-resistant",
    "Impact Resistant": "impact-resistant",
    "Chemical Resistant": "chemical-resistant",
    "Toe Type": "steel-toe",
    "Waterproof": "waterproof"
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private cfr: ComponentFactoryResolver,
    public objectToArray: ObjectToArray,
    private injector: Injector,
    private sanitizer: DomSanitizer,
    public localStorageService: LocalStorageService,
    private productService: ProductService,
    private localAuthService: LocalAuthService,
    private _tms: ToastMessageService,
    private productUtil: ProductUtilsService,
    private modalService: ModalService,
    private cartService: CartService,
    public commonService: CommonService,
    private dataService: DataService,
    public formBuilder: FormBuilder,
    private globalLoader: GlobalLoaderService,
    private siemaCrouselService: SiemaCrouselService,
    public pageTitle: Title,
    public meta: Meta,
    private renderer2: Renderer2,
    private analytics: GlobalAnalyticsService,
    @Inject(DOCUMENT) private document,
    @Inject(PLATFORM_ID) private platformId: Object,
    @Optional() @Inject (RESPONSE) private _response: any,
    private _pageScrollService: PageScrollService
  ) {
    this.isServer = isPlatformServer(platformId);
    this.isBrowser = isPlatformBrowser(platformId);
  }

  ngOnInit(): void {
    this.intializeForm();
    this.getProductApiData();
    this.addSubcriber();
    this.createSiemaOption();
    this.setProductSeoSchema();
    this.setQuestionAnswerSchema();
  }

  ngAfterViewInit() {
    this.getPurchaseList();
  }

  createSiemaOption() {
    if(!this.rawProductData){
      return;
    }
    this.iOptions = {
      selector: '.img-siema',
      perPage: 1,
      productNew: true,
      pager: true,
      imageAlt: this.productName,
      onInit: () => {
        setTimeout(() => {
          this.carouselInitialized = true;
        }, 0);
      }
    };
  }

  addSubcriber() {
    if (this.isBrowser) {
      this.siemaCrouselService.getProductScrouselPopup().subscribe(result => {
        if (result.active) {
          this.openPopUpcrousel(result['slideNumber']);
        }
      })
    }
  }

  intializeForm() {
    this.questionAnswerForm = this.formBuilder.group({
      question: ['', [Validators.required]]
    });
  }

  getProductApiData() {
    // data received by product resolver
    this.route.data.subscribe((rawData) => {
      if (!rawData['product']['error']) {
        // console.log('getProductApiData rawData', rawData['product'][4]);
        // todo: if productBO not fould redirect to product not found page
        if (rawData['product'][0]['productBO']) {
          // originally only load 3 review on viewport intersection load other comments
          const rawReviews = Object.assign({}, rawData['product'][1]['data']);
          const rawProductFbtData = Object.assign({}, rawData['product'][4]);
          const rawProductCountData = Object.assign({}, rawData['product'][5]);
          this.rawReviewsData = Object.assign({}, rawReviews);
          this.rawProductFbtData = Object.assign({}, rawProductFbtData);
          this.rawProductCountData = Object.assign({}, rawProductCountData);
          rawReviews['reviewList'] = (rawReviews['reviewList'] as []).slice(0, 3);

          this.processProductData({
            productBO: rawData['product'][0]['productBO'],
            refreshCrousel: true,
            subGroupMsnId: null,
          },rawData['product'][0]);
          
          this.setReviewsRatingData(rawReviews);
          this.setProductaBreadcrum(rawData['product'][2]);
          this.setQuestionsAnswerData(rawData['product'][3]);
          this.remoteApiCallRecentlyBought();
        } else {
          this.showLoader = false;
          this.globalLoader.setLoaderState(false);
          this.productNotFound = true;
          if(this.isServer && this.productNotFound) {
            this._response.status(404);
          }
        }
      } else {
        this.productNotFound = true;
        if(this.isServer && this.productNotFound) {
          this._response.status(404);
        }
      }
      this.showLoader = false;
      this.globalLoader.setLoaderState(false);
    }, error => {
      this.showLoader = false;
      this.globalLoader.setLoaderState(false);
      console.log('getProductApiData error', error);
    });
  }

  updateAttr(productId) {
    this.removeRfqForm();
    this.showLoader = true;
    this.productService.getGroupProductObj(productId).subscribe(productData => {
      if (productData['status'] == true) {
        this.processProductData({
          productBO: productData['productBO'],
          refreshCrousel: true,
          subGroupMsnId: productId,
        },productData);
        this.showLoader = false;
      } else {
        // console.log('updateAttr productData status', productData);
      }
    })
  }

  removeRfqForm(){
    if(this.productRFQInstance){
      this.productRFQInstance = null;
      this.productRFQContainerRef.remove();
    }
  }

  setQuestionsAnswerData(data) {
    console.log('questionAnswerList', data);
    this.questionAnswerList = data;
  }

  setReviewsRatingData(reviews) {
    this.reviews = reviews;
    if (this.reviews && this.reviews.reviewList) {
      this.reviewLength = this.reviews.reviewList.length;
      this.reviews.reviewList.forEach(element => {
        element['isPost'] = false;
        element['yes'] = 0;
        element['no'] = 0;
        if (element.is_review_helpful_count_yes)
          element['yes'] = Number(element.is_review_helpful_count_yes['value']);
        if (element.is_review_helpful_count_no)
          element['no'] = Number(element.is_review_helpful_count_no['value']);
        element['totalReview'] = element['yes'] + element['no']
      });
    }
    this.sortReviewsList("date");
    this.setProductRating(this.reviews.summaryData.final_average_rating);
  }

  sortReviewsList(sortType) {
    this.selectedReviewType = sortType;
    let list = this.reviews.reviewList;
    if (sortType === "helpful") {
      list.sort((a, b) => {
        return b.yes - a.yes;
      });
    }
  }

  setProductRating(rating) {
    if (rating == 0 || rating == null) {
      this.starsCount = 0;
      //this.productResult['rating'] = 0;
    }
    else if (rating < 3.5) {
      this.starsCount = 3.5;
      //this.productResult['rating'] = 3.5;
    }
    else {
      this.starsCount = rating;
      //this.productResult['rating'] = rating;
    }
  }

  onVisibleReviews($event) {
    this.setReviewsRatingData(this.rawReviewsData);
  }

  setProductaBreadcrum(breadcrumbData) {
    this.breadcrumbData = breadcrumbData;
  }

  processProductData(args: ProductDataArg, rawData) {
    this.rawProductData = args.productBO;
    // required for goruped products
    this.defaultPartNumber = (args.subGroupMsnId != null) ? args.subGroupMsnId : this.rawProductData['defaultPartNumber'];
    const partNumber = (args.subGroupMsnId != null) ? args.subGroupMsnId : this.rawProductData['partNumber'];
    this.productSubPartNumber = partNumber;

    // mapping general information 
    this.productName = this.rawProductData['productName'];
    this.productDescripton = this.rawProductData['desciption'];
    this.productBrandDetails = this.rawProductData['brandDetails'];
    this.productCategoryDetails = this.rawProductData['categoryDetails'][0];
    this.productUrl = this.rawProductData['defaultCanonicalUrl'];
    this.productFilterAttributesList = this.rawProductData['filterAttributesList'];
    this.productKeyFeatures = this.rawProductData['keyFeatures'];
    this.productVideos = this.rawProductData['videosInfo'];
    this.productDocumentInfo = this.rawProductData['documentInfo'];
    this.productTags = this.rawProductData['productTags'];
    this.productAttributes = this.rawProductData['productPartDetails'][partNumber]['attributes'] || [];
    this.productRating = this.rawProductData['productPartDetails'][partNumber]['productRating'];
    this.productBrandCategoryUrl = 'brands/' + this.productBrandDetails['friendlyUrl'] + "/" + this.productCategoryDetails['categoryLink'];

    this.isProductPriceValid = this.rawProductData['productPartDetails'][partNumber]['productPriceQuantity'] != null;
    this.priceQuantityCountry = (this.isProductPriceValid) ? Object.assign({}, this.rawProductData['productPartDetails'][partNumber]['productPriceQuantity']['india']) : null;
    this.productMrp = (this.isProductPriceValid && this.priceQuantityCountry)?this.priceQuantityCountry['mrp']:null;

    console.log('isProductPriceValid', this.isProductPriceValid);

    if (this.priceQuantityCountry) {
      this.priceQuantityCountry['bulkPricesIndia'] = (this.isProductPriceValid) ? Object.assign({}, this.rawProductData['productPartDetails'][partNumber]['productPriceQuantity']['india']['bulkPrices']) : null;
      this.priceQuantityCountry['bulkPricesModified'] = (this.isProductPriceValid && this.rawProductData['productPartDetails'][partNumber]['productPriceQuantity']['india']['bulkPrices']['india']) ? [...this.rawProductData['productPartDetails'][partNumber]['productPriceQuantity']['india']['bulkPrices']['india']] : null;
    }

    this.priceWithoutTax = (this.priceQuantityCountry)?this.priceQuantityCountry['priceWithoutTax']:null;
    if (this.priceQuantityCountry && this.priceQuantityCountry['mrp'] > 0 && this.priceQuantityCountry['priceWithoutTax'] > 0 ) {
      this.productDiscount = (((this.priceQuantityCountry['mrp'] - this.priceQuantityCountry['priceWithoutTax']) / this.priceQuantityCountry['mrp']) * 100)
    }
    this.taxPercentage = (this.priceQuantityCountry)?this.priceQuantityCountry['taxRule']['taxPercentage']:null;
    this.productPrice = (this.priceQuantityCountry && !isNaN(this.priceQuantityCountry['sellingPrice'])) ? Number(this.priceQuantityCountry['sellingPrice']) : 0;
    
    this.productTax = (this.priceQuantityCountry && !isNaN(this.priceQuantityCountry['sellingPrice']) && !isNaN(this.priceQuantityCountry['sellingPrice'])) ?
      (Number(this.priceQuantityCountry['sellingPrice']) - Number(this.priceQuantityCountry['sellingPrice'])) : 0;
    this.productMinimmumQuantity = (this.priceQuantityCountry && this.priceQuantityCountry['moq'])?this.priceQuantityCountry['moq']:1;

    this.setOutOfStockFlag();

    if(this.productOutOfStock){
      this.onVisibleProductRFQ(null);
    }

    // product media processing
    this.resetLazyComponents();
    this.setProductImages(this.rawProductData['productPartDetails'][partNumber]['images']);
    this.setProductVideo(this.rawProductData['videosInfo']);
    if (args.refreshCrousel) { 
      this.refreshProductCrousel() 
    }

    this.setProductCommonType(this.rawProductData['filterAttributesList']);
    // this.setAttributesExtra(this.rawProductData['productPartDetails']);
    // this.setSimilarProducts(this.productName, this.productCategoryDetails['categoryCode']);
    this.fetchFBTProducts(rawData);
    this.updateBulkPriceDiscount();
    this.showLoader = false;
    
    // analytics calls moved to this function incase PDP is redirecte to PDP
    this.callAnalyticForVisit(); 
    this.setMetatag();

  }

  updateBulkPriceDiscount() {
    if (this.priceQuantityCountry && this.priceQuantityCountry['bulkPricesModified'] && this.priceQuantityCountry['bulkPricesModified'].length > 0) {
      this.priceQuantityCountry['bulkPricesModified'].forEach(element => {
        if (this.productMrp > 0) {
          element.discount = ((this.productMrp - element.bulkSPWithoutTax) / this.productMrp) * 100;
        } else {
          element.discount = element.discount;
        }
      });
    }
  }

  resetLazyComponents() {
    // this function  is useable when user is redirect from PDP to PDP
    if (this.productShareInstance) {
      this.productShareInstance = null;
      this.productShareContainerRef.remove();
    }
    if (this.fbtComponentInstance) {
      this.fbtComponentInstance = null;
      this.fbtComponentContainerRef.remove();
    }
    // console.log('similarProductInstance 1', this.similarProductInstance);
    if (this.similarProductInstance) {
      this.similarProductInstance = null;
      this.similarProductContainerRef.remove();
      this.onVisibleSimilar(null);
    }
    // console.log('similarProductInstance 2', this.similarProductInstance);
    if (this.recentProductsInstance) {
      this.recentProductsInstance = null;
      this.recentProductsContainerRef.remove();
      this.onVisibleRecentProduct(null);
    }
    if (this.rfqFormInstance) {
      this.rfqFormInstance = null;
      this.rfqFormContainerRef.remove();
    }
    if (this.pincodeFormInstance) {
      this.pincodeFormInstance = null;
      this.pincodeFormContainerRef.remove();
    }
    if (this.offerSectionInstance) {
      this.offerSectionInstance = null;
      this.offerSectionContainerRef.remove();
    }
    if (this.offerPopupInstance) {
      this.offerPopupInstance = null;
      this.offerPopupContainerRef.remove();
    }
    if (this.offerComparePopupInstance) {
      this.offerComparePopupInstance = null;
      this.offerComparePopupContainerRef.remove();
    }
    if (this.addToCartToastInstance) {
      this.addToCartToastInstance = null;
      this.addToCartToastContainerRef.remove();
    }
    if (this.similarAllInstance) {
      this.similarAllInstance = null;
      this.similarAllContainerRef.remove();
    }
    if (this.recentAllInstance) {
      this.recentAllInstance = null;
      this.recentAllContainerRef.remove();
    }
    if (this.writeReviewPopupInstance) {
      this.writeReviewPopupInstance = null;
      this.writeReviewPopupContainerRef.remove();
    }
    if (this.popupCrouselInstance) {
      this.popupCrouselInstance = null;
      this.popupCrouselContainerRef.remove();
    }
    if (this.alertBoxInstance) {
      this.alertBoxInstance = null;
      this.alertBoxContainerRef.remove();
    }
    if (this.productRFQInstance) {
      this.productRFQInstance = null;
      this.productRFQContainerRef.remove();
    }
    if (this.youtubeModalInstance) {
      this.youtubeModalInstance = null;
    }
  }

  setSimilarProducts(productName, categoryCode) {
    this.similarProducts = [];
    if (this.isBrowser) {
      this.productService.getSimilarProducts(productName, categoryCode).subscribe((response: any) => {
        let products = response['products'];
        if (products && (products as []).length > 0) {
          this.similarProducts = products;
        }
      })
    }
  }

  setOutOfStockFlag() {
    if (this.priceQuantityCountry) {
      // incase outOfStockFlag of is avaliable then set its value
      this.productOutOfStock = this.priceQuantityCountry['outOfStockFlag'];
      // apart from outOfStockFlag if mrp is exist and is zero set product of OOS
      if (this.priceQuantityCountry['mrp']) {
        if (parseInt(this.priceQuantityCountry['mrp']) == 0) {
          this.productOutOfStock = true;
        }
        if (parseInt(this.priceQuantityCountry['quantityAvailable']) == 0) {
          this.productOutOfStock = true;
        }
      } else {
        this.productOutOfStock = true;
      }
    } else {
      // incase priceQuantityCountry element not present in API
      this.productOutOfStock = true;
    }
    console.log('setOutOfStockFlag :: ', this.productOutOfStock);
  }

  // setAttributesExtra(productPartDetails) {
  //   if(productPartDetails){
  //     const productDetailArg = (productPartDetails) ? this.objectToArray.transform(productPartDetails, 'associative') : [];
  //     console.log('productDetailArg', productDetailArg);
  //     let productDetail = productDetailArg[0]['value'];
  //     const extra = [];
  //     if (productDetail.attributes) {
  //       for (const key in productDetail.attributes) {
  //         if (productDetail.attributes.hasOwnProperty(key)) {
  //           const element = productDetail.attributes[key];
  //           if (
  //             key == "Antiskid" || key == "Oil Resistant" ||
  //             key == "Heat Resistant" || key == "Puncture Resistant" ||
  //             key == "Impact Resistant" || key == "Chemical Resistant" ||
  //             key == "Steel Toe" || key == "Waterproof") {
  //             extra.push(key);
  //           }
  //         }
  //       }
  //     }
  //     this.productAttributesExtra = extra;
  //   }
  // }

  setProductCommonType(filterAttributesList) {
    const filterAttributesListData = filterAttributesList ? filterAttributesList : []
    let isCommonProduct = true;
    if (filterAttributesListData.length > 0) {
      isCommonProduct = false;
    }
    this.isCommonProduct = isCommonProduct;
  }

  setProductImages(imagesArr: any[]) {
    this.productDefaultImage = (imagesArr.length > 0) ? this.imagePath + "" + imagesArr[0]['links']['default'] : '';
    this.productMediumImage  = (imagesArr.length > 0) ? imagesArr[0]['links']['medium'] : '';
    this.productAllImages = [];
    imagesArr.forEach(element => {
      this.productAllImages.push({
        src: this.imagePath + "" + element.links.xlarge,
        default: this.imagePath + "" + element.links.default,
        caption: this.imagePath + "" + element.links.icon,
        thumb: this.imagePath + "" + element.links.icon,
        medium: this.imagePath + "" + element.links.medium,
        small: this.imagePath + "" + element.links.small,
        xxlarge: this.imagePath + "" + element.links.xxlarge,
        video: '',
        title: '',
        contentType: 'IMAGE',
      });
    });
    if (this.productAllImages.length > 0) {
      this.productCartThumb = this.productAllImages[0]['thumb'];
    }
  }

  setProductVideo(videoArr) {
    if (this.productAllImages.length > 0 && videoArr && (videoArr as any[]).length > 0) {
      (videoArr as any[]).reverse().forEach(element => {
        // append all video after first image and atleast has one image
        this.productAllImages.splice(1, 0, {
          src: '',
          default: '',
          caption: '',
          thumb: '',
          medium: '',
          xxlarge: '',
          title: element['title'],
          video: element['link'],
          contentType: 'YOUTUBE_VIDEO'
        });
      });
    }
  }

  refreshProductCrousel() {
    this.refreshSiemaItems$.next({ items: this.productAllImages, type: "refresh", currentSlide: 0 });
  }

  showRating() {
    ClientUtility.scrollToTop(
      2000,
      ClientUtility.offset(<HTMLElement>document.querySelector('#reviewsAll')).top - document.querySelector('header').offsetHeight
    );
  }

  async loadProductShare() {
    if (!this.productShareInstance) {
      const shareURL = this.baseDomain + this.router.url
      const { ProductShareComponent } = await import('./../../components/product-share/product-share.component');
      const factory = this.cfr.resolveComponentFactory(ProductShareComponent);
      this.productShareInstance = this.productShareContainerRef.createComponent(factory, null, this.injector);
      const productResult = {
        productName: this.productName,
        canonicalUrl: this.productUrl
      };
      this.productShareInstance.instance['btmMenu'] = true;
      this.productShareInstance.instance['productResult'] = productResult;
      this.productShareInstance.instance['shareFbUrl'] = CONSTANTS.FB_URL + shareURL + "&redirect_uri="+CONSTANTS.PROD;;
      this.productShareInstance.instance['shareTwitterUrl'] = CONSTANTS.TWITTER_URL + shareURL;
      this.productShareInstance.instance['shareLinkedInUrl'] = CONSTANTS.LINKEDIN_URL + shareURL;
      this.productShareInstance.instance['shareWhatsappUrl'] = this.sanitizer.bypassSecurityTrustUrl("whatsapp://send?text=" + encodeURIComponent(shareURL));
      (this.productShareInstance.instance['removed'] as EventEmitter<boolean>).subscribe(status => {
        this.productShareInstance = null;
        this.productShareContainerRef.detach();
      });
    } else {
      //toggle side menu
      this.productShareInstance.instance['btmMenu'] = true
    }
  }

  // Wishlist related functionality
  getPurchaseList() {
    if(!this.rawProductData){
      return;
    }
    this.isPurcahseListProduct = false;
    if (this.localStorageService.retrieve('user')) {
      const user = this.localStorageService.retrieve('user');
      if (user.authenticated == "true") {
        const request = { idUser: user.userId, userType: "business" };

        this.productService.getPurchaseList(request).subscribe((res) => {
          this.showLoader = false;
          if (res['status'] && res['statusCode'] == 200) {
            let purchaseLists: Array<any> = []
            purchaseLists = res['data'];
            purchaseLists.forEach(element => {
              if (
                (element.productDetail.productBO && element.productDetail.productBO.partNumber == this.defaultPartNumber) ||
                (element.productDetail.productBO && element.productDetail.productBO.partNumber == this.productSubPartNumber)
              ) {
                this.isPurcahseListProduct = true;
              }
            });
          }
        })
      }
    }
  }

  addToPurchaseList() {
    if (this.isPurcahseListProduct) {
      this.removeItemFromPurchaseList();
    } else {
      if (this.localStorageService.retrieve('user')) {
        let user = this.localStorageService.retrieve('user');
        if (user && user.authenticated == "true") {
          let userSession = this.localAuthService.getUserSession();
          this.isPurcahseListProduct = true;
          let obj = {
            "idUser": userSession.userId,
            "userType": "business",
            "idProduct": this.productSubPartNumber ||  this.defaultPartNumber,
            "productName": this.productName,
            "description": this.productDescripton,
            "brand": this.productBrandDetails['brandName'],
            "category": this.productCategoryDetails['categoryCode'],
          };
          this.showLoader = true;
          this.productService.addToPurchaseList(obj).subscribe((res) => {
            this.showLoader = false;
            if (res["status"]) {
              this._tms.show({ type: 'success', text: 'Successfully added to WishList' });
            }
          })
        } else {
          this.goToLoginPage(this.productUrl);
        }
      } else {
        this.goToLoginPage(this.productUrl);
      }
    }
  }
  // TODO : these function is not used in PWA,remove after confirming with team
  removeItemFromPurchaseList() {
    this.showLoader = true;
    let userSession = this.localAuthService.getUserSession();
    let obj = {
      "idUser": userSession.userId,
      "userType": "business",
      "idProduct": this.productSubPartNumber ||  this.defaultPartNumber,
      "productName": this.productName,
      "description": this.productDescripton,
      "brand": this.productBrandDetails['brandName'],
      "category": this.productCategoryDetails['categoryCode'],
    }

    this.productService.removePurchaseList(obj).subscribe(
      res => {
        if (res["status"]) {
          this._tms.show({ type: 'success', text: 'Successfully removed from WishList' });
          this.showLoader = false;
          this.getPurchaseList();
        }
        else {
          this.showLoader = false;
        }
      },
      err => {
        this.showLoader = false;
      }
    )
  }

  // Frequently brought togther functions
  fetchFBTProducts(rootProduct) {
    if (this.productOutOfStock) {
      this.productUtil.resetFBTSource();
    } else {
      this.fbtFlag = false;
      let rootvalidation = this.productUtil.validateProduct(rootProduct['productBO']);
      if (rootProduct['status'] && rootvalidation) {
        let productId = rootProduct['productBO']['partNumber'];
        this.processFBTResponse(rootProduct, this.rawProductFbtData);
        // this.productService.getFBTProducts(productId).subscribe((response) => {
        //   this.showLoader = false;
          
        // }, error => {
        //   this.showLoader = false;
        //   this.fbtFlag = false;
        // });
      }
    }
  }

  processFBTResponse(productResponse, fbtResponse) {
    //console.log('processFBTResponse', 'called');
    if (fbtResponse['status'] && fbtResponse['data']) {
      //console.log('processFBTResponse', 'in');
      let validFbts: any[] = this.productUtil.validateFBTProducts(fbtResponse['data']);
      if (validFbts.length > 0) {
        this.productUtil.changeFBTSource(productResponse, validFbts);
        this.fbtFlag = true;
      } else {
        this.fbtFlag = false;
      }
    } else {
      //console.log('processFBTResponse', 'else');
      this.productUtil.resetFBTSource();
    }
  }

  async showFBT() {
    if (this.fbtFlag) {
      this.modalService.show({
        inputs: { modalData: { isModal: true, backToCartFlow: this.addToCartFromModal.bind(this) } },
        component: FbtComponent,
        outputs: {},
        mConfig: { className: 'ex' }
      });
    } else {
      this.addToCart('/quickorder');
    }
  }

  // cart methods 
  buyNow(routerlink) {
    const buyNow = true;
    const user = this.localStorageService.retrieve('user');
    if (!user || !user.authenticated || user.authenticated === "false") {
      this.addToCart(routerlink, true);
      return;
    }
    this.addToCart(routerlink, buyNow);
  }

  addToCartFromModal(routerLink) {
    this.addToCart(routerLink);
  }

  addToCart(routerlink, buyNow = false) {
    //  to be called on client side only.
    let quantity = Number((<HTMLInputElement>document.querySelector("#product_quantity")).value);;

    if (this.uniqueRequestNo == 0) {
      this.uniqueRequestNo = 1;

      let sessionDetails = this.cartService.getCartSession();

      if (sessionDetails['cart']) {
        this.addProductInCart(routerlink, sessionDetails['cart'], quantity, buyNow);
      } else {
        this.localStorageService.clear('user');
        this.commonService.getSession().subscribe((res) => {
          if (res['statusCode'] != undefined && res['statusCode'] == 500) {
          } else {
            this.localAuthService.setUserSession(res);
            let userSession = this.localAuthService.getUserSession();
            let params = { "sessionid": userSession.sessionId };
            this.cartService.getCartBySession(params).subscribe((cartSession) => {
              if (cartSession['statusCode'] != undefined && cartSession['statusCode'] == 200) {
                this.cartService.orderSummary.next(cartSession);
                this.cartService.cart.next({ count: cartSession["cart"] != undefined ? cartSession['noOfItems'] : 0, currentlyAdded: this.currentAddedProduct });
                this.addProductInCart(routerlink, cartSession['cart'], quantity);
              }
            });
          }
        });
      }
    }

  }

  addProductInCart(routerLink, sessionCartObject, quantity, buyNow?) {

    // this.analyticAddToCart(routerLink); // since legacy buy  now analytic code is used 

    const userSession = this.localStorageService.retrieve('user');
    let sessionItemList: Array<any> = [];
    let sessionDetails = this.cartService.getCartSession();

    if (sessionDetails['itemsList'] == null) {
      sessionItemList = [];
    } else {
      sessionItemList = sessionDetails['itemsList'];
    }

    if (sessionDetails && sessionDetails['itemsList']) {
      sessionDetails['itemsList'].forEach(ele => {
        if ((ele.productId == this.productSubPartNumber) || (ele.productId == this.defaultPartNumber)) {
          return;
        }
      });
    }

    let singleProductItem = {
      "cartId": sessionCartObject.cartId,
      "productId": this.productSubPartNumber || this.defaultPartNumber,
      "createdAt": new Date(),
      "updatedAt": new Date(),
      "amount": Number(this.productMrp),
      "offer": null,
      "amountWithOffer": null,
      "taxes": this.productTax,
      "amountWithTaxes": null,
      "totalPayableAmount": this.productPrice,
      "productName": this.productName,
      "brandName": this.productBrandDetails['brandName'],
      "productMRP": this.productMrp,
      "priceWithoutTax": this.priceWithoutTax,
      "tpawot": this.priceWithoutTax,
      "taxPercentage": this.priceQuantityCountry['taxRule']['taxPercentage'],
      "productSelling": this.productPrice,
      "discount": this.productDiscount,
      "productImg": this.productCartThumb,
      "isPersistant": true,
      "productQuantity": Number(quantity),
      "productUnitPrice": this.productPrice,
      "expireAt": null,
      "productUrl": this.productUrl,
      "bulkPriceMap": this.priceQuantityCountry['bulkPricesIndia'],
      "bulkPrice": this.bulkSellingPrice,
      "bulkPriceWithoutTax": this.bulkPriceWithoutTax,
      "categoryCode": this.productCategoryDetails['categoryCode'],
      "taxonomyCode": this.productCategoryDetails['taxonomyCode']
    };

    // console.log('singleProductItem', singleProductItem);

    if (buyNow) {
      singleProductItem['buyNow'] = buyNow;
      sessionItemList = [];
    }
    const checkAddToCartData = this.checkAddToCart(sessionItemList, singleProductItem);

    if (checkAddToCartData.isvalid) {
      var taxonomy = this.productCategoryDetails['taxonomyCode'];
      var trackingData = {
        event_type: "click",
        label: routerLink == "/quickorder" ? "add_to_cart" : "buy_now",
        product_name: this.productName,
        msn: this.productSubPartNumber || this.defaultPartNumber,
        brand: this.productBrandDetails['brandName'],
        price: this.productPrice,
        quantity: Number(quantity),
        channel: "PDP",
        category_l1: taxonomy.split("/")[0] ? taxonomy.split("/")[0] : null,
        category_l2: taxonomy.split("/")[1] ? taxonomy.split("/")[1] : null,
        category_l3: taxonomy.split("/")[2] ? taxonomy.split("/")[2] : null,
        page_type: "product_page"
      }

      this.dataService.sendMessage(trackingData);

      this.showLoader = true;
      sessionDetails["cart"]["buyNow"] = buyNow;
      sessionDetails["itemsList"] = checkAddToCartData.itemlist;
      sessionDetails = this.cartService.updateCart(sessionDetails);
      this.currentAddedProduct = Object.assign({}, singleProductItem);
      if (!buyNow) {
        this.cartService.setCartSession(sessionDetails);
      }
      this.cartSession = this.cartService.getCartSession();
      this.productUtil.checkRootItemInCart(this.currentAddedProduct['productId']);

      let user = this.localStorageService.retrieve('user');
      if (buyNow) {
        const cartSession = this.removePromoCode(sessionDetails);
        sessionDetails = cartSession;
      }
      /**
       * Below case is only when user is not loggedin or usersession is set to undefined or null.
       */
      if (buyNow && (!userSession || userSession['authenticated'] != "true")) {
        this.cartService.buyNowSessionDetails = sessionDetails;
        this.router.navigateByUrl('/checkout', { state: buyNow ? { buyNow: buyNow } : {} });   //this redirect to quick order page
        return;
      }
      this.showLoader = true;
      this.cartService.updateCartSessions(routerLink, sessionDetails, buyNow).subscribe(data => {
        this.showLoader = false;
        this.updateCartSessions(data, routerLink, buyNow);
      }, err => {
        this.showLoader = false;
        this.updateCartSessions(null, routerLink);
      });
      if (this.cartSession['itemsList'] !== null && this.cartSession['itemsList']) {
        var totQuantity = 0;
        var trackData = {
          event_type: "click",
          page_type: "product_page",
          label: "cart_updated",
          channel: "PDP",
          price: this.cartSession["cart"]["totalPayableAmount"] ? this.cartSession["cart"]["totalPayableAmount"].toString() : "",
          quantity: this.cartSession["itemsList"].map(item => {
            return totQuantity = totQuantity + item.productQuantity;
          })[this.cartSession["itemsList"].length - 1],
          shipping: parseFloat(this.cartSession["shippingCharges"]),
          itemList: this.cartSession["itemsList"].map(item => {
            return {
              category_l1: item["taxonomyCode"] ? item["taxonomyCode"].split("/")[0] : null,
              category_l2: item["taxonomyCode"] ? item["taxonomyCode"].split("/")[1] : null,
              category_l3: item["taxonomyCode"] ? item["taxonomyCode"].split("/")[2] : null,
              price: item["totalPayableAmount"].toString(),
              quantity: item["productQuantity"]
            }
          })
        }
        this.dataService.sendMessage(trackData);
      }
    }


  }

  updateCartSessions(data, routerLink, buyNow?) {
    if (data && data.status) {
      // this.sessionDetails = data;
      this.uniqueRequestNo = 0;
      this.cartService.setCartSession(data);
      // debugger;
      this.cartService.cart.next({ count: data['noOfItems'], currentlyAdded: this.currentAddedProduct });
      this.showAddToCartToast();

      let td: any = new Date();
      td.setHours(21, 0, 0);
      td = td.getTime() / 1000;
      let nd: any = new Date();
      nd.setHours(8, 0, 0);
      nd.setDate(nd.getDate() + 1);
      nd = nd.getTime() / 1000;
      let cd: any = new Date();
      cd.setHours(cd.getHours() + 2);
      cd = cd.getTime() / 1000;

      let NIGHTFLAG = false;
      if (cd > td && cd < nd)
        NIGHTFLAG = true;

      if (this.isBrowser && this.priceQuantityCountry['bulkPricesModified'] == null)
        (<HTMLInputElement>document.querySelector("#product_quantity")).value = this.productMinimmumQuantity;
      else {
        // alert(this.productMinimmumQuantity);
        (<HTMLInputElement>document.querySelector("#product_quantity")).value = this.bulkPriceSelctedQuatity != 0 ? this.bulkPriceSelctedQuatity : this.productMinimmumQuantity;
      }
      if (routerLink == "/checkout") {
        this.router.navigateByUrl(routerLink, { state: buyNow ? { buyNow: buyNow } : {} });   //this redirect to quick order page
      }
      // else {
      //     this._tms.show({ type: 'success', text: this.addCartMessage });
      // }
    }
    else {
      if (this.isBrowser && this.priceQuantityCountry['bulkPricesModified'] == null) {
        (<HTMLInputElement>document.querySelector("#product_quantity")).value = this.productMinimmumQuantity;
      } else {
        // alert(this.bulkPriceSelctedQuatity);
        // alert(this.productMinimmumQuantity);
        (<HTMLInputElement>document.querySelector("#product_quantity")).value = this.bulkPriceSelctedQuatity != 0 ? this.bulkPriceSelctedQuatity : this.productMinimmumQuantity;
      }
      this.uniqueRequestNo = 0;
    }
  }

  checkAddToCart(itemsList, addToCartItem): { itemlist: any, isvalid: boolean } {
    let isOrderValid: boolean = true;
    let addToCartItemIsExist: boolean = false;
    itemsList.forEach(element => {
      if (addToCartItem.productId === element.productId) {
        addToCartItemIsExist = true;
        let checkProductQuantity = element.productQuantity + addToCartItem.productQuantity;
        if (checkProductQuantity > Number(this.priceQuantityCountry['quantityAvailable'])) {
          element.productQuantity = element.productQuantity;
          this.uniqueRequestNo = 0;
          this._tms.show({type: 'error', text: this.priceQuantityCountry['quantityAvailable']+' is the maximum quantity available.'});
          isOrderValid = false;
        }
        else {
          this.changeBulkPriceQuantity(element.productQuantity);
          element.productQuantity = element.productQuantity + addToCartItem.productQuantity;
          element.taxes = element.productQuantity * this.productTax;
          element.bulkPrice = this.bulkSellingPrice;
          element.bulkPriceWithoutTax = this.bulkPriceWithoutTax;
          element.bulkPriceMap = this.priceQuantityCountry['bulkPricesIndia'];

        }
        element.productUrl = addToCartItem.productUrl;
        element.totalPayableAmount = element.totalPayableAmount + addToCartItem.totalPayableAmount;
        element.tpawot = element.priceWithoutTax + addToCartItem.priceWithoutTax;
      }
    });
    if (!addToCartItemIsExist) {
      let quantity = Number((<HTMLInputElement>document.querySelector("#product_quantity")).value);
      if (addToCartItem.productQuantity > Number(this.priceQuantityCountry['quantityAvailable'])) {
        this.uniqueRequestNo = 0;
        this._tms.show({type: 'error', text: this.priceQuantityCountry['quantityAvailable']+' is the maximum quantity available.'});
        isOrderValid = false;
      }
      else if (!isNaN(quantity) && quantity < this.productMinimmumQuantity) {
        this._tms.show({ type: 'error', text: "Quantity cannot  be less than " + this.productMinimmumQuantity });
        isOrderValid = false;
        this.uniqueRequestNo = 0;
      }
      else if (!isNaN(quantity) && quantity >= this.productMinimmumQuantity) {
        this.changeBulkPriceQuantity(0);
        addToCartItem.bulkPrice = this.bulkSellingPrice;
        addToCartItem.bulkPriceWithoutTax = this.bulkPriceWithoutTax;
        addToCartItem.bulkPriceMap = this.priceQuantityCountry['bulkPricesIndia'];
        itemsList.push(addToCartItem);
      } else {
        this.changeBulkPriceQuantity(0);
        addToCartItem.bulkPrice = this.bulkSellingPrice;
        addToCartItem.bulkPriceWithoutTax = this.bulkPriceWithoutTax;
        addToCartItem.bulkPriceMap = this.priceQuantityCountry['bulkPricesIndia'];
        itemsList.push(addToCartItem);
      }

    }
    return { itemlist: itemsList, isvalid: isOrderValid };
  }
  

  changeBulkPriceQuantity(input, eventFrom?: string) {
    this.bulkPriceSelctedQuatity = 0;
    let value = Number((<HTMLInputElement>document.querySelector("#product_quantity")).value) + input;
    if (value >= 1) {
      if (this.priceQuantityCountry['bulkPricesModified'] && this.priceQuantityCountry['bulkPricesModified'] !== null && this.priceQuantityCountry['bulkPricesModified'].length > 0) {

        this.bulkSellingPrice = null;
        this.bulkPriceWithoutTax = null;
        if (isNaN(value)) {
          value = input;
        }
        let isBulkPriceValid: boolean = false;

        this.priceQuantityCountry['bulkPricesModified'].forEach((element, index) => {
          if (element.minQty <= value && value <= element.maxQty) {

            isBulkPriceValid = true
            this.bulkPriceSelctedQuatity = element.minQty;
            this.bulkSellingPrice = element.bulkSellingPrice;
            this.bulkPriceWithoutTax = element.bulkSPWithoutTax;
            this.bulkDiscount = element.discount;

            let disc = 0;
            if (this.productMrp > 0 && this.productPrice > 0) {
              disc = (((this.productMrp - this.bulkSellingPrice) / this.productMrp) * 100)
              this.productDiscount = disc;
            }
            // Update quantity in input box only when bulk price is selected from bulk price table 
            if (eventFrom && (eventFrom == 'bulkTableClick' || eventFrom == 'incrementButton' || eventFrom == 'decrementButton'))
              (<HTMLInputElement>document.querySelector("#product_quantity")).value = Number((<HTMLInputElement>document.querySelector("#product_quantity")).value) + input;

          }
          if (this.priceQuantityCountry['bulkPricesModified'].length - 1 == index && value >= element.maxQty) {

            isBulkPriceValid = true
            this.bulkPriceSelctedQuatity = element.minQty;
            this.bulkSellingPrice = element.bulkSellingPrice;
            this.bulkPriceWithoutTax = element.bulkSPWithoutTax;
            this.bulkDiscount = element.discount;

            let disc = 0;
            if (this.productMrp > 0 && this.productPrice > 0) {
              disc = (((this.productMrp - this.bulkSellingPrice) / this.productMrp) * 100)
              this.productDiscount = disc;
            }
            // Update quantity in input box only when bulk price is selected from bulk price table 
            if (eventFrom && (eventFrom == 'bulkTableClick' || eventFrom == 'incrementButton' || eventFrom == 'decrementButton'))
              (<HTMLInputElement>document.querySelector("#product_quantity")).value = Number((<HTMLInputElement>document.querySelector("#product_quantity")).value) + input;
          }
        });
        if (!isBulkPriceValid && (eventFrom == 'incrementButton' || value >= this.productMinimmumQuantity)) {
          (<HTMLInputElement>document.querySelector("#product_quantity")).value = Number((<HTMLInputElement>document.querySelector("#product_quantity")).value) + input;
        }
      } else {
        if (eventFrom && (eventFrom == 'bulkTableClick' || eventFrom == 'incrementButton' || (eventFrom == 'decrementButton' && value >= this.productMinimmumQuantity))) {
          (<HTMLInputElement>document.querySelector("#product_quantity")).value = Number((<HTMLInputElement>document.querySelector("#product_quantity")).value) + input;
        }
      }
    } else {
      if ((eventFrom == "decrementButton" && value >= this.productMinimmumQuantity)) {
        (<HTMLInputElement>document.querySelector("#product_quantity")).value = this.productMinimmumQuantity;
      }
    } 

    if(Number((<HTMLInputElement>document.querySelector("#product_quantity")).value) > this.priceQuantityCountry['quantityAvailable']){
      this._tms.show({type: 'error', text: this.priceQuantityCountry['quantityAvailable']+' is the maximum quantity available.'});
    }
  }

  removePromoCode(cartSession) {
    cartSession['offersList'] = [];
    cartSession['extraOffer'] = null;
    cartSession['cart']['totalOffer'] = 0;

    let itemsList = cartSession["itemsList"];
    itemsList.forEach((element, index) => {
      cartSession["itemsList"][index]['offer'] = null;
    });
    return cartSession;
  }

  changeBulkQty(value, index) {
    console.log('changeBulkQty', value, index);
    if (this.isBrowser) {
      (<HTMLInputElement>document.querySelector("#product_quantity")).value = "0";
    }
    this.selectedBulkQuantityIndex = index;
    this.changeBulkPriceQuantity(value, 'bulkTableClick');
  }

  // common functions 
  goToLoginPage(link) {
    let navigationExtras: NavigationExtras = {
      queryParams: { 'backurl': link },
    };
    this.router.navigate(['/login'], navigationExtras);
  }

  navigateToFAQ() {
    this.router.navigate(['faq', { active: 'CRP' }]);
  }

  // dynamically load similar section 
  async onVisibleSimilar(htmlElement) {
    console.log('onVisibleSimilar', 'called');
    if (!this.similarProductInstance) {
      const { SimilarProductsComponent } = await import('./../../components/similar-products/similar-products.component')
      const factory = this.cfr.resolveComponentFactory(SimilarProductsComponent);
      this.similarProductInstance = this.similarProductContainerRef.createComponent(factory, null, this.injector);

      this.similarProductInstance.instance['productName'] = this.productName;
      this.similarProductInstance.instance['categoryCode'] = this.productCategoryDetails['categoryCode'];

      this.similarProductInstance.instance['outOfStock'] = this.productOutOfStock;
      (this.similarProductInstance.instance['showAll'] as EventEmitter<any>).subscribe(similarProducts => {
        this.loadAllSimilar(similarProducts);
      })
    }
  }

  async loadAllSimilar(similarProducts) {
    if (!this.similarAllInstance) {
      this.showLoader = true;
      const { SimilarProductsPopupComponent } = await import('./../../components/similar-products-popup/similar-products-popup.component').finally(() => {
        this.showLoader = false;
      });
      const factory = this.cfr.resolveComponentFactory(SimilarProductsPopupComponent);
      this.similarAllInstance = this.similarAllContainerRef.createComponent(factory, null, this.injector);
      this.similarAllInstance.instance['similarProducts'] = similarProducts;
      (this.similarAllInstance.instance['out'] as EventEmitter<boolean>).subscribe(status => {
        this.similarAllInstance = null;
        this.similarAllContainerRef.detach();
      });
    }
  }

  // dynamically recent products section 
  async onVisibleRecentProduct(htmlElement) {
    // console.log('onVisibleRecentProduct', htmlElement);
    if (!this.recentProductsInstance) {
      const { RecentViewedProductsComponent } = await import('./../../components/recent-viewed-products/recent-viewed-products.component')
      const factory = this.cfr.resolveComponentFactory(RecentViewedProductsComponent);
      this.recentProductsInstance = this.recentProductsContainerRef.createComponent(factory, null, this.injector);
      (this.recentProductsInstance.instance['showAll'] as EventEmitter<any>).subscribe(recentProducts => {
        this.loadAllRecent(recentProducts);
      })
    }
  }

  async loadAllRecent(recentProducts) {
    if (!this.recentAllInstance) {
      this.showLoader = true;
      const { RecentViewedPopupComponent } = await import('./../../components/recent-viewed-popup/recent-viewed-popup.component').finally(() => {
        this.showLoader = false;
      });
      const factory = this.cfr.resolveComponentFactory(RecentViewedPopupComponent);
      this.recentAllInstance = this.recentAllContainerRef.createComponent(factory, null, this.injector);
      this.recentAllInstance.instance['recentProductList'] = recentProducts;
      (this.recentAllInstance.instance['out'] as EventEmitter<boolean>).subscribe(status => {
        this.recentAllInstance = null;
        this.recentAllContainerRef.detach();
      });
    }
  }

  getBrandLink(brandDetails: {}) {
    if (brandDetails == undefined) {
      return [];
    }
    let d = brandDetails["friendlyUrl"];
    return ["/brands/" + d.toLowerCase()];
  }

  postUserQuestion() {
    this.questionMessage = "";
    if (this.localStorageService.retrieve('user')) {
      let user = this.localStorageService.retrieve('user')
      if (user.authenticated == "true") {
        let obj = {
          // new obj for post user question
          "categoryCode": this.productCategoryDetails['categoryCode'],
          "categoryName": this.productCategoryDetails['categoryName'],
          "customerId": user.userId,
          "productMsn": this.productSubPartNumber || this.defaultPartNumber,
          "questionText": this.questionAnswerForm.controls['question'].value,
          "taxonomy": this.productCategoryDetails['taxonomy'],
          "taxonomyCode": this.productCategoryDetails['taxonomyCode']
        }
        this.productService.postQuestion(obj).subscribe(res => {
          if (res['code'] == 200) {
            this.questionAnswerForm.reset();
            this.loadAlertBox("Your question is successfully submitted");
          }
        });
      } else {
        this.goToLoginPage(this.productUrl);
      }
    } else {
      this.goToLoginPage(this.productUrl);
    }
  }

  toggleLoader(status) {
    // console.log('toggleLoader called', status);
    this.showLoader = status;
  }

    // product-rfq 
    async onVisibleProductRFQ(htmlElement)
    {
      this.removeRfqForm();
      console.log('productRFQInstance', this.productRFQInstance);
        if (!this.productRFQInstance) {
            this.intiateRFQQuote(false, false);
        }
    }

    async raiseRFQQuote()
    {
        let user = this.localStorageService.retrieve('user');
        if (user && user.authenticated == "true") {
            this.intiateRFQQuote(true);
        } else {
            let navigationExtras: NavigationExtras = { queryParams: { 'backurl': this.productUrl } };
            this.router.navigate(['/login'], navigationExtras);
        }
    }

    async intiateRFQQuote(inStock, sendAnalyticOnOpen = true)
    {
        const { ProductRFQComponent } = await import('./../../components/product-rfq/product-rfq.component').finally(() => {
            if(sendAnalyticOnOpen){this.analyticRFQ(false)}
        });
        const factory = this.cfr.resolveComponentFactory(ProductRFQComponent);
        this.productRFQInstance = this.productRFQContainerRef.createComponent(factory, null, this.injector);
        this.productRFQInstance.instance['isOutOfStock'] = this.productOutOfStock;
        this.productRFQInstance.instance['isPopup'] = inStock;
        let product = {url:this.productUrl, price:this.productPrice,
            msn: (this.productSubPartNumber || this.defaultPartNumber), productName: this.productName, moq: this.productMinimmumQuantity,
            brand: this.productBrandDetails['brandName'], taxonomyCode: this.productCategoryDetails['taxonomy'],
            adobeTags: ''
        }
        this.productRFQInstance.instance['product'] = product;
        (this.productRFQInstance.instance['isLoading'] as EventEmitter<boolean>).subscribe(loaderStatus =>
        {
            this.toggleLoader(loaderStatus);
        });
        (this.productRFQInstance.instance['onRFQSuccess'] as EventEmitter<boolean>).subscribe((status) =>
        {
            this.analyticRFQ(true);
            this.isRFQSuccessfull = true;
        });
    }
    
    closeRFQAlert(){this.isRFQSuccessfull = false}
  
  async getPincodeForm() {
    this.showLoader = true;
    const { ProductCheckPincodeComponent } = await import('./../../components/product-check-pincode/product-check-pincode.component').finally(() => {
      this.showLoader = false;
    });
    const factory = this.cfr.resolveComponentFactory(ProductCheckPincodeComponent);
    this.pincodeFormInstance = this.pincodeFormContainerRef.createComponent(factory, null, this.injector);
    const productInfo = {};
    productInfo['partNumber'] = this.productSubPartNumber || this.defaultPartNumber;
    productInfo['estimatedDelivery'] = this.priceQuantityCountry['estimatedDelivery'];
    this.pincodeFormInstance.instance['productInfo'] = productInfo;
    this.pincodeFormInstance.instance['openPinCodePopup'] = true;
    (this.pincodeFormInstance.instance['out'] as EventEmitter<boolean>).subscribe(data => {
      console.log('getPincodeForm detached', data);
      // create a new component after component is closed
      // this is required, to refresh input data
      this.pincodeFormInstance = null;
      this.pincodeFormContainerRef.remove();
    });
    if (this.pincodeFormInstance) {
      (this.pincodeFormInstance.instance['sendAnalyticsCall'] as EventEmitter<any>).subscribe(data => {
        this.analyticPincodeAvaliabilty(data.serviceability, data.codserviceability, data.pincode, data.deliveryDays, data.deliveryAnalytics);
      });
    }
    if (this.rfqFormInstance) {
      (this.rfqFormInstance.instance['isLoading'] as EventEmitter<boolean>).subscribe(loaderStatus => {
        this.toggleLoader(loaderStatus);
      });
    }
  }

  async onVisibleOffer(htmlElement) {
    if (!this.productOutOfStock && this.productMrp > 0) {
      const { ProductOffersComponent } = await import('./../../components/product-offers/product-offers.component')
      const factory = this.cfr.resolveComponentFactory(ProductOffersComponent);
      this.offerSectionInstance = this.offerSectionContainerRef.createComponent(factory, null, this.injector);
      (this.offerSectionInstance.instance['viewPopUpHandler'] as EventEmitter<boolean>).subscribe(data => {
        this.viewPopUpOpen(data);
      });
      (this.offerSectionInstance.instance['emaiComparePopUpHandler'] as EventEmitter<boolean>).subscribe(status => {
        this.emiComparePopUpOpen(status);
      });
    }
  }

  async viewPopUpOpen(data) {
    console.log('viewPopUpOpen', data);
    if (!this.offerPopupInstance) {
      this.showLoader = true;
      const { ProductOfferPopupComponent } = await import('./../../components/product-offer-popup/product-offer-popup.component').finally(() => {
        this.showLoader = false;
      });
      const factory = this.cfr.resolveComponentFactory(ProductOfferPopupComponent);
      this.offerPopupInstance = this.offerPopupContainerRef.createComponent(factory, null, this.injector);
      this.offerPopupInstance.instance['data'] = data['block_data'];
      this.offerPopupInstance.instance['openMobikwikPopup'] = true;
      (this.offerPopupInstance.instance['out'] as EventEmitter<boolean>).subscribe(data => {
        console.log('viewPopUpOpen detached', data);
        // create a new component after component is closed
        // this is required, to refresh input data
        this.offerPopupInstance = null;
        this.offerPopupContainerRef.remove();
      });
    }
  }

  async emiComparePopUpOpen(status) {
    if (!this.offerComparePopupInstance && status) {
      this.showLoader = true;
      const quantity = Number((<HTMLInputElement>document.querySelector("#product_quantity")).value);
      const { ProductOfferComparisionComponent } = await import('./../../components/product-offer-comparision/product-offer-comparision.component').finally(() => {
        this.showLoader = false;
      });
      const factory = this.cfr.resolveComponentFactory(ProductOfferComparisionComponent);
      this.offerComparePopupInstance = this.offerComparePopupContainerRef.createComponent(factory, null, this.injector);
      const productInfo = {};
      productInfo['productName'] = this.productName;
      productInfo['minimal_quantity'] = this.productMinimmumQuantity;
      productInfo['priceWithoutTax'] = this.priceWithoutTax;
      this.offerComparePopupInstance.instance['productInfo'] = productInfo;
      this.offerComparePopupInstance.instance['quantity'] = quantity;
      this.offerComparePopupInstance.instance['openEMIPopup'] = true;
      (this.offerComparePopupInstance.instance['out'] as EventEmitter<boolean>).subscribe(data => {
        // create a new component after component is closed
        // this is required, to refresh input data
        this.offerComparePopupInstance = null;
        this.offerComparePopupContainerRef.detach();
      });
      (this.offerComparePopupInstance.instance['isLoading'] as EventEmitter<boolean>).subscribe(loaderStatus => {
        this.toggleLoader(loaderStatus);
      });
    }
  }

  async getFbtIntance(htmlElement) {
    if (!this.fbtComponentInstance) {
      const { FbtComponent } = await import('./../../components/fbt/fbt.component')
      const factory = this.cfr.resolveComponentFactory(FbtComponent);
      this.fbtComponentInstance = this.fbtComponentContainerRef.createComponent(factory, null, this.injector);
      //this.fbtComponentInstance.instance['addToCartFromModal'] = this.addToCartFromModal.bind(this);
      this.fbtComponentInstance.instance['isModal'] = false;
    }
  }

  async showAddToCartToast() {
    if (!this.addToCartToastInstance) {
      const { GlobalToastComponent } = await import('../../components/global-toast/global-toast.component');
      const factory = this.cfr.resolveComponentFactory(GlobalToastComponent);
      this.addToCartToastInstance = this.addToCartToastContainerRef.createComponent(factory, null, this.injector);

      this.addToCartToastInstance.instance['text'] = 'Product added successfully';
      this.addToCartToastInstance.instance['btnText'] = 'VIEW CART';
      this.addToCartToastInstance.instance['btnLink'] = '/quickorder';
      this.addToCartToastInstance.instance['showTime'] = 6000;

      (this.addToCartToastInstance.instance['removed'] as EventEmitter<boolean>).subscribe(status => {
        this.addToCartToastInstance = null;
        this.addToCartToastContainerRef.detach();
      });
    }
  }

  async writeReview() {
    let user = this.localStorageService.retrieve('user');
    if (user && user.authenticated == "true") {

      if (!this.writeReviewPopupInstance) {
        this.showLoader = true;
        const { PostProductReviewPopupComponent } = await import('../../components/post-product-review-popup/post-product-review-popup.component').finally(() => {
          this.showLoader = false;
        });
        const factory = this.cfr.resolveComponentFactory(PostProductReviewPopupComponent);
        this.writeReviewPopupInstance = this.writeReviewPopupContainerRef.createComponent(factory, null, this.injector);

        const productInfo = {};
        productInfo['productName'] = this.productName;
        productInfo['partNumber'] = this.productSubPartNumber || this.defaultPartNumber;

        this.writeReviewPopupInstance.instance['productInfo'] = productInfo;
        (this.writeReviewPopupInstance.instance['removed'] as EventEmitter<boolean>).subscribe(status => {
          // console.log('writeReview removed', status);
          this.writeReviewPopupInstance = null;
          this.writeReviewPopupContainerRef.detach();
        });

        (this.writeReviewPopupInstance.instance['submitted'] as EventEmitter<boolean>).subscribe(status => {
          this.loadAlertBox(
            'Review Submitted Successfully',
            `Thankyou for giving us your <br /> valuable time.`
          );
        });

      }

    } else {
      this.router.navigateByUrl('/login');
    }
  }

  async openPopUpcrousel(slideNumber: number = 1) {
    if (!this.popupCrouselInstance) {
      this.showLoader = true;
      const { ProductCrouselPopupComponent } = await import('../../components/product-crousel-popup/product-crousel-popup.component').finally(() => {
        this.showLoader = false;
      });
      const factory = this.cfr.resolveComponentFactory(ProductCrouselPopupComponent);
      this.popupCrouselInstance = this.popupCrouselContainerRef.createComponent(factory, null, this.injector);

      const options = Object.assign({}, this.iOptions);
      options.pager = false
      this.popupCrouselInstance.instance['options'] = options;
      this.popupCrouselInstance.instance['productAllImages'] = this.productAllImages;
      this.popupCrouselInstance.instance['slideNumber'] = slideNumber;

      (this.popupCrouselInstance.instance['out'] as EventEmitter<boolean>).subscribe(status => {
        this.popupCrouselInstance = null;
        this.popupCrouselContainerRef.remove();
      });
      (this.popupCrouselInstance.instance['currentSlide'] as EventEmitter<boolean>).subscribe(slideData => {
        if(slideData){
          this.moveToSlide$.next(slideData.currentSlide);
        }
      });
    }
  }

  async loadAlertBox(mainText, subText = null, extraSectionName: string = null) {
    if (!this.alertBoxInstance) {
      this.showLoader = true;
      const { AlertBoxToastComponent } = await import('../../components/alert-box-toast/alert-box-toast.component').finally(() => {
        this.showLoader = false;
      });
      const factory = this.cfr.resolveComponentFactory(AlertBoxToastComponent);
      this.alertBoxInstance = this.alertBoxContainerRef.createComponent(factory, null, this.injector);
      this.alertBoxInstance.instance['mainText'] = mainText;
      this.alertBoxInstance.instance['subText'] = subText;
      if(extraSectionName){
        this.alertBoxInstance.instance['extraSectionName'] = extraSectionName;
      }
      (this.alertBoxInstance.instance['removed'] as EventEmitter<boolean>).subscribe(status => {
        this.alertBoxInstance = null;
        this.alertBoxContainerRef.detach();
      });
      setTimeout(() => {
        this.alertBoxInstance = null;
        this.alertBoxContainerRef.detach();
      }, 2000);
    }
  }

  postHelpful(item, yes, no, i) {
    if (this.localStorageService.retrieve('user')) {
      let user = this.localStorageService.retrieve('user');
      if (user.authenticated == "true") {
        let obj = {
          "review_type": "PRODUCT_REVIEW",
          "item_type": "PRODUCT",
          "item_id": item.item_id,
          "review_id": item.review_id.uuid,
          "user_id": user.userId,
          "is_review_helpful_count_no": no,
          "is_review_helpful_count_yes": yes
        }
        this.productService.postHelpful(obj).subscribe((res) => {
          if (res['code'] == 200) {
            this._tms.show({ type: 'success', text: 'Your feedback has been taken' });
            this.reviews.reviewList[i]['isPost'] = true;
            this.reviews.reviewList[i]['like'] = yes;
            this.reviews.reviewList[i]['dislike'] = no;
          }
        });
      } else {
        this.goToLoginPage(this.productUrl);
      }
    } else {
      this.goToLoginPage(this.productUrl);
    }
  }

  async showYTVideo(link) {
    if (!this.youtubeModalInstance) {
      let ytParams = '?autoplay=1&rel=0&controls=1&loop&enablejsapi=1';
      let videoDetails = { url: link, params: ytParams };
      let modalData = { component: YoutubePlayerComponent, inputs: null, outputs: {}, mConfig: { showVideoOverlay: true } };
      modalData.inputs = { videoDetails: videoDetails };
      this.modalService.show(modalData);
    }
  }


  // SEO SECTION STARTS
  /** 
   * Please place all functional code above this section
   */
  setMetatag() {
    if(!this.rawProductData){
      return;
    }
    let title = this.productName;
    let pageTitleName = this.productName;
    const pwot = this.priceWithoutTax;

    if (pwot && pwot > 0) {
      title += " - Buy at Rs." + this.productPrice
    }

    if (this.productOutOfStock == true) {
      this.pageTitle.setTitle("Buy " + title + " Online At Best Price On Moglix");
    } else {
      this.pageTitle.setTitle("Buy " + title + " Online At Price ₹" + this.productPrice);
    }

    let metaDescription = '';

    if (
      this.rawProductData["seoDetails"] &&
      this.rawProductData["seoDetails"]["metaDescription"] != undefined &&
      this.rawProductData["seoDetails"]["metaDescription"] != null &&
      this.rawProductData["seoDetails"]["metaDescription"] != ""
    )
      metaDescription = this.rawProductData["seoDetails"]["metaDescription"]
    else {
      if (this.productOutOfStock == true) {
        metaDescription = "Buy " + this.productName + " Online in India at moglix. Shop from the huge range of " + this.productBrandDetails['brandName'] + " " + this.productCategoryDetails['categoryName'] + ". ✯ Branded " + this.productCategoryDetails['categoryName'] + " ✯ Lowest Price ✯ Best Deals ✯ COD";
      } else {
        metaDescription = "Buy " + this.productName + " Online in India at price ₹" + this.productPrice + ". Shop from the huge range of " + this.productBrandDetails['brandName'] + " " + this.productCategoryDetails['categoryName'] + ". ✯ Branded " + this.productCategoryDetails['categoryName'] + " ✯ Lowest Price ✯ Best Deals ✯ COD";
      }
    }
    this.meta.addTag({ "name": "description", "content": metaDescription });

    this.meta.addTag({ "name": "og:description", "content": metaDescription })
    this.meta.addTag({ "name": "og:url", "content": CONSTANTS.PROD + "/" + this.getProductURL() })
    this.meta.addTag({ "name": "og:title", "content": title })
    this.meta.addTag({ "name": "og:image", "content": this.productDefaultImage })
    this.meta.addTag({ "name": "robots", "content": CONSTANTS.META.ROBOT });
    this.meta.addTag({ "name": "keywords", "content": this.productName + ", " + this.productCategoryDetails['categoryName'] + ", " + this.productBrandDetails['brandName'] });
    if (this.isServer) {
      const links = this.renderer2.createElement('link');

      links.rel = "canonical";
      let url = this.productUrl;
      if ( !this.isCommonProduct && !this.listOfGroupedCategoriesForCanonicalUrl.includes(this.productCategoryDetails['categoryCode'])) {
        url = this.rawProductData.productPartDetails[this.rawProductData['partNumber']].canonicalUrl ? this.rawProductData.productPartDetails[this.rawProductData['partNumber']].canonicalUrl : this.rawProductData['defaultCanonicalUrl'];
      }
      
      if (url && url.substring(url.length - 2, url.length) == "-g") {
        url = url.substring(0, url.length - 2);
      }
  
      links.href = CONSTANTS.PROD + "/" + url;
      this.renderer2.appendChild(this.document.head, links);
    }

  }

  getProductURL() {
    const productURL = this.rawProductData.productPartDetails[this.productSubPartNumber]['canonicalUrl'];
    const finalURL = productURL ? productURL : this.productUrl;
    return finalURL;
  }

  setQuestionAnswerSchema() {
    if (this.isServer && this.rawProductData ) {
      // console.log('setQuestionAnswerSchema rawProductData', this.rawProductData);
      const qaSchema: Array<any> = [];
      if (this.isServer) {
        
        const questionAnswerList = this.questionAnswerList['data']
        // console.log('questionAnswerList', questionAnswerList);
        if (questionAnswerList['totalCount'] > 0) {
          (questionAnswerList['qlist'] as []).forEach((element, index) => {
            qaSchema.push({
              "@type": "Question",
              "name": element['questionText'],
              "acceptedAnswer": {
                "@type": "Answer",
                "text": element['answerText']
              }
            })
          })
          let qna = this.renderer2.createElement('script');
          qna.type = "application/ld+json";
          qna.text = JSON.stringify({ "@context": CONSTANTS.SCHEMA, "@type": "FAQPage", "mainEntity": qaSchema });
          this.renderer2.appendChild(this.document.head, qna);
        }
      }
    }
  }

  setProductSeoSchema() {

    if (this.isServer && this.rawProductData) {
      let inStock = (!this.productOutOfStock) ? "http://schema.org/InStock" : "http://schema.org/OutOfStock";
      let reviewCount = this.reviews.summaryData.review_count > 0 ? this.reviews.summaryData.review_count : 1;
      let ratingValue = this.reviews.summaryData.final_average_rating > 0 ? this.reviews.summaryData.final_average_rating : 3.5;
      let imageSchema = this.renderer2.createElement('script');
      imageSchema.type = "application/ld+json";

      imageSchema.text = JSON.stringify({
        "@context": CONSTANTS.SCHEMA,
        "@type": "ImageObject",
        "url": this.productDefaultImage,
        "name": this.productName,
      })

      // console.log('schema not 2 1', 'called');

      this.renderer2.appendChild(this.document.head, imageSchema);

      if (this.productPrice > 0) {
        let s = this.renderer2.createElement('script');
        s.type = "application/ld+json";
        let desc = this.productDescripton;
        if (!desc) {
          desc = `${this.productName} is a premium quality ${this.productCategoryDetails['categoryName']} from ${this.productBrandDetails['brandName']}. Moglix is a well-known ecommerce platform for qualitative range of ${this.productCategoryDetails['categoryName']}. All ${this.productName} are manufactured by using quality assured material and advanced techniques, which make them up to the standard in this highly challenging field. The materials utilized to manufacture ${this.productName}, are sourced from the most reliable and official ${this.productCategoryDetails['categoryName']} vendors, chosen after performing detailed market surveys. Thus, ${this.productBrandDetails['brandName']} products are widely acknowledged in the market for their high quality. We are dedicatedly involved in providing an excellent quality array of ${this.productBrandDetails['brandName']} ${this.productCategoryDetails['categoryName']}.`;
        }
        let schema = {
          "@context": CONSTANTS.SCHEMA,
          "@type": "Product",
          "name": this.productName,
          "image": [this.productDefaultImage],
          "description": desc,
          "sku": this.productSubPartNumber,
          "mpn": this.productSubPartNumber,
          "brand": {
            "@type": "Thing",
            "name": this.productBrandDetails['brandName'],
          },
          "aggregateRating": {
            "@type": "AggregateRating",
            "ratingValue": ratingValue,
            "ratingCount": reviewCount,
            "bestRating": "5",
            "worstRating": "1"
          },
          "offers": {
            "@type": "Offer",
            "url": CONSTANTS.PROD + this.productUrl,
            "priceCurrency": "INR",
            "price": (this.productPrice * this.productMinimmumQuantity).toString(),
            "itemCondition": CONSTANTS.SCHEMA + "/NewCondition",
            "availability": inStock,
            "seller": {
              "@type": "Organization",
              "name": "Moglix"
            },
            "acceptedPaymentMethod": [
              {
                "@type": "PaymentMethod",
                "@id": CONSTANTS.ByBankTransferInAdvance
              },
              {
                "@type": "PaymentMethod",
                "@id": CONSTANTS.ByCOD
              },
              {
                "@type": "PaymentMethod",
                "@id": CONSTANTS.ByPaymentMethodCreditCard
              },
              {
                "@type": "PaymentMethod",
                "@id": CONSTANTS.ByMasterCard
              },
              {
                "@type": "PaymentMethod",
                "@id": CONSTANTS.ByVISA
              }
            ]
          }
        }

        // console.log('schema', schema);

        if (!this.priceQuantityCountry) {
          delete schema['offers']['availability'];
        } else if (!this.priceQuantityCountry['quantityAvailable']) {
          delete schema['offers']['availability'];
        } else if (this.priceQuantityCountry['quantityAvailable'] == 0) {
          delete schema['offers']['availability'];
        }

        s.text = JSON.stringify(schema);
        this.renderer2.appendChild(this.document.head, s);
      }else{
        console.log('product schema not created due to price zero');
      }

      // console.log('schema not 2 2', 'called');

    }else{
      console.log('product schema not created');
    }
  }

  // ANALYTIC CODE SECTION STARTS
  /** 
   * Please place all functional code above this section
   */
  callAnalyticForVisit() {
    if (this.isBrowser && this.rawProductData ) {
      this.setSessionForClickSection();
      this.productVisitAdobe();
      this.productVisitGTM();
      this.productVisitViaSocket();
      this.productVisitViaAPI();
    }
  }

  setSessionForClickSection() {
    if (this.isBrowser && sessionStorage.getItem('pdp-page')) {
        this.commonService.setSectionClick(sessionStorage.getItem('pdp-page'));
    }
  }

  productVisitViaSocket() {
    const dataTracking = {
      active_tags: null,
      event_type: "page_load",
      label: "view",
      rating: this.productRating,
      product_name: this.productName,
      msn: this.productSubPartNumber,
      brand: this.productBrandDetails['brandName'],
      category_l1: this.productCategoryDetails['taxonomy'].split("/")[0] ? this.productCategoryDetails['taxonomy'].split("/")[0] : null,
      category_l2: this.productCategoryDetails['taxonomy'].split("/")[1] ? this.productCategoryDetails['taxonomy'].split("/")[1] : null,
      category_l3: this.productCategoryDetails['taxonomy'].split("/")[2] ? this.productCategoryDetails['taxonomy'].split("/")[2] : null,
      oos: this.productOutOfStock.toString(),
      channel: "PDP",
      search_query: null,
      active_promo_codes: "",
      url_complete_load_time: null,
      time_to_interactive: null,
      page_type: "product page"
    }
    if (this.priceQuantityCountry != null) {
      dataTracking['price'] = this.priceQuantityCountry.sellingPrice;
    }
    this.analytics.sendToClicstreamViaSocket(dataTracking);
  }

  productVisitViaAPI() {
    var clickStreamData = {
      msn: this.productSubPartNumber,
      url_link: this.productUrl,
      availability_for_order: !this.productOutOfStock == true ? 1 : 0,
      session_id: this.localStorageService.retrieve('user') ? this.localStorageService.retrieve('user').sessionId : '',
      created_by_source: 'Mobile',
      category_id: this.productCategoryDetails['categoryCode'],
      category_name: this.productCategoryDetails['categoryName'],
      id_brand: this.productBrandDetails['idBrand'],
      brand_name: this.productBrandDetails['brandName'],
      product_name: this.productName,
      user_id: this.localStorageService.retrieve('user') ? this.localStorageService.retrieve('user').userId : null,
      // this data is  used for recently viewed API and we use medium image for same
      product_image: this.productMediumImage,
      status: this.rawProductData['status'],
      product_url: this.productUrl,
    };
    if (this.priceQuantityCountry != null) {
      clickStreamData['mrp'] = this.productMrp;
      clickStreamData['price_without_tax'] = this.priceWithoutTax;
      clickStreamData['price_with_tax'] = this.productPrice;
      clickStreamData['out_of_stock'] = this.productOutOfStock;
    }
    this.analytics.sendToClicstreamViaAPI(clickStreamData);
  }

  productVisitGTM() {
    let gtmDataObj = [];
    const gaGtmData = this.localStorageService.retrieve('gaGtmData');
    if (this.productOutOfStock) {
      gtmDataObj.push({
        'event': 'rqnProductPage',
        'ecommerce': {
          "rqn_product_name": this.productName
        }
      });
    }
    gtmDataObj.push({
      'event': 'productView',
      'ecommerce': {
        'detail': {
          'actionField': { 'list': (gaGtmData && gaGtmData['list']) ? gaGtmData['list'] : "" },
          'products': [
            {
              'name': this.productName,
              'id': this.productSubPartNumber,
              'price': this.productPrice,
              'brand': this.productBrandDetails['brandName'],
              'category': (gaGtmData && gaGtmData['category']) ? gaGtmData['category'] : this.productCategoryDetails['categoryName'],
              'variant': '',
              'stockStatus': this.productOutOfStock ? "Out of Stock" : "In Stock",
            }]
        }
      },
    });
    const google_tag_params = {
      ecomm_prodid: this.productSubPartNumber,
      ecomm_pagetype: 'product',
      ecomm_totalvalue: this.productPrice
    };
    gtmDataObj.push({
      'event': 'dyn_remk',
      'ecomm_prodid': google_tag_params.ecomm_prodid,
      'ecomm_pagetype': google_tag_params.ecomm_pagetype,
      'ecomm_totalvalue': google_tag_params.ecomm_totalvalue,
      'google_tag_params': google_tag_params
    });
    const user = this.localStorageService.retrieve('user');
    gtmDataObj.push({
      'event': 'viewItem',
      'email': (user && user["email"]) ? user["email"] : '',
      'ProductID': this.productSubPartNumber,
      'Category': this.productCategoryDetails['taxonomy'],
      'CatID': this.productCategoryDetails['taxonomyCode'],
      'MRP': this.productMrp,
      'Discount': Math.floor(this.productDiscount),
      'ImageURL': this.productDefaultImage
    });

    gtmDataObj.forEach(data => {
      this.analytics.sendGTMCall(data);
    });
  }

  productVisitAdobe() {
    const user = this.localStorageService.retrieve('user');

    let taxo1 = '';
    let taxo2 = '';
    let taxo3 = '';
    if (this.productCategoryDetails['taxonomyCode']) {
      taxo1 = this.productCategoryDetails['taxonomyCode'].split("/")[0] || '';
      taxo2 = this.productCategoryDetails['taxonomyCode'].split("/")[1] || '';
      taxo3 = this.productCategoryDetails['taxonomyCode'].split("/")[2] || '';
    }

    let ele = []; // product tags for adobe;
    this.productTags.forEach((element) => {
      ele.push(element.name);
    });
    const tagsForAdobe = ele.join("|");


    let page = {
      'pageName': "moglix:" + taxo1 + ":" + taxo2 + ":" + taxo3 + ":pdp",
      'channel': "pdp",
      'subSection': "moglix:" + taxo1 + ":" + taxo2 + ":" + taxo3 + ":pdp " + this.commonService.getSectionClick().toLowerCase(),
      'loginStatus': (user && user["authenticated"] == 'true') ? "registered user" : "guest"
    }
    let custData = {
      'customerID': (user && user["userId"]) ? btoa(user["userId"]) : '',
      'emailID': (user && user["email"]) ? btoa(user["email"]) : '',
      'mobile': (user && user["phone"]) ? btoa(user["phone"]) : '',
      'customerType': (user && user["userType"]) ? user["userType"] : '',
    }
    let order = {
      'productID': this.productSubPartNumber,
      'productCategoryL1': taxo1,
      'productCategoryL2': taxo2,
      'productCategoryL3': taxo3,
      'brand': this.productBrandDetails['brandName'],
      'price': this.productPrice,
      'stockStatus': this.productOutOfStock ? "Out of Stock" : "In Stock",
      'tags': tagsForAdobe
    }

    const anlyticData = { page, custData, order }
    this.analytics.sendAdobeCall(anlyticData);
  }

  analyticAddToCart(routerlink) {
    const user = this.localStorageService.retrieve('user');
    const taxonomy = this.productCategoryDetails['taxonomyCode'];
    let taxo1 = '';
    let taxo2 = '';
    let taxo3 = '';
    if (this.productCategoryDetails['taxonomyCode']) {
      taxo1 = this.productCategoryDetails['taxonomyCode'].split("/")[0] || '';
      taxo2 = this.productCategoryDetails['taxonomyCode'].split("/")[1] || '';
      taxo3 = this.productCategoryDetails['taxonomyCode'].split("/")[2] || '';
    }

    let ele = []; // product tags for adobe;
    this.productTags.forEach((element) => {
      ele.push(element.name);
    });
    const tagsForAdobe = ele.join("|");

    let page = {
      'linkPageName': "moglix:" + taxo1 + ":" + taxo2 + ":" + taxo3 + ":pdp",
      'linkName': routerlink == "/quickorder" ? "Add to cart" : "Buy Now",
    }
    let custData = {
      'customerID': (user && user["userId"]) ? btoa(user["userId"]) : '',
      'emailID': (user && user["email"]) ? btoa(user["email"]) : '',
      'mobile': (user && user["phone"]) ? btoa(user["phone"]) : '',
      'customerType': (user && user["userType"]) ? user["userType"] : '',
    }
    let order = {
      'productID': this.productSubPartNumber || this.defaultPartNumber, // TODO: partNumber
      'parentID': this.productSubPartNumber,
      'productCategoryL1': taxo1,
      'productCategoryL2': taxo2,
      'productCategoryL3': taxo3,
      'price': this.productPrice,
      'quantity': this.priceQuantityCountry['quantityAvailable'],
      'brand': this.productBrandDetails['brandName'],
      'tags': tagsForAdobe
    }
    this.analytics.sendAdobeCall({ page, custData, order }, "genericClick");

    this.analytics.sendGTMCall({
      'event': 'addToCart',
      'ecommerce': {
        'currencyCode': 'INR',
        'add': {
          'products': [{
            'name': this.productName,     // Name or ID of the product is required.
            'id': this.productSubPartNumber, // todo: partnumber
            'price': this.productPrice,
            'brand': this.productBrandDetails['brandName'],
            'category': (this.productCategoryDetails && this.productCategoryDetails['taxonomy']) ? this.productCategoryDetails['taxonomy'] : '',
            'variant': '',
            'quantity': this.priceQuantityCountry['quantityAvailable'],
            'productImg': this.productDefaultImage
          }]
        }
      },
    })

    var trackingData = {
      event_type: "click",
      label: routerlink == "/quickorder" ? "add_to_cart" : "buy_now",
      product_name: this.productName,
      msn: this.productSubPartNumber,
      brand: this.productBrandDetails['brandName'],
      price: this.productPrice,
      quantity: Number(this.priceQuantityCountry['quantityAvailable']),
      channel: "PDP",
      category_l1: taxonomy.split("/")[0] ? taxonomy.split("/")[0] : null,
      category_l2: taxonomy.split("/")[1] ? taxonomy.split("/")[1] : null,
      category_l3: taxonomy.split("/")[2] ? taxonomy.split("/")[2] : null,
      page_type: "product_page"
    }
    this.analytics.sendToClicstreamViaSocket(trackingData);

  }

  analyticRFQ(isSubmitted: boolean = false) {
    const user = this.localStorageService.retrieve('user');
    let taxo1 = '';
    let taxo2 = '';
    let taxo3 = '';
    if (this.productCategoryDetails['taxonomyCode']) {
      taxo1 = this.productCategoryDetails['taxonomyCode'].split("/")[0] || '';
      taxo2 = this.productCategoryDetails['taxonomyCode'].split("/")[1] || '';
      taxo3 = this.productCategoryDetails['taxonomyCode'].split("/")[2] || '';
    }
    let ele = []; // product tags for adobe;
    this.productTags.forEach((element) => {
      ele.push(element.name);
    });
    const tagsForAdobe = ele.join("|");

    this.analytics.sendGTMCall({
      'event': !this.productOutOfStock ? 'rfq_instock' : 'rfq_oos'
    })

    if (isSubmitted) {
      this.analytics.sendGTMCall({
        'event': !this.productOutOfStock ? 'instockformSubmit' : 'oosformSubmit',
        'customerInfo': {
          "firstName": user['first_name'],
          "lastName": user['last_name'],
          "email": user['email'],
          "mobile": user['phone']
        },
        'productInfo': {
          'productName': this.productName,
          'brand': this.productBrandDetails['brandName'],
          'quantity': (this.priceQuantityCountry)?this.priceQuantityCountry['quantityAvailable']: null
        }
      });
    }

    /*Start Adobe Analytics Tags */
    let page = null;
    if (!isSubmitted) {
      page = {
        'pageName': "moglix:bulk request form",
        'channel': "bulk request form",
        'subSection': "moglix:bulk request form",
        'loginStatus': (user && user["authenticated"] == 'true') ? "registered user" : "guest"
      }
    } else {
      page = {
        'pageName': "moglix:bulk request form",
        'channel': "bulk request form",
        'subSection': "moglix:bulk request form",
        'loginStatus': (user && user["authenticated"] == 'true') ? "registered user" : "guest",
        'linkPageName': "moglix:bulk request form",
        'linkName': "Get Quote"
      }
    }

    let custData = {
      'customerID': (user && user["userId"]) ? btoa(user["userId"]) : '',
      'emailID': (user && user["email"]) ? btoa(user["email"]) : '',
      'mobile': (user && user["phone"]) ? btoa(user["phone"]) : '',
      'customerType': (user && user["userType"]) ? user["userType"] : '',
    }
    let order = {
      'productID': this.productSubPartNumber,
      'productCategoryL1': taxo1,
      'productCategoryL2': taxo2,
      'productCategoryL3': taxo3,
      'brand': this.productBrandDetails['brandName'],
      'tags': tagsForAdobe
    }
    this.analytics.sendAdobeCall({ page, custData, order }, (isSubmitted)?"genericClick":"genericPageLoad");
  }

  analyticPincodeAvaliabilty(serviceability, codserviceability, pincode, deliveryDays, deliveryAnalytics) {
    const taxonomy = this.productCategoryDetails['taxonomy'];
    let taxo1 = '';
    let taxo2 = '';
    let taxo3 = '';
    if (this.productCategoryDetails['taxonomyCode']) {
      taxo1 = this.productCategoryDetails['taxonomyCode'].split("/")[0] || '';
      taxo2 = this.productCategoryDetails['taxonomyCode'].split("/")[1] || '';
      taxo3 = this.productCategoryDetails['taxonomyCode'].split("/")[2] || '';
    }
    const user = this.localStorageService.retrieve('user');
    let page = {
      'linkPageName': "moglix: " + taxo1 + ":" + taxo2 + ":" + taxo3 + ": pdp",
      'linkName': 'check now',
      'channel': 'pdp',
      'loginStatus': (user.userId) ? 'registered' : 'guest',
    }
    let custData = {
      'customerID': (user && user["userId"]) ? btoa(user["userId"]) : '',
      'emailID': (user && user["email"]) ? btoa(user["email"]) : '',
      'mobile': (user && user["phone"]) ? btoa(user["phone"]) : '',
      'customerType': (user && user["userType"]) ? user["userType"] : '',
    }
    let order = {
      'productID': this.productSubPartNumber,
      'productCategoryL1': taxo1,
      'productCategoryL2': taxo2,
      'productCategoryL3': taxo3,
      'brand': this.productBrandDetails['brandName'],
      'productPrice': this.productPrice,
      'serviceability': (serviceability) ? 'yes' : 'no',
      'codserviceability': (codserviceability) ? 'yes' : 'no',
      'pincode': pincode,
      'deliveryTAT': deliveryDays ? deliveryDays : 'NA',
      'deliveryAnalytics': deliveryAnalytics
    }
    this.analytics.sendAdobeCall({ page, custData, order }, "genericClick");
  }

  remoteApiCallRecentlyBought() {
    if (this.rawProductData && this.rawProductCountData && !this.productOutOfStock) {
      if (
        this.rawProductCountData['status'] == true && this.rawProductCountData['data'] &&
        this.rawProductCountData['data']['orderCount'] && parseInt(this.rawProductCountData['data']['orderCount']) !== 0 &&
        parseInt(this.rawProductCountData['data']['orderCount']) > 10
      ) {
        this.recentBoughtOrderCount = this.rawProductCountData['data']['orderCount'];
      }
    }
  }
  
  scrollToResults(id: string) {
    this.isRFQSuccessfull = false;
    this._pageScrollService.scroll({
      document: this.document,
      scrollTarget: id,
    });
  }

  pseudoFnc() {

  }
    
  ngOnDestroy() {
    if (this.isBrowser) {
      sessionStorage.removeItem('pdp-page');
    }
    this.resetLazyComponents();
  }

}
