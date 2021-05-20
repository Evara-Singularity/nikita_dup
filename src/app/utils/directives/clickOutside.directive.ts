import {Directive, ElementRef} from "@angular/core";

@Directive({
    selector:'[clickOutside]',
    host: {
        '(document:click)':'onDocumentClick($event)'
    },
    outputs: ["clickOutside"]
})
export class ClickOutsideDirective {
    // private nativeElement;
    clickOutside = new EventEmitter();

    constructor(private elementRef: ElementRef) {
        // this.nativeElement = this.elementRef.nativeElement;
    }
    
    onDocumentClick(event){
        // console.log(event.target, this.elementRef.nativeElement, this.elementRef.nativeElement.contains(event.target));
        if(!this.elementRef.nativeElement.contains(event.target))
            this.clickOutside.emit(true);
    }
}


import { NgModule, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';



@NgModule({
    imports: [CommonModule],
    exports: [ClickOutsideDirective],
    declarations: [ClickOutsideDirective],
    providers: [],
})
export class ClickOutsideDirectiveModule { }
