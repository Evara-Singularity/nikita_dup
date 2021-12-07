import { DOCUMENT } from '@angular/common';
import { Component, Inject, OnInit, Renderer2 } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import CONSTANTS from '@app/config/constants';
import { ToastMessageService } from '@app/modules/toastMessage/toast-message.service';
import { CommonService } from '@app/utils/services/common.service';
import { FooterService } from '@app/utils/services/footer.service';
import { GlobalAnalyticsService } from '@app/utils/services/global-analytics.service';
import { LocalStorageService } from 'ngx-webstorage';

@Component({
    selector: 'main-article',
    templateUrl: './main-article.component.html',
    styleUrls: ['./main-article.component.scss']
})
export class MainArticleComponent implements OnInit
{
    readonly imagePath = CONSTANTS.IMAGE_BASE_URL;
    readonly data = 'data';
    articleUrl = CONSTANTS.PROD;
    articleList = null;
    categoryCode = null;
    isBrowser = false;
    isServer = false;

    constructor(private route: ActivatedRoute, private router: Router, private footerService: FooterService, private _commonService: CommonService, private toastMessageService: ToastMessageService,)
    {
        this.isServer = _commonService.isServer;
        this.isBrowser = _commonService.isBrowser;
    }

    ngOnInit(): void
    {
        const ROUTE_INFO = (this.router.url.split('?')[0].split('#')[0] as string).toLowerCase();
        this.articleUrl = `${this.articleUrl}${ROUTE_INFO}`;
        if (this.route.snapshot.data['responseData']) {
            let response = this.route.snapshot.data['responseData'];
            if (response['status'] && response[this.data]) {
                this.initialize(response[this.data]);
                return;
            }
            this.toastMessageService.show({ type: 'error', text: response['message'] });
        }
    }

    initialize(response)
    {
        this.categoryCode = response['categoryCode'];
        this.articleList = response[this.data];
        if (this.isBrowser) {
            (window.outerWidth >= 768) ? this.setFooter() : this.setMobileFoooters();
        }
    }

    setFooter()
    {
        this.footerService.setFooterObj({ feature: false, terms: true, links: true, popular: false, copyright: true, companyinfo: false });
        this.footerService.footerChangeSubject.next(this.footerService.getFooterObj());
    }

    setMobileFoooters()
    {
        this.footerService.setMobileFoooters();
    }
}
