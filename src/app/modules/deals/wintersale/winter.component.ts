import { Component, ViewEncapsulation, Inject, PLATFORM_ID, Renderer2, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
import { isPlatformServer, isPlatformBrowser } from '@angular/common';
import { Title, Meta, makeStateKey, TransferState } from '@angular/platform-browser';
import { CommonDealsService } from '../common-deals.service';
const WD = makeStateKey<any>('winterdata');
declare let $: any;
@Component({
  selector: 'winter',
  templateUrl: 'winter.html',
  styleUrls: ['winter.scss'],
  encapsulation: ViewEncapsulation.None
})

export class WinterComponent {
  isServer: boolean;
  isBrowser: boolean;
  WinterData: any;
  constructor(private elementRef: ElementRef, private _renderer2: Renderer2, private _tState: TransferState, @Inject(PLATFORM_ID) platformId: Object, private title: Title, public router: Router, private dealsService: CommonDealsService, private meta: Meta) {
    this.isServer = isPlatformServer(platformId);
    this.isBrowser = isPlatformBrowser(platformId);
    this.getWinterData();

    this.title.setTitle("Winter Sale - Winter Exclusive Offers and Deals - Moglix.com");
    this.meta.addTag({ "name": "description", "content": "Get the best delas this winter season on Moglix. Annuncinng price drop alert and heavy discounts on range of products." });
  }

  ngOnInit() {
    setTimeout(function () {
      (<HTMLElement>document.querySelector('.tab_num > div')).style.display = "none";//.hide();
      (<HTMLElement>document.querySelector('.tab_num > div:first-child')).style.display = "block";//.show();
      document.querySelector('li:first-child').classList.add('active');
      document.querySelector('li').addEventListener('click', (e) => {
        const className = (<HTMLElement>e.currentTarget).className;
        const class_num = className.split(" ");
        if (class_num.length == 1) {
          (<HTMLElement>document.querySelector('.tab_num .wp-100')).style.display = "none";//.hide();
          (<HTMLElement>document.querySelector('.tab_num div.' + className)).style.display = "block";//.show();
          document.querySelector('li').classList.remove('active');
          document.querySelector('li.' + className).classList.add('active');
        }
      });
    }, 3000);
  }

  getWinterData() {
    if (this._tState.hasKey(WD)) {
      this.WinterData = this._tState.get(WD, { data: "" }).data;
      setTimeout(() => {
        // wait for DOM rendering
        this.reinsertLinks();
      }, 0);
    }
    else {
      this.dealsService.getWinterData({ headerData: { 'Content-Type': 'text/html' } }).subscribe(
        data => {
          this.WinterData = data;
          if (this.isServer) {
            this._tState.set(WD, { data: "'" + this.WinterData + "'" });
          }
          setTimeout(() => {
            this.reinsertLinks();         // wait for DOM rendering
          }, 0);
        }
      )
    }
  }

  reinsertLinks() {
    const links = <HTMLAnchorElement[]>this.elementRef.nativeElement.getElementsByTagName('a');
    if (links) {
      const linksInitialLength = links.length;
      for (let i = 0; i < linksInitialLength; i++) {
        const link = links[i];

        if (link.host === window.location.host) {
          this._renderer2.listen(link, 'click', event => {
            event.preventDefault();
            this.router.navigate([
              link.href
                .replace(link.host, '')
                .replace(link.protocol, '')
                .replace('//', '')
            ]);
          });
        }
      }
    }
  }
  ngAfterViewInit() {
    if (this.isBrowser) {
      this._tState.remove(WD);
    }
  }
}