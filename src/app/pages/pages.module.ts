import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PagesRoutingModule } from './pages.routing';
import { PagesComponent } from './pages.component';
import { HeaderNavModule } from '../modules/header-nav/header-nav.module';
import { GlobalLoaderModule } from '../modules/global-loader/global-loader.module';
import { MyAccountGuard } from '../utils/guards/myAccount.guard'
import { ModalModule } from '@app/modules/modal/modal.module';
import { ToastMessageModule } from '@app/modules/toastMessage/toast-message.module';

@NgModule({
  declarations: [PagesComponent],
  imports: [
    CommonModule,
    PagesRoutingModule,
    HeaderNavModule,
    GlobalLoaderModule,
    // this modal are used in all major module and hence being added to pages 
    ModalModule, 
    ToastMessageModule,
  ],
  providers: [MyAccountGuard]
})
export class PagesModule { }
