import { Pipe, PipeTransform, NgModule } from '@angular/core';
@Pipe({
    name: 'ytthumbnail'
})
export class YTThumbnailPipe implements PipeTransform {
    transform(link: string, type: string): any {
        let arr = link.split('/');
        return 'https://img.youtube.com/vi/' + arr[arr.length - 1] + '/' + type + '.jpg';
    }
}

@NgModule({
    imports: [],
    exports: [YTThumbnailPipe],
    declarations: [YTThumbnailPipe],
    providers: [],
})
export class YTThumnailPipeModule { }


