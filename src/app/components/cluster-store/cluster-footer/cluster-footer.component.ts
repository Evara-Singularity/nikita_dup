import { CommonModule } from '@angular/common';
import { Component, OnInit, Input, NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-cluster-footer',
  templateUrl: './cluster-footer.component.html',
  styleUrls: ['./cluster-footer.component.scss']
})
export class ClusterFooterComponent implements OnInit {
  @Input('data') data;
  constructor() { }

  ngOnInit(): void {
  }

}

@NgModule({
  declarations: [
    ClusterFooterComponent
  ],
  imports: [
      CommonModule,
      RouterModule
  ],
})
export class ClusterFooterModule { }
