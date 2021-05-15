import { Component, Renderer2, Inject, PLATFORM_ID } from '@angular/core';
import { Router } from '@angular/router';
import { Title, Meta } from '@angular/platform-browser';
import { isPlatformServer, isPlatformBrowser, DOCUMENT } from '@angular/common';
import { FooterService } from '@app/utils/services/footer.service';
import CONSTANTS from '@app/config/constants';
declare let $: any;


@Component({
  selector: 'testimonials',
  templateUrl: 'testimonials.html',
  styleUrls: ['testimonials.scss']
})

export class TestimonialsComponent {
  isServer: boolean;
  isBrowser: boolean;

  constructor(
    @Inject(PLATFORM_ID) platformId,
    private title: Title,
    private meta: Meta,
    private _renderer2: Renderer2,
    @Inject(DOCUMENT) private _document,
    public _router: Router,
    public footerService: FooterService) {

    this.isServer = isPlatformServer(platformId);
    this.isBrowser = isPlatformBrowser(platformId);
  }

  ngOnInit() {

    this.title.setTitle("Customer Reviews - Moglix.com");
    this.meta.addTag({ "property": "og:title", "content": "Customer Reviews - Moglix.com" });
    this.meta.addTag({ "property": "og:description", "content": "Read what our customers think about commitment and services at Moglix.com. We would love to hear your feedback." });
    this.meta.addTag({ "property": "og:url", "content": "https://www.moglix.com/testimonials" });
    this.meta.addTag({ "name": "description", "content": "Read what our customers think about commitment and services at Moglix.com. We would love to hear your feedback." });

    if (this.isServer) {
      let links = this._renderer2.createElement('link');
      links.rel = "canonical";
      links.href = CONSTANTS.PROD + this._router.url;
      this._renderer2.appendChild(this._document.head, links);
    }

    if (this.isBrowser) {
      document.querySelector('#testimonial_page_button_more').addEventListener('click', function () {
        (<HTMLElement>document.querySelector('.testimonial_item:nth-child(n+7)')).style.display = 'block';
        this.style.display = "none";
        (<HTMLElement>document.querySelector('#testimonial_page_button_less')).style.display = 'inline-block';
      });
      document.querySelector('#testimonial_page_button_less').addEventListener('click', function () {
        (<HTMLElement>document.querySelector('.testimonial_item:nth-child(n+7)')).style.display = 'none';
        (<HTMLElement>document.querySelector('#testimonial_page_button_more')).style.display = "block";//.show();
        this.style.display = "none";

      });
    }

    if (this.isBrowser) {
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