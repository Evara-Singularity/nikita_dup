import { CommonModule } from '@angular/common';
import { Component, Input, NgModule, OnInit } from '@angular/core';
import { GLOBAL_CONSTANT } from '@app/config/global.constant';
import {SafeUrl, SafeUrlPipeModule } from '@app/utils/pipes/safe-url.pipe';

@Component({
  selector: 'whatsapp-toast',
  templateUrl: './whatsapp-toast.component.html',
  styleUrls: ['./whatsapp-toast.component.scss']
})
export class WhatsAppToastComponent implements OnInit {
  constructor() { }
  GLOBAL_CONSTANT = GLOBAL_CONSTANT;
  @Input('customText') customText = '';

  ngOnInit(): void {
  }

  convertURL(url){
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
