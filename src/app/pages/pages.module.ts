import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PagesRoutingModule } from './pages.routing';
import { PagesComponent } from './pages.component';
import { HeaderNavModule } from '../modules/header-nav/header-nav.module';
import { GlobalLoaderModule } from '../modules/global-loader/global-loader.module';

@NgModule({
  declarations: [PagesComponent],
  imports: [
    CommonModule,
    PagesRoutingModule,
    HeaderNavModule,
    GlobalLoaderModule
  ]
})
export class PagesModule { }
