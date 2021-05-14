import {NgModule} from '@angular/core';
import {CommonModule} from "@angular/common";
import {NeftRtgsComponent} from "./neftRtgs.component";
import {NeftRtgsService} from "./neftRtgs.service";



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
    //entryComponents: [BestSellerComponent],
    providers: [
        NeftRtgsService
    ]
})

export class NeftRtgsModule{}