import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ArticleUtilService } from './article-util.service';
import { ArticleResolver } from './article.resolver';
import { ArticleService } from './article.service';
import { ArticlesRoutingModule } from './articles-routing.module';
import { CmsModule } from '../../modules/cms/cms.module';
import { ArticleComponent } from './article.component';
import { ToastMessageModule } from '../../modules/toastMessage/toast-message.module';

@NgModule({
    declarations: [
        ArticleComponent,
    ],
    imports: [
        CommonModule,
        ArticlesRoutingModule,
        CmsModule,
        ToastMessageModule
    ],
    providers: [
        ArticleService,
        ArticleUtilService,
        ArticleResolver
    ]
})
export class ArticlesModule { }
