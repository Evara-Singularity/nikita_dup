import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ArticleComponent } from './article.component';
import { ArticleResolver } from './article.resolver';

const routes: Routes = [
    {
        path:'',
        component: ArticleComponent,
        resolve: {
            articleData: ArticleResolver
        }
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class ArticlesRoutingModule { }