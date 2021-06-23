import { CommonModule } from '@angular/common';
import { Component, Input, NgModule, OnInit, Output, EventEmitter } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-global-toast',
  templateUrl: './global-toast.component.html',
  styleUrls: ['./global-toast.component.scss']
})
export class GlobalToastComponent implements OnInit {

  showToast: boolean = true;
  @Input() text: string = null;
  @Input() btnLink: string = null;
  @Input() btnText: string = null;
  @Input() showTime: number = 3000;
  @Output() removed: EventEmitter<any> = new EventEmitter<any>();

  constructor() {
  }

  ngOnInit(): void {
    setTimeout(() => {
      this.showToast = false;
      this.removed.emit(true);
    }, this.showTime);
  }

}

@NgModule({
  declarations: [GlobalToastComponent],
  imports: [
    CommonModule,
    RouterModule
  ]
})
export class GlobalToastModule {

}
