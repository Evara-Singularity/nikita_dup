import {
  Component,
  ComponentFactoryResolver,
  ElementRef,
  Injector,
  Input,
  EventEmitter,
  ViewChild,
  ViewContainerRef,
  Output,
} from "@angular/core";
import { CommonService } from "@app/utils/services/common.service";
import { ProductService } from "@app/utils/services/product.service";
import { forkJoin, Subject } from "rxjs";
@Component({
  selector: "app-product-oos-similar-card",
  templateUrl: "./product-oos-similar-card.component.html",
  styleUrls: ["./product-oos-similar-card.component.scss"],
})
export class ProductOosSimilarCardComponent {
  breadcrumData: any;
  @Input("productMsn") productMsn;
  @Input("index") index: number;
  refreshSiemaItems$ = new Subject<{
    items: Array<{}>;
    type: string;
    currentSlide: number;
  }>();
  moveToSlide$ = new Subject<number>();
  carouselInitialized: boolean = false;
  isProductCrouselLoaded: boolean = false;

  // ondemand product crousel
  productCrouselInstance = null;
  @ViewChild("productCrousel", { read: ViewContainerRef })
  productCrouselContainerRef: ViewContainerRef;
  @ViewChild("productCrouselPseudo", { read: ElementRef })
  productCrouselPseudoContainerRef: ElementRef;

  @Output("firstImageClickedEvent") firstImageClickedEvent = new EventEmitter();
  @Output("removeWindowScrollListenerEvent") removeWindowScrollListenerEvent = new EventEmitter();
  @Output("showAllKeyFeatureClickEvent") showAllKeyFeatureClickEvent =
    new EventEmitter();

  iOptions: any = null;
  showProduct: boolean = false;

  constructor(
    public productService: ProductService,
    private cfr: ComponentFactoryResolver,
    private injector: Injector,
    public commonService: CommonService
  ) { }

  ngOnInit() {
    if (this.productMsn) {
      this.createSiemaOption(this.index);
      this.getProductData();
    }
  }

  navigateTo(link: string) {
    this.removeWindowScrollListenerEvent.emit(true);
    this.commonService.navigateTo(link, true);
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
        this.productService.processProductData(
          {
            productBO: rawData[0]["productBO"],
            refreshCrousel: true,
            subGroupMsnId: null,
          },
          this.index
        );
        this.showProduct = true;
      }
    });
  }

  createSiemaOption(index) {
    // if (!this.rawProductData) {
    //   return;
    // }
    this.iOptions = {
      selector: ".img-siema-" + index,
      perPage: 1,
      productNew: true,
      pager: true,
      imageAlt:
        this.productService.oosSimilarProductsData.similarData[this.index]
          .productName,
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
      this.productCrouselInstance.instance["clickedIndexOfOosProduct"] =
        this.index;
      this.productCrouselInstance.instance["items"] =
        this.productService.oosSimilarProductsData.similarData[
          this.index
        ].productAllImages;
      this.productCrouselInstance.instance["moveToSlide$"] = this.moveToSlide$;
      this.productCrouselInstance.instance["refreshSiemaItems$"] =
        this.refreshSiemaItems$;
      this.productCrouselInstance.instance["productName"] =
        this.productService.oosSimilarProductsData.similarData[
          this.index
        ].productName;
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

  firstImageClicked() {
    this.firstImageClickedEvent.emit(this.index);
  }

  buyNow(p) {
    alert("buyNow");
  }
}
