import { NgModule } from '@angular/core';
import { CommonModule } from "@angular/common";
import { RouterModule } from '@angular/router';
import { routing } from "./store.routing";
import {  StoreService} from './store.service';
import { StoreComponent } from './store.component';

@NgModule({
    imports: [
        CommonModule,
        routing,
        RouterModule
    ],
    declarations: [
        StoreComponent
    ],
    exports:[
        StoreComponent
    ],
    providers: [
        StoreService
    ]
})

export class StoreModule{}
