import { DOCUMENT } from '@angular/common';
import { Component, Renderer2, Inject } from '@angular/core';
import { Router } from '@angular/router';
import CONSTANTS from '@app/config/constants';
import { CommonService } from '@app/utils/services/common.service';
import { FooterService } from '@app/utils/services/footer.service';

@Component({
  selector: 'installation-service',
  templateUrl: 'installationService.html', 
  styleUrls: ['installationService.scss']
})
export class InstallationComponent {

  isServer: boolean;
  isBrowser: boolean;
  API = CONSTANTS;

  constructor(
    public router: Router,
    private footerService: FooterService,
    private _renderer2: Renderer2,
    @Inject(DOCUMENT) private _document,
    public _commonService: CommonService) {
    this.isServer = _commonService.isServer;
    this.isBrowser = _commonService.isBrowser;
  }

  ngOnInit() {
    if (this.isBrowser) {
      if (window.outerWidth <= 768) {
        this.footerService.setFooterObj({ footerData: false });
        this.footerService.footerChangeSubject.next(this.footerService.getFooterObj());
      } else {
        this.footerService.setFooterObj({ footerData: false });
        this.footerService.footerChangeSubject.next(this.footerService.getFooterObj());
      }
    }

    if (this.isServer) {
      this.footerService.setFooterObj({ footerData: false });
      this.footerService.footerChangeSubject.next(this.footerService.getFooterObj());
    }
    if (this.isServer) {
      let links = this._renderer2.createElement('link');
      links.rel = "canonical";
      links.href = CONSTANTS.PROD + this.router.url;
      this._renderer2.appendChild(this._document.head, links);
    }
  }
}