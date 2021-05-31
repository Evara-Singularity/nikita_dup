import { CommonModule } from "@angular/common";
import { Component, Input, NgModule } from "@angular/core";
import { Router } from "@angular/router";
import { CONSTANTS } from '@config/constants';


@Component({
    selector: 'recent-articles',
    templateUrl: './recent-articles.component.html',
    styleUrls: ['./recent-articles.component.scss'],
})
export class RecentArticles {
    constructor(private router: Router) {}
    @Input() recentArticles;
    @Input() title;
    imageBaseUrl = CONSTANTS.IMAGE_BASE_URL;
    defaultImage = this.imageBaseUrl + CONSTANTS.ASSET_IMG;
    navigateToArticlePage(article) {
        this.router.navigateByUrl('/articles/' + article.friendlyUrl)
    }
}

@NgModule({
    declarations: [RecentArticles],
    imports: [CommonModule]
})
export class RecentArticlesModule {}
export class CategoryModule extends RecentArticlesModule {}