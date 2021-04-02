import { DOCUMENT, isPlatformBrowser, isPlatformServer } from '@angular/common';
import { Component, Inject, Input, OnInit, PLATFORM_ID, Renderer2 } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'breadcrumb-nav',
  templateUrl: './breadcrumb-nav.component.html',
  styleUrls: ['./breadcrumb-nav.component.scss']
})
export class BreadcrumbNavComponent implements OnInit {

  @Input() breadcrumb: [] = null;
  isServer: boolean;
  isBrowser: boolean;

  constructor(
    private renderer2: Renderer2,
    @Inject(DOCUMENT) private document,
    @Inject(PLATFORM_ID) platformId,
    private router: Router
  ) {
    this.isServer = isPlatformServer(platformId);
    this.isBrowser = isPlatformBrowser(platformId);
  }

  ngOnInit(): void {
    this.breadCrumpCategorySchema();
  }


  breadCrumpCategorySchema() {
    if (this.isServer && this.breadcrumb.length > 0) {
      let itemsList = [{
        "@type": "ListItem",
        "position": 0,
        "item":
        {
          "@id": "https://www.moglix.com",
          "name": "Home"
        }
      }];
      this.breadcrumb.forEach((element, index) => {
        itemsList.push({
          "@type": "ListItem",
          "position": index + 1,
          "item":
          {
            "@id": "https://www.moglix.com/" + element['categoryLink'],
            "name": element['categoryName']
          }
        })
      });

      let s = this.renderer2.createElement('script');
      s.type = "application/ld+json";

      s.text = JSON.stringify({ "@context": "https://schema.org", "@type": "BreadcrumbList", "itemListElement": itemsList });
      this.renderer2.appendChild(this.document.head, s);
    }
  }

  goToCategory(link) {
    this.router.navigateByUrl(link);
  }

}
