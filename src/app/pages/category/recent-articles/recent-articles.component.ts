import { Component, Input } from "@angular/core";
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
    defaultImage = this.imageBaseUrl +'assets/img/home_card.webp';
    navigateToArticlePage(article) {
        this.router.navigateByUrl('/articles/' + article.friendlyUrl)
    }
}