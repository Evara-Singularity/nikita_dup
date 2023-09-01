import { DOCUMENT } from '@angular/common';
import { Component, Inject, Input, OnInit, Renderer2 } from '@angular/core';
import { Router } from '@angular/router';
import CONSTANTS from '@app/config/constants';
import { CommonService } from '@app/utils/services/common.service';
import { GlobalAnalyticsService } from '@app/utils/services/global-analytics.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'breadcrumb-nav',
  templateUrl: './breadcrumb-nav.component.html',
  styleUrls: ['./breadcrumb-nav.component.scss']
})
export class BreadcrumbNavComponent implements OnInit {
  @Input() breadcrumb: [] = null;
  @Input('analytics') analytics = null;
  readonly baseDomain = CONSTANTS.PROD;
  @Input() productStaticData = this._commonService.defaultLocaleValue;
  changeStaticSubscription: Subscription = null;

  constructor(
    private renderer2: Renderer2,
    @Inject(DOCUMENT) private document,
    private router: Router,
    public _commonService: CommonService,
    private globalAnalyticService: GlobalAnalyticsService,
  ) {
  }

  ngOnInit(): void {
    this.breadCrumpCategorySchema();
    this.getStaticSubjectData();
  }

  getStaticSubjectData(){
    this.changeStaticSubscription = this._commonService.changeStaticJson.subscribe(staticJsonData => {
      this.productStaticData = staticJsonData;
    });
  }

  ngAfterViewInit(): void {
  }


  breadCrumpCategorySchema() {
    if ( this._commonService.isServer && this.breadcrumb && this.breadcrumb.length > 0) {
      let itemsList = [{
        "@type": "ListItem",
        "position": 0,
        "item":
        {
          "@id": CONSTANTS.PROD,
          "name": (this._commonService.isHindiUrl)?'होम':'home'
        }
      }];
      this.breadcrumb.forEach((element, index) => {
        itemsList.push({
          "@type": "ListItem",
          "position": index + 1,
          "item":
          {
            "@id": CONSTANTS.PROD + (this._commonService.isHindiUrl ? '/hi/' : '/') + element['categoryLink'],
            "name": element['categoryName']
          }
        })
      });

      let s = this.renderer2.createElement('script');
      s.type = "application/ld+json";

      s.text = JSON.stringify({ "@context": CONSTANTS.SCHEMA, "@type": "BreadcrumbList", "itemListElement": itemsList });
      this.renderer2.appendChild(this.document.head, s);
    }
  }

  goToCategory(link) {
    this.globalAnalyticService.sendAdobeCall(this.analytics, "genericClick");
    this.router.navigateByUrl(link);
  }

  ngOnDestroy() {
    if(this.changeStaticSubscription) {
      this.changeStaticSubscription.unsubscribe();
    }
  }

}
