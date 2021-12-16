import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ArticleUtilService } from './article-util.service';
import { ArticleResolver } from './article.resolver';
import { CmsModule } from '../../modules/cms/cms.module';
import { ArticleComponent } from './article.component';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
    {
        path: '',
        component: ArticleComponent,
        resolve: {
            articleData: ArticleResolver
        }
    }
];

@NgModule({
    declarations: [
        ArticleComponent,
    ],
    imports: [
        CommonModule,
        CmsModule,
        RouterModule,
        RouterModule.forChild(routes)
    ],
    providers: [
        ArticleUtilService,
        ArticleResolver
    ]
})
export class ArticleModule { }
