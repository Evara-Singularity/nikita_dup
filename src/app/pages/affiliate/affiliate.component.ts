import { Component, Renderer2, Inject, PLATFORM_ID } from '@angular/core';
import { Router } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { DOCUMENT, isPlatformServer } from "@angular/common";
import CONSTANTS from '@app/config/constants';

@Component({
  selector: 'affiliate',
  templateUrl: 'affiliate.html',
  styleUrls: ['affiliate.scss']
})

export class AffiliateComponent {

  imagePath = CONSTANTS.IMAGE_BASE_URL;

  isServer: boolean;
  constructor(
    private title: Title,
    @Inject(PLATFORM_ID) platformId,
    private _renderer2: Renderer2,
    @Inject(DOCUMENT) private _document,
    public _router: Router) {

    this.isServer = isPlatformServer(platformId);

    this.title.setTitle("Affiliate-Moglix.com");
    if (this.isServer) {
      let links = this._renderer2.createElement('link');
      links.rel = "canonical";
      links.href = CONSTANTS.PROD + "/affiliate";
      this._renderer2.appendChild(this._document.head, links);
    }
    
  }
}
