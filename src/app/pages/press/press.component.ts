import { Component, Renderer2, Inject, PLATFORM_ID } from '@angular/core';
import { Router } from '@angular/router';
import { isPlatformServer, isPlatformBrowser, DOCUMENT } from '@angular/common';
import { Title, Meta } from '@angular/platform-browser';
import { FooterService } from '../../utils/services/footer.service';
import CONSTANTS from '../../config/constants';

declare let $: any;

@Component({
  selector: 'press',
  templateUrl: 'press.html',
  styleUrls: ['press.scss']
})

export class PressComponent {

  API = CONSTANTS;
  isBrowser: boolean;
  isServer: boolean;

  constructor(
    private title: Title,
    private meta: Meta,
    private _renderer2: Renderer2,
    private _router: Router,
    @Inject(DOCUMENT) private _document,
    @Inject(PLATFORM_ID) platformId,
    public footerService: FooterService) {

    this.isServer = isPlatformServer(platformId);
    this.isBrowser = isPlatformBrowser(platformId);

    this.title.setTitle("Press Release - Moglix.com");
    this.meta.addTag({ "property": "og:title", "content": "Press Release - Moglix.com" });
    this.meta.addTag({ "property": "og:description", "content": "Read about the latest news and development at Moglix in our press release section." });
    this.meta.addTag({ "property": "og:url", "content": "https://www.moglix.com/press" });
    this.meta.addTag({ "name": "description", "content": "Read about the latest news and development at Moglix in our press release section." })
    
    if (this.isServer) {
      let links = this._renderer2.createElement('link');
      links.rel = "canonical";
      links.href = CONSTANTS.PROD + this._router.url;
      this._renderer2.appendChild(this._document.head, links);
    }

  }


  ngOnInit(): void {

    if (this.isBrowser) {
      document.querySelector('#press_page_button_more').addEventListener('click', function () {
        (<HTMLElement>document.querySelector('.press_item:nth-child(n+7)')).style.display = "block";
        // $('.press_item:nth-child(n+7)').css('display', 'block').animate("swing","slow");
        this.style.display = "none";//hide();
        (<HTMLElement>document.querySelector('#press_page_button_less')).style.display = 'inline-block';
      });
      document.querySelector('#press_page_button_less').addEventListener('click', function () {
        (<HTMLElement>document.querySelector('.press_item:nth-child(n+7)')).style.display = "none";
        (<HTMLElement>document.querySelector('#press_page_button_more')).style.display = "block";
        this.style.display = "none";//hide();
      });

      if (window.outerWidth >= 768) {
        setTimeout(() => {
          this.footerService.setFooterObj({ footerData: true });
          this.footerService.footerChangeSubject.next(this.footerService.getFooterObj());
        }, 1000)

      }
      else {
        this.footerService.setMobileFoooters();
      }
    }
    if (this.isServer) {
      this.footerService.setFooterObj({ footerData: true });
      this.footerService.footerChangeSubject.next(this.footerService.getFooterObj());
    }

  }


}
