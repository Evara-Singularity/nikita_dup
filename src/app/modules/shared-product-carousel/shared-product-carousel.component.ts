import { CommonService } from '@app/utils/services/common.service';
import { ProductService } from '@app/utils/services/product.service';
import { Component, ComponentFactoryResolver, ElementRef, EventEmitter, Injector, Input, OnInit, Output, ViewChild, ViewContainerRef, AfterViewInit, HostListener } from '@angular/core';
import { Subject } from 'rxjs';

@Component({
  selector: 'shared-product-carousel',
  templateUrl: './shared-product-carousel.component.html',
  styleUrls: ['./shared-product-carousel.component.scss']
})
export class SharedProductCarouselComponent implements OnInit, AfterViewInit
{
  @Input('productAllImages') productAllImages;
  @Input('carouselInitialized') carouselInitialized = false;
  @Input('isPurcahseListProduct') isPurcahseListProduct;
  @Input('productOutOfStock') productOutOfStock;
  @Input('imagePathAsset') imagePathAsset;
  @Input('isProductCrouselLoaded') isProductCrouselLoaded = false;
  @Input('iOptions') iOptions;
  @Input('productTags') productTags;
  @Input('productName') productName;
  @Input('rawProductData') rawProductData;
  @Input('moveToSlide$') moveToSlide$: Subject<number>;
  @Input('refreshSiemaItems$') refreshSiemaItems$:  Subject<{ items: Array<{}>; type: string; currentSlide: number; } >;
  @Output() loadProductShare$: EventEmitter<any> = new EventEmitter<any>();
  @Output() addToPurchaseList$: EventEmitter<any> = new EventEmitter<any>();
  @Output() scrollToId$: EventEmitter<any> = new EventEmitter<any>();
  @Output() openPopUpcrousel$: EventEmitter<any> = new EventEmitter<any>();
  @Output() loadProductCrousel$: EventEmitter<any> = new EventEmitter<any>();
  @Output() sendProductImageClickTracking$: EventEmitter<any> = new EventEmitter<any>();
  productCrouselInstance = null;
  @ViewChild("productCrousel", { read: ViewContainerRef })
  productCrouselContainerRef: ViewContainerRef;
  @ViewChild("productCrouselPseudo", { read: ElementRef })
  productCrouselPseudoContainerRef: ElementRef;

  constructor(private cfr: ComponentFactoryResolver, private injector: Injector, public productService: ProductService, private commonService: CommonService) { }

  ngOnInit(): void
  {

  }

  ngAfterViewInit(): void
  {
    if (this.commonService.isBrowser)
    {
      this.loadProductCrousel(0);
    }
  }

  async loadProductCrousel(slideIndex)
  {
    if (!this.productCrouselInstance) {
      this.isProductCrouselLoaded = true;
      const { ProductCrouselComponent } = await import(
        "../../modules/product-crousel/ProductCrousel.component"
      ).finally(() =>
      {
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
      this.productCrouselInstance.instance["productBo"] = this.rawProductData;
      this.productCrouselInstance.instance["moveToSlide$"] = this.moveToSlide$;
      this.productCrouselInstance.instance["refreshSiemaItems$"] = this.refreshSiemaItems$;
      this.productCrouselInstance.instance["productName"] = this.productName;
      this.productCrouselInstance.instance["productOutOfStock"] = this.productOutOfStock;
      setTimeout(() =>
      {
        (this.productCrouselInstance.instance["moveToSlide$"] as Subject<number>).next(slideIndex);
      }, 100);
    } else {
      this.productCrouselInstance.instance["productOutOfStock"] = this.productOutOfStock;
    }
  }

  clearPseudoImageCrousel()
  {
    this.isProductCrouselLoaded = false;
    this.productCrouselPseudoContainerRef.nativeElement.remove();
  }

  onRotatePrevious()
  {
    this.loadProductCrousel(this.productAllImages.length - 1);
  }

  onRotateNext()
  {
    this.loadProductCrousel(1);
  }

  loadProductShare()
  {
    this.loadProductShare$.emit();
  }

  addToPurchaseList()
  {
    this.addToPurchaseList$.emit();
  }

  scrollToId(type: string)
  {
    this.scrollToId$.emit(type);
  }

  sendProductImageClickTracking()
  {
    this.sendProductImageClickTracking$.emit();
  }
}
