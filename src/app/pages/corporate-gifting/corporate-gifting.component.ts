import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import CONSTANTS from '@app/config/constants';
import { ENDPOINTS } from '@app/config/endpoints';
import { ToastMessageService } from '@app/modules/toastMessage/toast-message.service';
import { DataService } from '@app/utils/services/data.service';
import { concat } from 'rxjs-compat/operator/concat';

interface GiftingProduct {
  isAdded: boolean,
  name: string,
  price: any,
  mrp: any,
  quantity: number,
  image: string
}

interface GiftingCategory {
  name: string,
  url: string,
  id: string,
  products: GiftingProduct[]
}

@Component({
  selector: 'app-corporate-gifting',
  templateUrl: './corporate-gifting.component.html',
  styleUrls: ['./corporate-gifting.component.scss']
})
export class CorporateGiftingComponent implements OnInit {

  giftingData: GiftingCategory[] = [];
  selectedCategoryIndex: number = 0;
  readonly maxQuantityAllowed = 5;
  isFormSubmited = false;

  requestForm: FormGroup = this.formBuilder.group({
    'name': ['', [Validators.required]],
    'email': ['', [Validators.required, Validators.email]],
    'phone': ['', [Validators.required, Validators.pattern(/^[0-9]\d*$/)]],
    'message': ['']
  });

  constructor(
    private _route: ActivatedRoute,
    private toast: ToastMessageService,
    private formBuilder: FormBuilder,
    private _dataService: DataService,
  ) { }



  ngOnInit(): void {
    this.getData();
  }

  getData() {
    this._route.data.subscribe(apiDataFromResolver => {
      this.mapDataLayer(apiDataFromResolver['data'][0]['data'][0]['block_data'])
    })
  }

  mapDataLayer(data) {
    this.giftingData = [];
    for (const categoryIdKey in data) {
      if (Object.prototype.hasOwnProperty.call(data, categoryIdKey)) {
        const categoryData = data[categoryIdKey];
        const products = (categoryData['data'] as any[]).map(element => {
          const priceDetails = element['image_general'][0] || null;
          return {
            isAdded: false,
            name: element['image_title'],
            mrp: priceDetails && priceDetails['general_text'],
            price: priceDetails && priceDetails['general_url'],
            quantity: 1,
            image:  CONSTANTS.IMAGE_BASE_URL + element['image_name']
          } as GiftingProduct;
        })
        const category: GiftingCategory = {
          id: categoryIdKey,
          name: categoryData['title'],
          url: categoryData['url'],
          products: products,
        }
        this.giftingData.push(category);
      }
    }
  }

  updateSelectedCategory(index) {
    this.selectedCategoryIndex = index;
  }

  selectProduct(productIndex, event) {
    this.giftingData[this.selectedCategoryIndex].products[productIndex].isAdded = event.target.checked;
    if(!event.target.checked){
      this.giftingData[this.selectedCategoryIndex].products[productIndex].quantity = 1;
    }
  }

  increment(productIndex) {
    if (this.giftingData[this.selectedCategoryIndex].products[productIndex].quantity == this.maxQuantityAllowed) {
      this.toast.show({type: 'info', text : `Max qauntity allowd ${this.maxQuantityAllowed}`});
    } else {
      this.giftingData[this.selectedCategoryIndex].products[productIndex].quantity++;
    }
  }

  decrement(productIndex) {
    if (this.giftingData[this.selectedCategoryIndex].products[productIndex].quantity == 1) {
      this.toast.show({ type: 'info', text: `Mininum qauntity allowed is 1`});
    } else {
      this.giftingData[this.selectedCategoryIndex].products[productIndex].quantity--;
    }
  }

  submit(){
    this.isFormSubmited = true;
    if(!this.requestForm.valid){
      this.toast.show({ type: 'info', text: `Please enter required details`});
    }else if(this.requestForm.valid && this.selectedProductCount == 0){
      this.toast.show({ type: 'info', text: `Please select atleast 1 product to raise a request`});
    }else{
      this.callRemote();
    }
  }

  callRemote() {
    const URL = CONSTANTS.NEW_MOGLIX_API + ENDPOINTS.SAVE_CORPORATE_GIFTING;
    const body = {
      "name": this.requestForm.value['name'],
      "phone": this.requestForm.value['phone'],
      "email": this.requestForm.value['email'],
      "message": this.requestForm.value['message'],
      "productList": this.giftingData.map(category => category.products)
        .reduce((a, b) => [...a, ...b], [])
        .filter(product => product.isAdded === true) // only selected products
        .map(product => `${product.name}||${product.quantity}`).join(',') // get all quantity
    }
    this._dataService.callRestful('POST', URL, { body }).subscribe(response => {
      if (response) {
        this.toast.show({ type: 'info', text: `Request submitted successfully` });
      } else {
        this.toast.show({ type: 'error', text: `Something went wrong! Please try again.` });
      }
      this.isFormSubmited = false;
      this.requestForm.reset();
      this.resetForm();
    })
  }

  resetForm() {
    this.giftingData.forEach(category => {
      category.products.forEach(product => {
        product.isAdded = false,
          product.quantity = 1
      });
    });
  }

  get selectedProductCount(){
    return this.giftingData.map(category => category.products )
      .reduce((a, b) => [...a,...b], [])
      .filter(product=> product.isAdded === true) // only selected products
      .map(product=>product.quantity) // get all quantity
      .reduce((a, b) => a + b, 0) // sum up
  }

}
