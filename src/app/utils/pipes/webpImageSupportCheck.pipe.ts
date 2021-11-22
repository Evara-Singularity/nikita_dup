import { CommonModule } from '@angular/common';
import { NgModule, Pipe, PipeTransform } from '@angular/core';
import { CommonService } from '../services/common.service';

@Pipe({
  name: 'webpImageSupportCheck'
})
export class WebpImageSupportCheckPipe implements PipeTransform {

  constructor(
    private _common: CommonService,
  ) {
  }

  transform(value: any, args?: any): any {
    if (this._common.webpSupport) {
      const imageSrcChunks = value.split('/');
      imageSrcChunks[(imageSrcChunks.length - 1)] = imageSrcChunks[(imageSrcChunks.length - 1)].replace('.jpg', '.webp').replace('.jpeg', '.webp');
      return imageSrcChunks.join('/');
    } else {
      return value;
    }
  }

}

@NgModule({
  declarations: [
    WebpImageSupportCheckPipe
  ],
  imports: [
    CommonModule,
  ],
  exports: [WebpImageSupportCheckPipe],
})
export class WebpImageSupportCheckPipeModule { }
