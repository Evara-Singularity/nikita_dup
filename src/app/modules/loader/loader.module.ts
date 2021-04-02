import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { LoaderComponent } from "./loader.component";

@NgModule({
    imports: [CommonModule],
    exports: [LoaderComponent],
    declarations: [LoaderComponent],
    providers: [],
})
export class LoaderModule {
}