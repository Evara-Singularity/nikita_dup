import { CommonModule } from "@angular/common";
import { Component, Input, NgModule, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { CONSTANTS } from '@config/constants';


@Component({
    selector: 'recent-articles',
    templateUrl: './recent-articles.component.html',
    styleUrls: ['./recent-articles.component.scss'],
})
export class RecentArticles implements OnInit
{
    constructor(private router: Router) { }
    
    @Input() recentArticles;
    @Input() title;
    imageBaseUrl = CONSTANTS.IMAGE_BASE_URL;
    defaultImage = this.imageBaseUrl + CONSTANTS.ASSET_IMG;
    
    ngOnInit() {
    }
    
    navigateToArticlePage(article)
    {
        this.router.navigateByUrl('/articles/' + article.friendlyUrl);
    }

}

@NgModule({
    declarations: [RecentArticles],
    imports: [CommonModule],
    exports: [RecentArticles]
})
export class RecentArticlesModule { }
export class CategoryModule extends RecentArticlesModule { }