import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from './../../../environments/environment';
import { ENDPOINTS } from '../../config/endpoints';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-product',
  templateUrl: './product.component.html',
  styleUrls: ['./product.component.css']
})
export class ProductComponent implements OnInit {

  private productMsnId: string = null;

  constructor(
    private http: HttpClient,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    
    this.getParams();
  }

  getParams() {
    this.route.data.subscribe((data)=>{
      console.log('getParams data', data);
    })
  }

  getProductInfo() {
    const URL = environment.BASE_URL + ENDPOINTS.PRODUCT_INFO + `?productId=${this.productMsnId}&fetchGroup=true`
    this.http.get(URL).subscribe((result) => {
      console.log('getProductInfo result', result);
    })
  }

}
