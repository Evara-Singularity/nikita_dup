import { Component, Inject, Renderer2 } from '@angular/core';
import { DOCUMENT } from "@angular/common";
import { Router } from '@angular/router';
import CONSTANTS from 'src/app/config/constants';

@Component({
  selector: 'business-homepage',
  templateUrl: './businessHomepage.html',
  styleUrls: ['./businessHomepage.scss'],
})

export class BusinessHomepageComponent {

  imagePath = CONSTANTS.IMAGE_BASE_URL;

  constructor(@Inject(DOCUMENT) private _document, private _renderer2: Renderer2, private _router: Router) {
  }

  ngOnInit() {
    /**
     * Set canonical starts
     */
    let links = this._renderer2.createElement('link');
    links.rel = "canonical";
    let href = CONSTANTS.PROD + this._router.url.split("?")[0].split("#")[0].toLowerCase();
    links.href = href;
    this._renderer2.appendChild(this._document.head, links);
  }
}