import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'floating-button',
  templateUrl: './floating-button.component.html',
  styleUrls: ['./floating-button.component.scss']
})
export class FloatingButtonComponent implements OnInit {

  @Input() type: 'RED' | 'WHITE' = 'RED';
  @Input() isMultiple = true;
  @Input() label: string = 'Button';
  @Input() iconClass: string;
  @Output() onClick: EventEmitter<any> = new EventEmitter<any>();

  constructor() { }

  ngOnInit(): void {
  }

  onClickButton() {
    this.onClick.emit();
  }

}
