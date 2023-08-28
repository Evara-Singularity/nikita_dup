import {
  Component,
  ElementRef,
  Input,
  PLATFORM_ID,
  Inject,
  Output,
  EventEmitter,
  ChangeDetectorRef,
  ComponentFactoryResolver,
  ViewChild,
  Injector,
  ViewRef,
  ViewContainerRef,
  NgModule,
  OnInit,
  ChangeDetectionStrategy,
} from "@angular/core";
import {
  isPlatformServer,
  isPlatformBrowser,
  CommonModule,
} from "@angular/common";
import { NgxSiemaModule, NgxSiemaOptions, NgxSiemaService } from "ngx-siema";
import { Subject } from "rxjs";

import { takeUntil } from "rxjs/operators";
import { SiemaCrouselService } from "../../utils/services/siema-crousel.service";
import CONSTANTS from "../../config/constants";

import { YTThumnailPipeModule } from "@app/utils/pipes/ytthumbnail.pipe";
import { ProductCrouselSlideComponent } from "./ProductCrouselSlide/ProductCrouselSlide.component";
import { MathCeilPipeModule } from "@app/utils/pipes/math-ceil";
import { MathFloorPipeModule } from "@app/utils/pipes/math-floor";
import { CommonService } from "@app/utils/services/common.service";
import { GlobalAnalyticsService } from '../../utils/services/global-analytics.service';
import { Router } from "@angular/router";

