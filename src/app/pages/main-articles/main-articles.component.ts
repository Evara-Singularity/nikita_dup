import { DOCUMENT } from '@angular/common';
import { Component, Inject, OnInit, Renderer2 } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import CONSTANTS from '@app/config/constants';
import { ToastMessageService } from '@app/modules/toastMessage/toast-message.service';
import { CommonService } from '@app/utils/services/common.service';
import { DataService } from '@app/utils/services/data.service';
import { FooterService } from '@app/utils/services/footer.service';
import { GlobalLoaderService } from '@services/global-loader.service';
import { environment } from 'environments/environment';


@Component({
    selector: 'main-articles',
    templateUrl: './main-articles.component.html',
    styleUrls: ['./main-articles.component.scss']
})
export class MainArticlesComponent implements OnInit
{
    readonly imagePath = CONSTANTS.IMAGE_BASE_URL;
    readonly data = 'data';
    readonly URL = "/cmsApi/getArticlesListByCategory?pageNumber=0&pageSize=1&categoryCode=1"
    readonly BASE_URL = environment.BASE_URL;
    //SEO
    readonly TITLE = "Online B2B Industrial Products and Equipments Guide - Moglix.com";
    readonly DESCRIPTION = "Explore the complete buying guide before purchasing Industrial tools and equipment Online at Moglix.com.Get Tips from Industry Experts for buying all types of industrial hardware tools and Machinery.";
    articleUrl = CONSTANTS.PROD;
    articleList = [];
    isBrowser = false;
    isServer = false;
    pageNumber = 1;


    constructor(private route: ActivatedRoute, private router: Router, private footerService: FooterService, private _commonService: CommonService, private toastMessageService: ToastMessageService,
        private _dataService: DataService, private _loaderService: GlobalLoaderService, private _title: Title, private _renderer2: Renderer2, private _meta: Meta, @Inject(DOCUMENT) private _document)
    {
        this.isServer = _commonService.isServer;
        this.isBrowser = _commonService.isBrowser;
    }

    ngOnInit(): void
    {
        const ROUTE_INFO = (this.router.url.split('?')[0].split('#')[0] as string).toLowerCase();
        this.articleUrl = `${this.articleUrl}${ROUTE_INFO}`;
        if (this.route.snapshot.data['responseData']) {
            let response = this.route.snapshot.data['responseData'][0];
            this.updateArticlesList(response);
            //TODO:
            this._title.setTitle(this.TITLE);
            if (this.isServer) { this.setSEOInfo(this.DESCRIPTION) }
        }
        if (this.isBrowser) {
            (window.outerWidth >= 768) ? this.setFooter() : this.setMobileFoooters();
        }
    }

    fetchArticles()
    {
        this.pageNumber += this.pageNumber;
        const URL = `${this.BASE_URL}/cmsApi/getArticlesListByCategory?pageNumber=${this.pageNumber}&pageSize=10&categoryCode=all`;
        this._loaderService.setLoaderState(true);
        this._dataService.callRestful("GET", URL).subscribe(
            (response) => { this.updateArticlesList(response); }, (error) => { this._loaderService.setLoaderState(false); }
        );
    }

    updateArticlesList(response)
    {
        if (response['status'] && response[this.data]) {
            const LIST = (response[this.data][0]['articleList'] as any[]) || [];
            this.articleList = [...this.articleList, ...LIST];
            this._loaderService.setLoaderState(false);
            return;
        }
        this.toastMessageService.show({ type: 'error', text: response['message'] });
    }

    setFooter()
    {
        this.footerService.setFooterObj({ feature: false, terms: true, links: true, popular: false, copyright: true, companyinfo: false });
        this.footerService.footerChangeSubject.next(this.footerService.getFooterObj());
    }

    navigateTo(url) { this.router.navigate([`articles/${url}`]); }

    setMobileFoooters() { this.footerService.setMobileFoooters(); }

    //SEO code
    setSEOInfo(metaDescription)
    {
        this._meta.addTag({ "name": "description", "content": metaDescription });
        let ampLink = this._renderer2.createElement('link');
        ampLink.rel = "canonical";
        ampLink.href = this.articleUrl;
        this._renderer2.appendChild(this._document.head, ampLink);
    }
}
