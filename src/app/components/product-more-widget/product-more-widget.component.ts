import { CommonModule } from '@angular/common';
import { Component, Input, EventEmitter, NgModule, OnInit, Output } from '@angular/core';
import { CommonService } from '@app/utils/services/common.service';
import { GlobalAnalyticsService } from '@app/utils/services/global-analytics.service';

@Component({
  selector: 'product-more-widget',
  templateUrl: './product-more-widget.component.html',
  styleUrls: ['./product-more-widget.component.scss']
})
export class ProductMoreWidgetComponent implements OnInit {
  @Input('baseDomain') baseDomain;
  @Input('taxons') taxons;
  @Input('orderTracking') orderTracking;
  @Input('productBrandDetails') productBrandDetails;
  @Input('productCategoryDetails') productCategoryDetails;
  @Input('productBrandCategoryUrl') productBrandCategoryUrl;

  constructor(
    public commonService: CommonService,
    private analytics: GlobalAnalyticsService,
  ) { }

  ngOnInit() {
  }

  sendWidgetTracking(widgetType) {
    const TAXONS = this.taxons;
    let page = {
      pageName: null,
      channel: "pdp",
      subSection: null,
      linkPageName: `moglix:${TAXONS[0]}:${TAXONS[1]}:${TAXONS[2]}:pdp`,
      linkName: `More from ${widgetType}`,
      loginStatus: this.commonService.loginStatusTracking,
    };
    const custData = this.commonService.custDataTracking;
    const order = this.orderTracking;
    this.analytics.sendAdobeCall({ page, custData, order }, "genericClick");
    this.commonService.setSectionClickInformation("pdp_widget", "listing");
  }
}

@NgModule({
  declarations: [
    ProductMoreWidgetComponent
  ],
  imports: [
    CommonModule,
  ],
  exports: [
    ProductMoreWidgetComponent
  ]
})
export class ProductMoreWidgetModule { }
