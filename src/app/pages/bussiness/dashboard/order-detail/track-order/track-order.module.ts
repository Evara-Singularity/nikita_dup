import { TrackOrderService } from './track-order.service';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TrackOrderComponent } from './track-order.component';

@NgModule({
    declarations: [TrackOrderComponent],
    imports: [CommonModule],
    entryComponents: [TrackOrderComponent],
    providers:[TrackOrderService]

})
export class TrackOrderModule { }
