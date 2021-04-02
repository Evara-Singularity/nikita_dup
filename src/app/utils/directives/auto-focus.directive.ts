import { Directive, ElementRef, AfterViewInit } from '@angular/core';

@Directive({
    selector: '[appAutoFocus]'
})
export class AutoFocusDirective implements AfterViewInit {

    constructor(private _el: ElementRef) {
        this._el.nativeElement.focus();
    }

    ngAfterViewInit(): void {
        setTimeout(()=>{
            this._el.nativeElement.focus();
        },0)
    }
}
