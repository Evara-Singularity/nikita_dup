import {NgModule} from '@angular/core';
import {CommonModule} from "@angular/common";
import {NeftRtgsComponent} from "./neftRtgs.component";
import {NeftRtgsService} from "./neftRtgs.service";
import { LoaderModule } from '../loader/loader.module';



@NgModule({
    imports: [
        CommonModule,
        LoaderModule
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