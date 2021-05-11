import { Component, Renderer2, Inject, PLATFORM_ID } from '@angular/core';
import { Router } from '@angular/router';
import { Title, Meta } from '@angular/platform-browser';
import { DOCUMENT, isPlatformServer } from "@angular/common";
import CONSTANTS from 'src/app/config/constants';

@Component({
  selector: 'career',
  templateUrl: 'career.html',
  styleUrls: ['career.scss']
})
export class CareerComponent {

  imagePath = CONSTANTS.IMAGE_BASE_URL;
  isServer: boolean;

  constructor(
    private title: Title,
    private meta: Meta,
    private _renderer2: Renderer2,
    @Inject(DOCUMENT) private _document,
    private _router: Router,
    @Inject(PLATFORM_ID) private platformId) {

    this.isServer = isPlatformServer(platformId);

    this.title.setTitle("Explore Career Opportunities at Moglix.com");
    this.meta.addTag({ "property": "og:title", "content": "Explore Career Opportunities at Moglix.com" });
    this.meta.addTag({ "property": "og:description", "content": "We would like you to come and work with us and share your unique experience, skills and passion. Write to us at talent[at]moglix.com." });
    this.meta.addTag({ "property": "og:url", "content": "https://www.moglix.com/career" });
    this.meta.addTag({ "name": "description", "content": "We would like you to come and work with us and share your unique experience, skills and passion. Write to us at talent[at]moglix.com." });

    if (this.isServer) {
      let links = this._renderer2.createElement('link');
      links.rel = "canonical";
      links.href = CONSTANTS.PROD + this._router.url;
      this._renderer2.appendChild(this._document.head, links);
    }

  }
}
