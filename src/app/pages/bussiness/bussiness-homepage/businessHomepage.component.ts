/**
 * Created by Abhishek
 */

import { Component, Inject, Renderer2 } from '@angular/core';
import { fade } from '../../animation/animations'
import { DOCUMENT } from "@angular/common";
import { API } from '../../../config/apiConfig';
import { Router} from '@angular/router';

@Component({
  selector: 'business-homepage',
  templateUrl: './businessHomepage.html',
  styleUrls: ['./businessHomepage.scss'],
  animations: [
    fade
  ]
})

export class BusinessHomepageComponent{

  imagePath = API.BASE_URLS.IMAGE_BASE_URL;

  constructor(@Inject(DOCUMENT) private _document, private _renderer2: Renderer2, private _router: Router){
  }

  ngOnInit() {
    /**
     * Set canonical starts
     */
    let links = this._renderer2.createElement('link');
    links.rel = "canonical";
    let href = API.BASE_URLS.PROD + this._router.url.split("?")[0].split("#")[0].toLowerCase();
    links.href = href;
    this._renderer2.appendChild(this._document.head, links);
  }
}
