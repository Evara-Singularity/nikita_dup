import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, NgModule, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-alert-box-toast',
  templateUrl: './alert-box-toast.component.html',
  styleUrls: ['./alert-box-toast.component.scss']
})
export class AlertBoxToastComponent implements OnInit {

  @Input() mainText: string;
  @Input() subText: string;
  @Output() removed: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Input() extraSectionName: string = null;

  constructor() { }

  ngOnInit(): void {
  }

  remove(){
    this.removed.emit(true);
  }

}

@NgModule({
  declarations: [AlertBoxToastComponent],
  imports: [
    CommonModule
  ]
})
export class AlertBoxToastModule{
}
