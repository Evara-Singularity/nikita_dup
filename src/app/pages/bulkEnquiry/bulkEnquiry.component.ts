import { Component, ViewEncapsulation, Inject, Renderer2 } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { Title, Meta } from '@angular/platform-browser';
import { Router } from '@angular/router';
import CONSTANTS from '@app/config/constants';
import { FooterService } from '@app/utils/services/footer.service';
import { CommonService } from '@app/utils/services/common.service';

@Component({
  selector: 'bulk-enquiry',
  templateUrl: './bulkEnquiry.html',
  styleUrls: ['./bulkEnquiry.scss'],
  
})
export class BulkEnquiryComponent {

  isServer: boolean;
  isBrowser: boolean;
  imagePath = CONSTANTS.IMAGE_BASE_URL;
  openSiema = false;
  activehead: boolean = false;
  options = {
    selector: '.review-siema',
    startIndex: 0,
    perPage: 3,
    loop: true,
    brandCarousel: true,
    navHide: false
  };
  optionsCustomer = {
    selector: '.testimonial-siema',
    startIndex: 0,
    perPage: 1,
    testimonial: true,
    goTo: true
  };
  brandCarousel = [
    {
      src: CONSTANTS.IMAGE_BASE_URL + 'b/I/P/B/d/Canon_logo.png',
      url: '#'
    },
    {
      src: CONSTANTS.IMAGE_BASE_URL + 'b/I/P/B/d/allenlogo.png',
      url: '#'
    },
    {
      src: CONSTANTS.IMAGE_BASE_URL + 'b/I/P/B/d/Bosch_logo.png',
      url: '#'
    },
    {
      src: CONSTANTS.IMAGE_BASE_URL + 'b/I/P/B/d/havells.png',
      url: '#'
    },
    {
      src: CONSTANTS.IMAGE_BASE_URL + 'b/I/P/B/d/kirloskar-logo.png',
      url: '#'
    },
    {
      src: CONSTANTS.IMAGE_BASE_URL + 'b/I/P/B/d/LuminousLogo.png',
      url: '#'
    }

  ];
  public testimonial = [
    {
      src: `${this.imagePath}mob/assets/img/rivigoLogo.png`,
      review: 'Our association with Moglix has been worthwhile since day one. Moglix has done a tremendous job in procuring quality laden, hard to find equipment for us. They offered us a complete package at a reasonable budget and continued to fine tune it as per our directions. Kudos!',
      name: 'Mr Sachin Singh',
      company: 'Rivigo'
    },
    {
      src: `${this.imagePath}mob/assets/img/WWF-India.png`,
      review: 'Procuring safety products have never been simpler..we are very impressed with the quality of range and the treatment we get at Moglix... We are very much satisfied and now look forward to explore other supplies as well, else than Safety.',
      name: 'Ms Renu Atwal',
      company: 'WWF-India'
    }
  ];

  public image: File;
  public buyerList: Array<any> = [{ "buyerId": 1, "buyerType": "Manufacturer", "description": null }, { "buyerId": 2, "buyerType": "Retailer", "description": null }, { "buyerId": 3, "buyerType": "Reseller", "description": null }, { "buyerId": 4, "buyerType": "Corporate", "description": null }, { "buyerId": 5, "buyerType": "Individual", "description": null }];
  
  constructor(
    @Inject(DOCUMENT) private _document,
    private _renderer2: Renderer2,
    private meta: Meta,
    private title: Title, 
    public router: Router, 
    public footerService: FooterService,
    public _commonService: CommonService) 
    {
      this.isServer = _commonService.isServer;
      this.isBrowser = _commonService.isBrowser;
    
    this.title.setTitle("Bulk Order Inquiry - Buy More at Less Price");
    this.meta.addTag({ "property": "og:title", "content": "Bulk Order Enquiry - Buy More at Less Price" });
    this.meta.addTag({ "property": "og:description", "content": "Request for quote on bulk order enquiry and get instant response. Buy more products at less price, sit back and wait for your order to arrive." });
    this.meta.addTag({ "property": "og:url", "content": "https://www.moglix.com/rfq" });
    this.meta.addTag({ "name": "description", "content": "Request for quote on bulk order enquiry and get instant response. Buy more products at less price, sit back and wait for your order to arrive." });
  }

  ngOnInit() {

    this.footerService.setFooterObj({ footerData: false });
    this.footerService.footerChangeSubject.next(this.footerService.getFooterObj());

    /**
     * Set canonical starts
     */
    let links = this._renderer2.createElement('link');
    links.rel = "canonical";
    let href = CONSTANTS.PROD + this.router.url.split("?")[0].split("#")[0].toLowerCase();
    links.href = href;
    this._renderer2.appendChild(this._document.head, links);

    if (this.isBrowser) {
      const acc = document.getElementsByClassName("panel-heading");
      let i;

      for (i = 0; i < acc.length; i++) {
        acc[i].addEventListener("click", function () {
          this.classList.toggle("active");
          const panel = this.nextElementSibling;
          if (panel.style.maxHeight) {
            panel.style.maxHeight = null;
          } else {
            panel.style.maxHeight = panel.scrollHeight + "px";
          }
        });
      }
    }
  }
}

