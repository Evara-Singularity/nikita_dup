import { NgModule, Pipe, PipeTransform } from '@angular/core';
import CONSTANTS from '@app/config/constants';

@Pipe({
  name: 'enhanceImgByNetwork'
})
export class EnhanceImgByNetworkPipe implements PipeTransform {

  readonly imageSizes = CONSTANTS.IMAGE_SIZES_TYPE
  readonly THRESHOLD: number = CONSTANTS.NETWORK_SPEED_THRESHOD_LIMIT // 2MB

  readonly replaceOptions = CONSTANTS.IMAGE_SIZES_REPLACE_DATA

  transform(value: any, args?: any): any {
    const imageSrc = value;
    const sizeType = this.imageSizes.filter(size => imageSrc.indexOf(size) != -1);
    const imageSrcChunks = imageSrc.split('/');
    // console.log('inside imageSrcChunks ===>', imageSrcChunks);
    imageSrcChunks[(imageSrcChunks.length - 1)] = imageSrcChunks[(imageSrcChunks.length - 1)].replace(sizeType[0], this.replaceOptions[sizeType[0]]);
    return imageSrcChunks.join('/');
  }

}

@NgModule({
  imports: [],
  exports: [EnhanceImgByNetworkPipe],
  declarations: [EnhanceImgByNetworkPipe],
  providers: [EnhanceImgByNetworkPipe],
})
export class EnhanceImgByNetworkPipeModule { }
