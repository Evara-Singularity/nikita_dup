import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ArticlesMainRoutingModule } from './main-article.routing';
import { MainArticleComponent } from './main-article.component';



@NgModule({
  declarations: [
    MainArticleComponent
  ],
  imports: [
    CommonModule,
    ArticlesMainRoutingModule
  ]
})
export class MainArticleModule { }
