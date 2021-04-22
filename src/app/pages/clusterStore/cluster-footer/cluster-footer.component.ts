import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-cluster-footer',
  templateUrl: './cluster-footer.component.html',
  styleUrls: ['./cluster-footer.component.scss']
})
export class ClusterFooterComponent implements OnInit {
  @Input() data;
  constructor() { }

  ngOnInit(): void {
  }

}
