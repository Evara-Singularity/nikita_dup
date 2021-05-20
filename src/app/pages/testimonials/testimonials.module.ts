import { NgModule } from '@angular/core';
import { CommonModule } from "@angular/common";
import { RouterModule } from '@angular/router';
import { TestimonialsRoutingModule } from "./testimonials.routing";
import {TestimonialsComponent} from "./testimonials.component";

@NgModule({
    imports: [
        CommonModule,
        TestimonialsRoutingModule,
        RouterModule
    ],
    declarations: [
        TestimonialsComponent
    ],
    providers: [
    ]
})

export class TestimonialsModule{}
