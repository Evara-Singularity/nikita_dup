import { CommonModule } from '@angular/common';
import { Component, Input, NgModule, OnInit, AfterViewInit } from '@angular/core';
import CONSTANTS from '@app/config/constants';
import { GLOBAL_CONSTANT } from '@app/config/global.constant';
import { SafeUrlPipeModule } from '@app/utils/pipes/safe-url.pipe';
import { CommonService } from '@app/utils/services/common.service';

@Component({
  selector: 'whatsapp-toast',
  templateUrl: './whatsapp-toast.component.html',
  styleUrls: ['./whatsapp-toast.component.scss']
})
export class WhatsAppToastComponent implements OnInit,AfterViewInit  {
  readonly imagePathAsset = CONSTANTS.IMAGE_ASSET_URL;
  GLOBAL_CONSTANT = GLOBAL_CONSTANT;
  @Input('customText') customText = '';
  constructor(public commonService: CommonService) { }

  ngOnInit(): void {

  }

  ngAfterViewInit(): void {
    if (this.commonService.isBrowser) {
      setTimeout(() => {
        this.commonService.showWhatsappToolTip = false;
      }, 3000);
    }
  }

  convertURL(url) {
    return encodeURIComponent(url);
  }

}

@NgModule({
  declarations: [WhatsAppToastComponent],
  exports: [WhatsAppToastComponent],
  imports: [
    CommonModule,
    SafeUrlPipeModule
  ]
})

export class WhatsAppToastModule {
}
