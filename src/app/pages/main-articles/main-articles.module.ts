import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MainArticlesResolver } from '../../utils/resolvers/main-articles.resolver';
import { MainArticlesComponent } from './main-articles.component';
const routes: Routes = [
    {
        path: '',
        component: MainArticlesComponent,
        resolve: {
            responseData: MainArticlesResolver
        }
    }
];
@NgModule({
    declarations: [MainArticlesComponent],
    imports: [
        CommonModule,
        RouterModule,
        RouterModule.forChild(routes),
    ],
    providers: [MainArticlesResolver]
})
export class MainArticlesModule { }
