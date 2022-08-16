import { CommonModule } from '@angular/common';
import { Directive, ElementRef, HostListener, NgModule } from '@angular/core';

@Directive({
    selector: 'input[data-numbersOnly]'
})
export class NumberDirective
{
    constructor(private _el: ElementRef) { }

    @HostListener('input', ['$event']) onInputChange(event)
    {
        const initalValue = (this._el.nativeElement.value as string).trim();
        this._el.nativeElement.value = initalValue.replace(/[^0-9]*/g, '');
        if (initalValue !== this._el.nativeElement.value) {
            event.stopPropagation();
        }
    }
}



@NgModule({
    imports: [CommonModule],
    exports: [NumberDirective],
    declarations: [NumberDirective],
    providers: [],
})
export class NumberDirectiveModule { }
