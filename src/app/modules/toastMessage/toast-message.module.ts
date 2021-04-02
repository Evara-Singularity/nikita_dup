import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastMessageComponent } from './toast-message.component';

@NgModule({
    declarations: [
        ToastMessageComponent
    ],
    imports: [ CommonModule ],
    exports: [
        ToastMessageComponent
    ],
    providers: [
    ],
})
export class ToastMessageModule {}

export class ToastMessage {
    type: string;
    text: string;
}
