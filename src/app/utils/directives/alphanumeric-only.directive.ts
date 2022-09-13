import { CommonModule } from '@angular/common';
import { Directive, ElementRef, HostListener, NgModule } from '@angular/core';

@Directive({
    selector: 'input[data-alphabetsOnly]'
})
export class AlphabetsDirective
{
    constructor(private _el: ElementRef) { }

    @HostListener('input', ['$event']) onInputChange(event)
    {
        const initalValue = (this._el.nativeElement.value as string);
        this._el.nativeElement.value = initalValue.replace(/[-0123456789_~*|./\":%,^!+=?#<>[\]{}`\\()';@&$]+$/g, '');
        if (initalValue !== this._el.nativeElement.value) {
            event.stopPropagation();
        }
    }
}



@NgModule({
    imports: [CommonModule],
    exports: [AlphabetsDirective],
    declarations: [AlphabetsDirective],
    providers: [],
})
export class AlphabetsModule { } 
