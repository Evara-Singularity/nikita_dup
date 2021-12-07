import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MainArticlesResolver } from './../../utils/resolvers/main-articles.resolver';
import { MainArticleComponent } from './main-article.component';
const routes: Routes = [
    {
        path: '',
        component: MainArticleComponent,
        resolve: {
            responseData: MainArticlesResolver
        }
    }
];
@NgModule({
    declarations: [MainArticleComponent],
    imports: [
        CommonModule,
        RouterModule,
        RouterModule.forChild(routes),
    ],
    providers: [MainArticlesResolver]
})
export class MainArticleModule { }
