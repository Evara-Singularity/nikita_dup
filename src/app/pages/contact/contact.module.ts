import { NgModule } from '@angular/core';
import { CommonModule } from "@angular/common";
import { RouterModule } from '@angular/router';
import { ContactComponent } from "./contact.component";
import { ContactRoutingModule } from './contact.routing';

@NgModule({
    imports: [
        CommonModule,
        ContactRoutingModule,
        RouterModule
    ],
    declarations: [
        ContactComponent
    ],
    providers: [
    ]
})
export class ContactModule { }
