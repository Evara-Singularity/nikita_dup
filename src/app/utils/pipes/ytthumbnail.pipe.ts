import { Pipe, PipeTransform, NgModule } from '@angular/core';
@Pipe({
    name: 'ytthumbnail'
})
export class YTThumbnailPipe implements PipeTransform {
    transform(link: string, type: string): any {
        let key = '';
        if(link.includes('watch?v=')){
            const key2 = link.split('watch?v=');
            key = key2[key2.length - 1];
            return 'https://img.youtube.com/vi/' + key + '/' + type + '.jpg';
        }
        key = link.split('/')[4].split('?')[0];
        return 'https://img.youtube.com/vi/' + key + '/' + type + '.jpg';
    }
}

@NgModule({
    imports: [],
    exports: [YTThumbnailPipe],
    declarations: [YTThumbnailPipe],
    providers: [YTThumbnailPipe],
})
export class YTThumnailPipeModule { }


