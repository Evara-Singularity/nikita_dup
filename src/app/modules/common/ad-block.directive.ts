import {Directive, ViewContainerRef} from "@angular/core";

@Directive({
    selector: '[ad-block]'
})
export class AdBlockDirective{
    constructor(public viewContainerRef: ViewContainerRef){

    }
}