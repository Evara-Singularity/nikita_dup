import {
  Component,
  ComponentFactoryResolver,
  ElementRef,
  Injector,
  Input,
  EventEmitter,
  ViewChild,
  ViewContainerRef,
} from "@angular/core";
import { FormGroup } from "@angular/forms";
import CONSTANTS from "@app/config/constants";
import { ClientUtility } from "@app/utils/client.utility";
import { ProductService } from "@app/utils/services/product.service";
import { BehaviorSubject, forkJoin, Subject } from "rxjs";

interface ProductDataArg {
  productBO: string;
  refreshCrousel?: boolean;
  subGroupMsnId?: string;
}

@Component({
  selector: "app-product-oos-similar-card",
  templateUrl: "./product-oos-similar-card.component.html",
  styleUrls: ["./product-oos-similar-card.component.scss"],
})
export class ProductOosSimilarCardComponent {
  breadcrumData: any;
  @Input("productMsn") productMsn;
  @Input("index") index: number;
  productData;
  encodeURI = encodeURI;
  readonly imagePath = CONSTANTS.IMAGE_BASE_URL;
  readonly baseDomain = CONSTANTS.PROD;
  readonly DOCUMENT_URL = CONSTANTS.DOCUMENT_URL;
  readonly imagePathAsset = CONSTANTS.IMAGE_ASSET_URL;

  isServer: boolean;
  isBrowser: boolean;
  //conditions vars
  rawProductData: any = null;
  rawProductCountData: any = null;
  rawProductCountMessage = null;
  rawCartNotificationMessage = null;
  uniqueRequestNo: number = 0;
  currentAddedProduct: any;
  cartSession: any;
  bulkPriceSelctedQuatity: number;
  bulkDiscount: any;
  selectedBulkQuantityIndex: any;
  productNotFound: boolean = false;
  //general product info
  defaultPartNumber: string = null;
  productTags: any[] = null;
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
  bulkPriceWithoutTax: number = null; //bulk price without tax
  isPurcahseListProduct: boolean = false;
  productDescripton: string = null;
  productBrandDetails: any;
  productCategoryDetails: any;
  productUrl: string;
  productTax: number = 0;
  productCartThumb: string = "";
  productMinimmumQuantity: any = 1;
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
  isProductReturnAble: boolean = false;
  //Product Question answer
  questionAnswerForm: FormGroup;
  //review and rating
  rawReviewsData = null;
  reviews: any = null;
  reviewLength: number;
  selectedReviewType: string = "helpful";
  starsCount: number = null;
  //breadcrumm related data
  breadcrumpUpdated: BehaviorSubject<any> = new BehaviorSubject<any>(0);
  breadcrumbData = null;
  // product image crousel settings
  productAllImages: any[] = null;
  refreshSiemaItems$ = new Subject<{
    items: Array<{}>;
    type: string;
    currentSlide: number;
  }>();
  moveToSlide$ = new Subject<number>();
  carouselInitialized: boolean = false;
  //frequently bought together
  fbtFlag = false;
  isRFQSuccessfull = false;
  similarProducts = [];
  displayCardCta = false;
  questionAnswerPopup = false;
  productInfoPopup = false;
  isProductCrouselLoaded: boolean = false;
  productImages = null;
  refinedProdTags = [];

  // ondemad loaded components for features & specification
  productInfoPopupInstance = null;
  @ViewChild("productInfoPopup", { read: ViewContainerRef })
  productInfoPopupContainerRef: ViewContainerRef;
  // ondemand product crousel
  productCrouselInstance = null;
  @ViewChild("productCrousel", { read: ViewContainerRef })
  productCrouselContainerRef: ViewContainerRef;
  @ViewChild("productCrouselPseudo", { read: ElementRef })
  productCrouselPseudoContainerRef: ElementRef;

  iOptions: any = null;
  showProduct: boolean = false;

  constructor(
    private productService: ProductService,
    private cfr: ComponentFactoryResolver,
    private injector: Injector
  ) {}

  ngOnInit() {
    if (this.productMsn) {
      this.createSiemaOption();
      this.getProductData();
    }
  }

  getProductData() {
    // Product API url
    forkJoin([
      this.productService.getProduct(this.productMsn),
      this.productService.getProductPageBreadcrum(this.productMsn),
    ]).subscribe((rawData) => {
      this.breadcrumData = rawData[1];
      if (
        rawData[0]["productBO"] &&
        Object.values(rawData[0]["productBO"]["productPartDetails"])[0][
          "images"
        ] !== null
      ) {
        this.processProductData(
          {
            productBO: rawData[0]["productBO"],
            refreshCrousel: true,
            subGroupMsnId: null,
          },
          rawData[0]
        );
        this.showProduct = true;
      }
    });
  }

