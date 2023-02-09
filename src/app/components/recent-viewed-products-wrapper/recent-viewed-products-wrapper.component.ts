import { CommonModule } from "@angular/common";
import {
  Component,
  ComponentFactoryResolver,
  EventEmitter,
  Injector,
  NgModule,
  OnInit,
  ViewChild,
  ViewContainerRef,
} from "@angular/core";
import { ObserveVisibilityDirectiveModule } from "@app/utils/directives/observe-visibility.directive";
import { MathCeilPipeModule } from "@app/utils/pipes/math-ceil";
import { ReplacePipeModule } from "@app/utils/pipes/remove-html-from-string.pipe.";
import { CommonService } from "@app/utils/services/common.service";
import { ProductSkeletonsModule } from "../product-skeletons/product-skeletons.component";

@Component({
  selector: "recent-viewed-products-wrapper",
  templateUrl: "./recent-viewed-products-wrapper.component.html",
  styleUrls: ["./recent-viewed-products-wrapper.component.scss"],
})
export class RecentViewedProductsWrapperComponent implements OnInit {
  hasRecentlyView: boolean = true;
  // ondemand loaded components for recents products
  recentProductsInstance = null;
  @ViewChild("recentProducts", { read: ViewContainerRef })
  recentProductsContainerRef: ViewContainerRef;

  constructor(
    private commonService: CommonService,
    private cfr: ComponentFactoryResolver,
    private injector: Injector
  ) {}

  ngOnInit(): void {}

  async onVisibleRecentProduct(htmlElement) {
    if (!this.recentProductsInstance) {
      const { RecentViewedProductsComponent } = await import(
        "./../../components/recent-viewed-products/recent-viewed-products.component"
      );
      const factory = this.cfr.resolveComponentFactory(
        RecentViewedProductsComponent
      );
      this.recentProductsInstance =
        this.recentProductsContainerRef.createComponent(
          factory,
          null,
          this.injector
        );
      this.recentProductsInstance.instance["outOfStock"] = true;
      const custData = this.commonService.custDataTracking;
      // const orderData = this.orderTracking;
      //const TAXONS = this.taxons;
      const page = {
        pageName: null,
        channel: "pdp",
        subSection: "Recently Viewed",
        //linkPageName: `moglix:${TAXONS[0]}:${TAXONS[1]}:${TAXONS[2]}:pdp`,
        linkName: null,
        loginStatus: this.commonService.loginStatusTracking,
      };
      this.recentProductsInstance.instance["analytics"] = {
        page: page,
        custData: custData,
        // order: orderData,
      };
      (
        this.recentProductsInstance.instance[
          "noRecentlyViewed$"
        ] as EventEmitter<any>
      ).subscribe((flag) => {
        this.hasRecentlyView = false;
      });
    }
  }

  ngOnDestroy() {
    if (this.recentProductsInstance && this.recentProductsContainerRef) {
      this.recentProductsInstance = null;
      this.recentProductsContainerRef.remove();
    }
  }
}

@NgModule({
  declarations: [RecentViewedProductsWrapperComponent],
  imports: [
    CommonModule,
    ProductSkeletonsModule,
    ReplacePipeModule,
    MathCeilPipeModule,
    ObserveVisibilityDirectiveModule,
  ],
  exports: [RecentViewedProductsWrapperComponent],
})
export default class RecentViewedProductsWrapperModule {}
