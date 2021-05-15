import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PagesRoutingModule } from './pages-routing.module';
import { PagesComponent } from './pages.component';
import { HeaderNavModule } from '../modules/header-nav/header-nav.module';
import { GlobalLoaderModule } from '../modules/global-loader/global-loader.module';
import { MyAccountGuard } from '../utils/guards/myAccount.guard'

@NgModule({
  declarations: [PagesComponent],
  imports: [
    CommonModule,
    PagesRoutingModule,
    HeaderNavModule,
    GlobalLoaderModule
  ],
  providers: [MyAccountGuard]
})
export class PagesModule { }
