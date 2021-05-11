import { Component, Renderer2, Inject, PLATFORM_ID } from '@angular/core';
import { Router } from '@angular/router';
import { Title, Meta } from '@angular/platform-browser';
import { DOCUMENT, isPlatformServer } from "@angular/common";
import CONSTANTS from 'src/app/config/constants';


@Component({
  selector: 'originals',
  templateUrl: 'originals.html',
  styleUrls: ['originals.scss']
})
export class OriginalsComponent {

  imagePath = CONSTANTS.IMAGE_BASE_URL;
  isServer: boolean;

  constructor(
    private title: Title,
    private _renderer2: Renderer2,
    private _router: Router,
    @Inject(DOCUMENT) private _document,
    private meta: Meta,
    @Inject(PLATFORM_ID) private platformId) {

    this.isServer = isPlatformServer(platformId);

    this.title.setTitle("Moglix Originals - 100% Exclusive Brands and Products");
    this.meta.addTag({ "name": "description", "content": "Introducing Moglix originals, absolutely exclusive private label brands and products, you won't find anywhere else. Come explore today." });

    if (this.isServer) {
      let links = this._renderer2.createElement('link');
      links.rel = "canonical";
      links.href = CONSTANTS.PROD + this._router.url;
      this._renderer2.appendChild(this._document.head, links)
    }

  }

}
