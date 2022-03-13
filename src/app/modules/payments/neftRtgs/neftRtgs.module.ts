import {NgModule} from '@angular/core';
import {CommonModule} from "@angular/common";
import {NeftRtgsComponent} from "./neftRtgs.component";



@NgModule({
    imports: [
        CommonModule,
    ],
    declarations: [
        NeftRtgsComponent
    ],
    exports:[
        NeftRtgsComponent
    ],
    providers: []
})

export class NeftRtgsModule{}