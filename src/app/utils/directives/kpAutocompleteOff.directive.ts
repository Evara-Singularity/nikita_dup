import {Directive, ElementRef, Renderer2} from "@angular/core";


@Directive({
    selector:'[kpAutocompleteOff]',    
})
export class KpAutocompleteOffDirective {   

    constructor(private renderer: Renderer2, private elementRef: ElementRef) {
        setTimeout(()=>{
            this.elementRef.nativeElement.value = "";
        }, 500);
        this.renderer.addClass(this.elementRef.nativeElement,'autocompleteOff')
    }    
}


import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';



@NgModule({
    imports: [CommonModule],
    exports: [KpAutocompleteOffDirective],
    declarations: [KpAutocompleteOffDirective],
    providers: [],
})
export class KpAutocompleteOffDirectiveModule { }