  async handleProductInfoPopup(infoType, cta) {
    this.displayCardCta = true;
    const { ProductInfoComponent } = await import(
      "./../../../modules/product-info/product-info.component"
    ).finally(() => {
      // hide loader
    });
    const factory = this.cfr.resolveComponentFactory(ProductInfoComponent);
    this.productInfoPopupInstance =
      this.productInfoPopupContainerRef.createComponent(
        factory,
        null,
        this.injector
      );
    this.productInfoPopupInstance.instance["modalData"] =
      this.getProductInfo(infoType);
    this.productInfoPopupInstance.instance["openProductInfo"] = true;
    (
      this.productInfoPopupInstance.instance[
        "closePopup$"
      ] as EventEmitter<boolean>
    ).subscribe((data) => {
      this.productInfoPopupInstance = null;
      this.productInfoPopupContainerRef.remove();
      this.displayCardCta = false;
    });
  }

  getProductInfo(infoType) {
    const productInfo = {};
    productInfo["mainInfo"] = {
      productName: this.productName,
      imgURL: this.productAllImages[0]["large"],
      brandName: this.productBrandDetails["brandName"],
      productMrp: this.productMrp,
      productDiscount: this.productDiscount,
      bulkPriceWithoutTax: this.bulkPriceWithoutTax,
      priceWithoutTax: this.priceWithoutTax,
      taxPercentage: this.taxPercentage,
      bulkDiscount: this.bulkDiscount,
      productOutOfStock: this.productOutOfStock,
    };
    let contentInfo = {};
    if (this.productKeyFeatures && this.productKeyFeatures.length) {
      contentInfo["key features"] = this.productKeyFeatures;
    }
    if (this.productAttributes) {
      const brand = {
        name: this.productBrandDetails["brandName"],
        link: this.getBrandLink(this.productBrandDetails),
      };
      contentInfo["specifications"] = {
        attributes: this.productAttributes,
        brand: brand,
      };
    }
    if (this.productVideos && this.productVideos.length) {
      contentInfo["videos"] = this.productVideos;
    }
    const details = {
      description: this.productDescripton,
      category: this.productCategoryDetails,
      brand: this.productBrandDetails,
      brandCategoryURL: this.productBrandCategoryUrl,
      productName: this.productName,
    };
    contentInfo["product details"] = details;
    const IMAGES = (this.productAllImages as any[]).filter(
      (image) => image["contentType"] === "IMAGE"
    );
    if (IMAGES.length) {
      contentInfo["images"] = IMAGES;
    }
    productInfo["contentInfo"] = contentInfo;
    productInfo["infoType"] = infoType;
    return productInfo;
  }

  processProductData(args: ProductDataArg, rawData) {
    this.rawProductData = args.productBO;
    // required for goruped products
    this.defaultPartNumber =
      args.subGroupMsnId != null
        ? args.subGroupMsnId
        : this.rawProductData["defaultPartNumber"];
    const partNumber =
      args.subGroupMsnId != null
        ? args.subGroupMsnId
        : this.rawProductData["partNumber"];
    this.productSubPartNumber = partNumber;
    // mapping general information
    this.productName = this.rawProductData["productName"];
    this.isProductReturnAble = this.rawProductData["returnable"] || false;
    this.productDescripton = this.rawProductData["desciption"];
    this.productBrandDetails = this.rawProductData["brandDetails"];
    this.productCategoryDetails = this.rawProductData["categoryDetails"][0];
    this.productUrl = this.rawProductData["defaultCanonicalUrl"];
    this.productKeyFeatures = this.rawProductData["keyFeatures"];
    this.productVideos = this.rawProductData["videosInfo"];
    this.productDocumentInfo = this.rawProductData["documentInfo"];
    this.productTags = this.rawProductData["productTags"];
    this.productAttributes =
      this.rawProductData["productPartDetails"][partNumber]["attributes"] || [];
    this.productRating =
      this.rawProductData["productPartDetails"][partNumber]["productRating"];
    this.productBrandCategoryUrl =
      "brands/" +
      this.productBrandDetails["friendlyUrl"] +
      "/" +
      this.productCategoryDetails["categoryLink"];

    this.isProductPriceValid =
      this.rawProductData["productPartDetails"][partNumber][
        "productPriceQuantity"
      ] != null;
    this.priceQuantityCountry = this.isProductPriceValid
      ? Object.assign(
          {},
          this.rawProductData["productPartDetails"][partNumber][
            "productPriceQuantity"
          ]["india"]
        )
      : null;
    this.productMrp =
      this.isProductPriceValid && this.priceQuantityCountry
        ? this.priceQuantityCountry["mrp"]
        : null;

    if (this.priceQuantityCountry) {
      this.priceQuantityCountry["bulkPricesIndia"] = this.isProductPriceValid
        ? Object.assign(
            {},
            this.rawProductData["productPartDetails"][partNumber][
              "productPriceQuantity"
            ]["india"]["bulkPrices"]
          )
        : null;
      this.priceQuantityCountry["bulkPricesModified"] =
        this.isProductPriceValid &&
        this.rawProductData["productPartDetails"][partNumber][
          "productPriceQuantity"
        ]["india"]["bulkPrices"]["india"]
          ? [
              ...this.rawProductData["productPartDetails"][partNumber][
                "productPriceQuantity"
              ]["india"]["bulkPrices"]["india"],
            ]
          : null;
    }

    this.priceWithoutTax = this.priceQuantityCountry
      ? this.priceQuantityCountry["priceWithoutTax"]
      : null;
    if (
      this.priceQuantityCountry &&
      this.priceQuantityCountry["mrp"] > 0 &&
      this.priceQuantityCountry["priceWithoutTax"] > 0
    ) {
      this.productDiscount =
        ((this.priceQuantityCountry["mrp"] -
          this.priceQuantityCountry["priceWithoutTax"]) /
          this.priceQuantityCountry["mrp"]) *
        100;
    }
    this.taxPercentage = this.priceQuantityCountry
      ? this.priceQuantityCountry["taxRule"]["taxPercentage"]
      : null;
    this.productPrice =
      this.priceQuantityCountry &&
      !isNaN(this.priceQuantityCountry["sellingPrice"])
        ? Number(this.priceQuantityCountry["sellingPrice"])
        : 0;

    this.productTax =
      this.priceQuantityCountry &&
      !isNaN(this.priceQuantityCountry["sellingPrice"]) &&
      !isNaN(this.priceQuantityCountry["sellingPrice"])
        ? Number(this.priceQuantityCountry["sellingPrice"]) -
          Number(this.priceQuantityCountry["sellingPrice"])
        : 0;
    this.productMinimmumQuantity =
      this.priceQuantityCountry && this.priceQuantityCountry["moq"]
        ? this.priceQuantityCountry["moq"]
        : 1;

    // product media processing
    this.setProductImages(
      this.rawProductData["productPartDetails"][partNumber]["images"]
    );
  }

