import { Pipe, PipeTransform } from '@angular/core';
import { NgModule } from '@angular/core';

@Pipe({
  name: 'removeHTML'
})
export class ReplacePipe implements PipeTransform {

    transform(value: string): string {
        return value.replace(/<[^>]+>/g, '');
      }


}

@NgModule({
    imports: [],
    exports: [ReplacePipe],
    declarations: [ReplacePipe],
    providers: [],
})
export class ReplacePipeModule { }