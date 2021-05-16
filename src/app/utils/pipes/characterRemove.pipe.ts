import { Pipe, PipeTransform, NgModule } from '@angular/core';

@Pipe({
    name: 'characterremove'
})

export class CharacterremovePipe implements PipeTransform {
    transform(value: string): any {
        let result: Array<any> = [];
        let final = [];
        if (value != null && value !== undefined) {
            result = value.split("||");
            result.forEach(element => {
                let keyvalue = element.split(':');
                final.push({ 'key': keyvalue[0], 'value': keyvalue[1] })
            })
            return final;
        }
        else {
            result = [];
            return final;
        }

    }
}

@NgModule({
    exports: [CharacterremovePipe],
    declarations: [CharacterremovePipe],
    providers: [
        CharacterremovePipe
    ],
})
export class CharacterremovePipeModule { }

