import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'lsrPipe' })
export class LowSuccessMessagePipe implements PipeTransform
{
    transform(top: any[], others: any[], type)
    {
        let lsrTop: string = null;
        let lsrMessage: string = null;
        if (top && top.length) {
            let temp: string[] = [];
            top.forEach((item) => { temp.push(item['name']) })
            lsrTop = temp.join(", ").trim();
            if (lsrTop && others.length > 0) {
                lsrMessage = lsrTop + " and " + others.length + " more " + type;
            }
            else {
                lsrMessage = lsrTop;
            }
        } else {
            if (others && others.length > 0) {
                const length = others.length;
                if (length == 1) {
                    lsrMessage = others[0]['name'];
                }
                else if (length == 2) {
                    lsrMessage = others[0]['name'] + ', ' + others[1]['name'];
                } else {
                    lsrMessage = others[0]['name'] + ', ' + others[1]['name'] + " and " + (length - 2) + " more " + type;
                }
            }
        }
        return lsrMessage;
    }
}

import { NgModule } from '@angular/core';
@NgModule({
    imports: [],
    exports: [LowSuccessMessagePipe],
    declarations: [LowSuccessMessagePipe],
    providers: [LowSuccessMessagePipe],
})
export class LowSuccessMessagePipeModule { }
