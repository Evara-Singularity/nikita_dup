import { Routes, RouterModule } from '@angular/router';
import { HomeV1Component } from './home-v1.component';
import { NgModule } from '@angular/core';
import { HomeResolver } from '@app/utils/resolvers/home.resolver';



const routes: Routes = [
  {  
    path: '',
    component: HomeV1Component,
    resolve: {
      homeData: HomeResolver
  }
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class HomeV1Routes { 
 
}
