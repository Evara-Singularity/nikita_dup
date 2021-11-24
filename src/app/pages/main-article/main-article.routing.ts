import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { MainArticleComponent } from './main-article.component';


const routes: Routes = [
    {
        path:'',
        component: MainArticleComponent,
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class ArticlesMainRoutingModule { }
