import { Component, Renderer2, Inject, PLATFORM_ID, AfterViewInit } from '@angular/core';
import { Title, Meta } from '@angular/platform-browser';
import { DOCUMENT, isPlatformServer } from "@angular/common";
import CONSTANTS from '@app/config/constants';
import { CommonService } from '@app/utils/services/common.service';

@Component({
  selector: 'contact',
  templateUrl: 'contact.html',
  styleUrls: ['contact.scss']
})

export class ContactComponent implements AfterViewInit{

  imagePath = CONSTANTS.IMAGE_BASE_URL;
  imgAssetPath = CONSTANTS.IMAGE_ASSET_URL;
  CUSTOMER_CARE_TIME=CONSTANTS.CUSTOMER_CARE_TIME.call_timing_text;
  whatsappUrl=CONSTANTS.whatsAppBannerUrl

  contactUsSchema;
  isServer: boolean;

  constructor( 
    private _renderer2: Renderer2,
    @Inject(DOCUMENT) private _document,
    private title: Title,
    private meta: Meta,
    private commonService: CommonService,
    @Inject(PLATFORM_ID) private platformId) {

    this.isServer = isPlatformServer(this.platformId)

    this.title.setTitle("Contact Us - Moglix - WhatsApp at +91 9999049135");
    this.meta.addTag({ "property": "og:title", "content": "Contact Us - Moglix - WhatsApp at +91 9999049135" });
    this.meta.addTag({ "property": "og:description", "content": "Write to us at care[at]moglix.com or contact customer care through WhatsApp at +91 9999049135. We are happy to help you round the clock to the best of our ability." });
    this.meta.addTag({ "property": "og:url", "content": "https://www.moglix.com/contact" });
    this.meta.addTag({ "name": "description", "content": "Write to us at care[at]moglix.com or contact customer care through WhatsApp at +91 9999049135. We are happy to help you round the clock to the best of our ability." });

    if (this.isServer) {
      let links = this._renderer2.createElement('link');
      links.rel = "canonical";
      links.href = CONSTANTS.PROD + "/contact";
      this._renderer2.appendChild(this._document.head, links);
      this.orgSchema();
    }

  }

  orgSchema() {
    this.contactUsSchema = this._renderer2.createElement('script');
    this.contactUsSchema.type = "application/ld+json";
    this.contactUsSchema.text = JSON.stringify(
      {

        "@context": CONSTANTS.SCHEMA, "@type": "Organization",
        "name": "Moglix",
        "url": CONSTANTS.PROD,
        "logo": `${this.imagePath}assets/img/moglix_logo_red@3x.png`,
        "contactPoint":
          [{
            "@type": "ContactPoint",
            "telephone": "+91 8448 233 444",
            "contactType": "customer service", "areaServed": "IN"
          }],
        "address":
        {
          "@type": "PostalAddress",
          "addressLocality": "Noida, India",
          "postalCode": "201301",
          "streetAddress": "D-188, Sector-10"
        },
        "email": "care@moglix.com",
        "sameAs": [
          "https://www.facebook.com/moglix.global/", "https://www.linkedin.com/company/moglix", "https://twitter.com/moglix"]
      }

    )
    this._renderer2.appendChild(this._document.head, this.contactUsSchema);
    }

    ngAfterViewInit() {
      this.commonService.loadFreshChat();
    }
}