@Component({
  selector: "ProductCrousel",
  templateUrl: "./ProductCrousel.component.html",
  styleUrls: ["./ProductCrousel.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProductCrouselComponent implements OnInit {
  image_Path = CONSTANTS.IMAGE_BASE_URL;

  @Input() productOutOfStock: boolean;
  @Input() clickedIndexOfOosProduct: number;
  @Input() options: any;
  @Input() items: any[];
  @Input() imagePath: any;
  @Input() defaultImage: any;
  @Output() ImageClick: EventEmitter<any> = new EventEmitter<any>();
  @Output() ImageMouseEnter: EventEmitter<any> = new EventEmitter<any>();
  @Input() refreshSiemaItems$: Subject<{ items: Array<{}>; type: string }>;
  @Input() moveToSlide$: Subject<number>;
  @Input() appendSiemaItems$: Subject<Array<{}>>;
  @Input() productName: any;
  @ViewChild(ProductCrouselSlideComponent) ssc: ProductCrouselSlideComponent;
  @ViewChild("kelsiema", { read: ElementRef }) kelsiema: ElementRef;
  @ViewChild("kvcsiema", { read: ViewContainerRef }) kvcsiema: ViewContainerRef;
  @Input('productBo') productBo: any;

  isServer: boolean;
  isBrowser: boolean;
  isMobile: boolean;
  currentIndex: any = false;
  ngxSiemaOptions: NgxSiemaOptions;
  bannerInterval;
  interval = 5000;
  scrollTarget;
  perPageDefault = 7;
  draggableDefault = false;
  initialized: boolean = false;
  imageChange$ = new Subject();
  Math;
  splitUrlByComma;
  splitUrlByCommaAlt;
  pz_instance: any = [];
  private cDistryoyed = new Subject();
  showPocMsn: boolean = false;
  @Input() pageLinkName: string = '';
  constructor(
    private _router: Router,
    private injector: Injector,
    private _commonService: CommonService,
    private _cfr: ComponentFactoryResolver,
    private _cdr: ChangeDetectorRef,
    private ngxSiemaService: NgxSiemaService,
    private _siemaCrouselService: SiemaCrouselService,
    private _analyticsService:GlobalAnalyticsService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isServer = isPlatformServer(platformId);
    this.isBrowser = isPlatformBrowser(platformId);
  }

  ngOnInit() {
    if (this.isBrowser) {
      if (this.refreshSiemaItems$) {
        this.refreshSiemaItems$
          .pipe(takeUntil(this.cDistryoyed))
          .subscribe((data) => {
            //  ;
            this.refreshSiema(data["items"]);
            this._cdr.markForCheck(); // marks path
          });
      }

      if (this.moveToSlide$) {
        this.moveToSlide$.subscribe((slideNumber: number) => {
          // console.log('called');
          this._commonService.enableNudge = false;
          this.ngxSiemaService.goTo(slideNumber, this.options.selector);
        });
      }

      if (this.appendSiemaItems$) {
        this.appendSiemaItems$
          .pipe(takeUntil(this.cDistryoyed))
          .subscribe((items: Array<{}>) => {
            this.udpateSiema(items);
            this._cdr.markForCheck(); // marks path
          });
      }

      if (window.innerWidth < 768) {
        this.isMobile = true;
        this.perPageDefault = 2;
        this.draggableDefault = true;
      }
      this.Math = (<any>window).Math;
    }

    if (this.isMobile) {
      this.perPageDefault = 2;
    }

    let that = this;
    if (this.options.interval) {
      this.interval = this.options.interval;
    }
    let loop = false;
    if (
      this.items &&
      this.items.length &&
      this.items.length > this.options.perPage
    ) {
      loop = true;
    }
    if (this.options.loop !== "undefined") {
      loop = this.options.loop;
    }
    if (this.isBrowser) {
      if (document.querySelector(this.options.selector)) {
        this.scrollTarget = document.querySelector(
          this.options.selector
        ).firstElementChild;
      }
    }

    this.ngxSiemaOptions = {
      selector: that.options.selector || ".siema",
      duration: that.options.duration || 500,
      perPage: that.options.perPage || that.perPageDefault,
      startIndex: that.options.startIndex || 0,
      draggable: that.options.draggable || that.draggableDefault,
      threshold: that.options.threshold || 20,
      loop: loop,
      onInit: () => {
        window.scrollTo(window.scrollX, window.scrollY + 1);
        window.scrollTo(window.scrollX, window.scrollY - 1);
        this.scrollInitialize();
        that.initialize();
        if (this.options.onInit && typeof this.options.onInit == "function") {
          this.options.onInit.call();
        }
      },
      onChange: () => {
        this.scrollInitialize();
        this.lazyLoadBanner();

        document.querySelectorAll("iframe").forEach((iframe) => {
          iframe.contentWindow.postMessage(
            '{"event":"command","func":"stopVideo","args":""}',
            "*"
          );
        });

        if (
          that.options.onChange &&
          typeof that.options.onChange == "function"
        ) {
          that.options.onChange.call();
        }
      },
    };

    this.initialized = true;

    setTimeout(() => {
      this.scrollInitialize();
    }, 1000);
    if (this.productBo && this.productBo.defaultPartNumber.toLowerCase() === CONSTANTS.POC_MSN || (this.productBo.product3dImages && this.productBo.product3dImages.length)) {
      this.showPocMsn = true;
    }
    this._commonService.isProductCrouselLoaded.next(true)
  }
  ngOnDestroy() {
    this.cDistryoyed.next();
    this.cDistryoyed.unsubscribe();
    this._commonService.isProductCrouselLoaded.next(false);
  }

  udpateSiema(items) {
    const fakeItems = items.map((item) => "");
    this.items = [...this.items, ...fakeItems];
    for (let i = 0; i < items.length; i++) {
      const componentFactory = this._cfr.resolveComponentFactory(
        ProductCrouselSlideComponent
      );
      const componentRef = componentFactory.create(this.injector);
      componentRef.instance["options"] = this.options;
      componentRef.instance["item"] = items[i];
      componentRef.instance["ngxSiemaOptions"] = this.ngxSiemaOptions;
      componentRef.instance["defaultImage"] = this.defaultImage;
      componentRef.instance["imagePath"] = this.imagePath;
      componentRef.instance["itemIndex"] = i + 1;
      componentRef.instance["imageChange$"] = this.imageChange$;
      const view: ViewRef = componentRef.hostView;
      this.kvcsiema.insert(view, i);
    }
    const knl = this.kelsiema.nativeElement.children;
    let i = 0;
    let len = knl.length;
    for (let i = 0; i < len; i++) {
      if (i % 1) this.append(this.options.selector, knl[0]);
      else this.prepend(this.options.selector, knl[0]);
    }
    this.startBannerInterval();
  }

  refreshSiema(items) {
    let oldItemsLength = this.items ? this.items.length : 0;

    this.items = items;
    this.kvcsiema.clear();
    for (let i = 0; i < items.length; i++) {
      const componentFactory = this._cfr.resolveComponentFactory(
        ProductCrouselSlideComponent
      );
      const componentRef = componentFactory.create(this.injector);
      componentRef.instance["options"] = this.options;
      componentRef.instance["item"] = items[i];
      componentRef.instance["ngxSiemaOptions"] = this.ngxSiemaOptions;
      componentRef.instance["defaultImage"] = this.defaultImage;
      componentRef.instance["imagePath"] = this.imagePath;
      componentRef.instance["itemIndex"] = i;
      componentRef.instance["imageChange$"] = this.imageChange$;
      componentRef.instance["contentType"] = this.items[i]["contentType"];
      const view: ViewRef = componentRef.hostView;
      this.kvcsiema.insert(view, i);
    }

    const knl = this.kelsiema.nativeElement.children;
    let len = knl.length;
    for (let i = 0; i < len; i++) {
      this.insert(i, knl[0], this.options.selector);
    }

    this.ngxSiemaService.goTo(0, this.options.selector);

    // Remove all elements from using current items in siema
    while (oldItemsLength > 0) {
      this.remove(
        this.options.selector,
        this.items.length + oldItemsLength - 1
      );
      oldItemsLength--;
    }
  }

  insert(index, item, selector?) {
    this.ngxSiemaService.insert(item, index, selector);
  }

  remove(selector, index) {
    return this.ngxSiemaService.remove(index, selector);
  }

  append(selector, element) {
    this.ngxSiemaService.append(element, selector);
  }

  prepend(selector, element) {
    this.ngxSiemaService.prepend(element, selector);
  }

  goTo(index, selector) {
    this.ngxSiemaService.goTo(index, selector);
  }

  scrollInitialize() {
    this.ngxSiemaService
      .currentSlide(this.ngxSiemaOptions.selector)
      .subscribe((data) => {
        if (data && typeof data.currentSlide !== "undefined") {
          this.currentIndex = data.currentSlide;
          this.lazyLoadImage(this.currentIndex);
          this._cdr.detectChanges();
        }
      });
    this.imageChange$.next();
  }

  lazyLoadBanner() {
    var imgDefer = document
      .getElementById("lazyLoad")
      .getElementsByTagName("img");

    if (location.pathname == "/") {
      for (var ind = 0; ind < imgDefer.length; ind++) {
        if (imgDefer[ind] && imgDefer[ind].getAttribute("id")) {
          imgDefer[ind].setAttribute("src", imgDefer[ind].getAttribute("id"));
        }
      }
    }
  }

  lazyLoadImage(i) {
    var imgDefer = document
      .getElementById("lazyLoad")
      .getElementsByTagName("img");
    if (imgDefer[i] && imgDefer[i].getAttribute("id")) {
      imgDefer[i].setAttribute("src", imgDefer[i].getAttribute("id"));
    }
  }

  initialize() {
    if (this.options.autoPlay) {
      this.startBannerInterval();
    }
  }

  open36popup(){
    this._commonService.open360popup$.next(true);
    this.setAdobeDataTracking();
  }
  setAdobeDataTracking(){
      this._analyticsService.sendAdobeCall(
        {page:{ channel: 'pdp', 
          pageName: this.pageLinkName,
          linkName:  this.showPocMsn ? '3D Image click' : '360 image click'
        }}, 
        "genericClick")
  }

  startBannerInterval() {
    if (this.bannerInterval) {
      clearInterval(this.bannerInterval);
    }
    this.bannerInterval = setInterval(() => {
      this.ngxSiemaService.next(1, this.options.selector);
    }, this.interval);
  }
}

@NgModule({
  declarations: [ProductCrouselComponent, ProductCrouselSlideComponent],
  imports: [
    CommonModule,
    YTThumnailPipeModule,
    MathCeilPipeModule,
    MathFloorPipeModule,
    NgxSiemaModule.forRoot(),
  ],
  providers: [NgxSiemaService],
})
export class AlertBoxToastModule { }
