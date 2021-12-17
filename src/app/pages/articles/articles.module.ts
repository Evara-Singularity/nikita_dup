import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MainArticlesResolver } from '../../utils/resolvers/main-articles.resolver';
import { ArticlesComponent } from './articles.component';
const routes: Routes = [
    {
        path: '',
        component: ArticlesComponent,
        resolve: {
            responseData: MainArticlesResolver
        }
    }
];
@NgModule({
    declarations: [ArticlesComponent],
    imports: [
        CommonModule,
        RouterModule,
        RouterModule.forChild(routes),
    ],
    providers: [MainArticlesResolver]
})
export class ArticlesModule { }
