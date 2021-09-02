import { DOCUMENT, isPlatformBrowser, isPlatformServer } from '@angular/common';
import { Component, Inject, OnInit, PLATFORM_ID, Renderer2 } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import CONSTANTS from '@app/config/constants';
import { ToastMessageService } from '@app/modules/toastMessage/toast-message.service';
import { CommonService } from '@app/utils/services/common.service';
import { GlobalAnalyticsService } from '@app/utils/services/global-analytics.service';
import { LocalStorageService } from 'ngx-webstorage';
import { ArticleUtilService } from './article-util.service';

@Component({
    selector: 'article',
    templateUrl: './article.component.html',
    styleUrls: ['./article.component.scss']
})
export class ArticleComponent implements OnInit
{
    readonly componentLabel = 'componentLabel';
    readonly data = 'data';
    readonly imagePath = CONSTANTS.IMAGE_BASE_URL;
    articleUrl = CONSTANTS.PROD;
    articles = null;
    metaInformation = null;
    breadCrumbTitle = null;
    categoryCode = null;
    isBrowser = false;
    isServer = false;

    constructor(private route: ActivatedRoute, private articleUtilService: ArticleUtilService, @Inject(PLATFORM_ID) platformId, private router: Router,	private _commonService: CommonService, private _localStorageService:LocalStorageService, private _analytics:GlobalAnalyticsService,
        private toastMessageService: ToastMessageService, private title: Title, private renderer2: Renderer2, private meta: Meta, @Inject(DOCUMENT) private document)
    {
        this.isServer = isPlatformServer(platformId);
        this.isBrowser = isPlatformBrowser(platformId);
    }

    ngOnInit() {
        this.articleUrl = this.articleUrl + (this.router.url.split('?')[0].split('#')[0] as string).toLowerCase();
        if (this.route.snapshot.data['articleData']) {
            let response = this.route.snapshot.data['articleData'];
            if (response['statusCode'] === 200 && response[this.data] != null) {
                this.initialize(response[this.data]);
            } else {
                this.toastMessageService.show({ type: 'error', text: response['message'] });
            }
        }
    }

    setAnalyticTags(response) {
            let user;
            if (this._localStorageService.retrieve('user')) {
                user = this._localStorageService.retrieve('user');
            }
            /*Start Adobe Analytics Tags */
            let page = {
                'pageName': "moglix:" + response.data[0].componentName,
                'channel': "article",
                'subSection': "moglix:" + response.data[0].componentName + ":" + this._commonService.getSectionClick().toLowerCase(),
                'loginStatus': (user && user["authenticated"] == 'true') ? "registered user" : "guest"
            };
            let custData = {
                'customerID': (user && user["userId"]) ? btoa(user["userId"]) : '',
                'emailID': (user && user["email"]) ? btoa(user["email"]) : '',
                'mobile': (user && user["phone"]) ? btoa(user["phone"]) : '',
                'customerType': (user && user["userType"]) ? user["userType"] : '',
            };
            const digitalData = {};
            digitalData['page'] = page;
            digitalData['custData'] = custData;
            setTimeout(() => this._analytics.sendAdobeCall(digitalData), 0 );
            /*End Adobe Analytics Tags */
    }

    initialize(response)
    {
        this.metaInformation = { metaTitle: response['metaTitle'], metaDescription: response['metaDescription'] };
        if (this.isBrowser) {
            this.title.setTitle(response['metaTitle']);
            (window.outerWidth >= 768) ? this.articleUtilService.setFooter() : this.articleUtilService.setMobileFoooters();
            this.setAnalyticTags(response);
        }
        if (this.isServer) {
            this.setMetaInformation(this.metaInformation);
            this.setCanonicalUrls('canonical');
            this.setArticleSchema(response);
            this.setBreadcrumbSchema(response['title']);
        }
        this.breadCrumbTitle = response['title'];
        this.categoryCode = response['category'];
        this.articles = response[this.data];
    }

    setMetaInformation(metaData)
    {
        this.title.setTitle(metaData['metaTitle']);
        this.meta.addTag({ "name": "description", "content": metaData['metaDescription'] });
        this.meta.addTag({ "name": "og:title", "content": metaData['metaTitle'] });
        this.meta.addTag({ "name": "og:description", "content": metaData['metaDescription'] });
        this.meta.addTag({ "name": "og:url", "content": this.articleUrl });
        this.meta.addTag({ "name": "robots", "content": 'index,follow' });
    }

    setCanonicalUrls(rel)
    {
        let ampLink = this.renderer2.createElement('link');
        ampLink.rel = rel;
        ampLink.href = this.articleUrl;
        this.renderer2.appendChild(this.document.head, ampLink);
    }

    setArticleSchema(response)
    {
        let schema = { metaTitle: response['metaTitle'], url: this.articleUrl, mainBannerUrl: this.imagePath + response[this.data][0][this.data][0]['imageLink_m'], timeStamp: new Date().toISOString() };
        let tag = this.renderer2.createElement('script');
        tag.type = "application/ld+json";
        tag.text = this.articleUtilService.getArticlesSchema(schema)
        this.renderer2.appendChild(this.document.head, tag);
    }

    setBreadcrumbSchema(title)
    {
        let tag = this.renderer2.createElement('script');
        tag.type = "application/ld+json";
        tag.text = this.articleUtilService.getBreadcrumbSchema(title, this.articleUrl)
        this.renderer2.appendChild(this.document.head, tag);
    }
}