  getBrandLink(brandDetails: {}) {
    if (brandDetails == undefined) {
      return [];
    }
    let d = brandDetails["friendlyUrl"];
    return ["/brands/" + d.toLowerCase()];
  }

  setProductImages(imagesArr: any[]) {
    this.productDefaultImage =
      imagesArr.length > 0
        ? this.imagePath + "" + imagesArr[0]["links"]["default"]
        : "";
    this.productMediumImage =
      imagesArr.length > 0 ? imagesArr[0]["links"]["medium"] : "";
    this.productAllImages = [];
    imagesArr.forEach((element) => {
      this.productAllImages.push({
        src: this.imagePath + "" + element.links.xlarge,
        xlarge: this.imagePath + "" + element.links.xlarge,
        large: this.imagePath + "" + element.links.large,
        default: this.imagePath + "" + element.links.default,
        caption: this.imagePath + "" + element.links.icon,
        thumb: this.imagePath + "" + element.links.icon,
        medium: this.imagePath + "" + element.links.medium,
        small: this.imagePath + "" + element.links.small,
        xxlarge: this.imagePath + "" + element.links.xxlarge,
        video: "",
        title: "",
        contentType: "IMAGE",
      });
    });
    if (this.productAllImages.length > 0) {
      this.productCartThumb = this.productAllImages[0]["thumb"];
    }
  }

  createSiemaOption() {
    // if (!this.rawProductData) {
    //   return;
    // }
    this.iOptions = {
      selector: ".img-siema",
      perPage: 1,
      productNew: true,
      pager: true,
      imageAlt: this.productName,
      onInit: () => {
        setTimeout(() => {
          this.carouselInitialized = true;
        }, 0);
      },
    };
  }

  async loadProductCrousel(slideIndex) {
    if (!this.productCrouselInstance) {
      this.isProductCrouselLoaded = true;
      const { ProductCrouselComponent } = await import(
        "../../../modules/product-crousel/ProductCrousel.component"
      ).finally(() => {
        this.clearPseudoImageCrousel();
      });
      const factory = this.cfr.resolveComponentFactory(ProductCrouselComponent);
      this.productCrouselInstance =
        this.productCrouselContainerRef.createComponent(
          factory,
          null,
          this.injector
        );
      this.productCrouselInstance.instance["options"] = this.iOptions;
      this.productCrouselInstance.instance["items"] = this.productAllImages;
      this.productCrouselInstance.instance["moveToSlide$"] = this.moveToSlide$;
      this.productCrouselInstance.instance["refreshSiemaItems$"] =
        this.refreshSiemaItems$;
      this.productCrouselInstance.instance["productName"] = this.productName;
      setTimeout(() => {
        (
          this.productCrouselInstance.instance[
            "moveToSlide$"
          ] as Subject<number>
        ).next(slideIndex);
      }, 100);
    }
  }

  clearPseudoImageCrousel() {
    this.isProductCrouselLoaded = false;
    this.productCrouselPseudoContainerRef.nativeElement.remove();
  }

  onRotatePrevious() {
    this.loadProductCrousel(1);
  }

  onRotateNext() {
    this.loadProductCrousel(1);
  }

  buyNow(p) {}
}
