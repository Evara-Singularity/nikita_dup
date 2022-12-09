import { CommonModule } from "@angular/common";
import { Component, Input, NgModule, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { CONSTANTS } from '@config/constants';
import { ProductService } from "@app/utils/services/product.service";
@Component({
    selector: 'recent-articles',
    templateUrl: './recent-articles.component.html',
    styleUrls: ['./recent-articles.component.scss'],
})
export class RecentArticles implements OnInit
{
    constructor(private router: Router, private _productService:ProductService) { }
    
    @Input() recentArticles;
    @Input() title;
    imageBaseUrl = CONSTANTS.IMAGE_BASE_URL;
    defaultImage = this.imageBaseUrl + CONSTANTS.ASSET_IMG;
    
    ngOnInit() {
        for(let i=0;i<this.recentArticles.length;i++){
            this.recentArticles[i]['thumbnailImage']=this._productService.getForLeadingSlash(this.recentArticles[i]['thumbnailImage']);
        }
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