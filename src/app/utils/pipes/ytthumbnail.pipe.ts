import { Pipe, PipeTransform, NgModule } from '@angular/core';
@Pipe({
    name: 'ytthumbnail'
})
export class YTThumbnailPipe implements PipeTransform {
    transform(link: string, type: string): any {
        let key = link.split('/')[4].split('?')[0];
        return 'https://img.youtube.com/vi/' + key + '/' + type + '.jpg';
    }
}

@NgModule({
    imports: [],
    exports: [YTThumbnailPipe],
    declarations: [YTThumbnailPipe],
    providers: [],
})
export class YTThumnailPipeModule { }


