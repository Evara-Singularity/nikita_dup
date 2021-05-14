import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ArticleUtilService } from './article-util.service';
import { ArticleResolver } from './article.resolver';
import { ArticleService } from './article.service';
import { ArticlesRoutingModule } from './articles-routing.module';
import { CmsModule } from '../../modules/cms/cms.module';
<<<<<<< HEAD
//import { ArticleComponent } from './article/article.component';
import { LoaderModule } from 'src/app/modules/loader/loader.module';
=======
import { ArticleComponent } from './article.component';
>>>>>>> a469a0fbd559ca2e44d9a41ee91c1335d9da5dbf
import { ToastMessageModule } from 'src/app/modules/toastMessage/toast-message.module';
import { ArticleComponent } from './article.component';

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
