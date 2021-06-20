import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'success',
  templateUrl: './success.component.html',
  styleUrls: ['./success.component.scss']
})
export class SuccessComponent implements OnInit {

    constructor(private _router: Router) { }

  ngOnInit(): void {
  }

  navigateTo(){this._router.navigate(['/'])}

}
