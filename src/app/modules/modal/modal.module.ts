import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalComponent } from './modal.component';
import { ModalService } from './modal.service';
import { ModalDirective } from './modal.directive';

@NgModule({
    declarations: [
        ModalComponent,
        ModalDirective
    ],
    imports: [ CommonModule ],
    exports: [
        ModalComponent,
        ModalDirective
    ],
    providers: [
    ],
})
export class ModalModule {}
