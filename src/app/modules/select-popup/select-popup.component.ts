import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'select-popup',
  templateUrl: './select-popup.component.html',
  styleUrls: ['./select-popup.component.scss']
})
export class SelectPopupComponent implements OnInit {

  @Input() itemArray: Array<object> = [];
  @Input() displayKey: string = null;
  @Input() valueKey: string = null;
  @Input() isVisible: boolean = true;
  @Input() headerLabel: string = '';

  @Output() selectedValue$ = new EventEmitter<object>();

  constructor() { }

  ngOnInit(): void {
  }

  onSelect(valueSelected): void {
    this.selectedValue$.emit(valueSelected);
  }

}
