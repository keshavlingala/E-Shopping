import {Component, OnDestroy, OnInit} from '@angular/core';
import {ProductsService} from '../products.service';
import {Product} from '../Product';
import {Subscription} from 'rxjs';

@Component({
  selector: 'app-cart',
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.scss']
})
export class CartComponent implements OnInit, OnDestroy {
  products: Product[];
  totalCost = 0;
  cartItems: { [upc: string]: Product } = {};
  subg: Subscription[] = [];

  constructor(
    private data: ProductsService
  ) {
  }

  ngOnInit() {

    this.subg.push(this.data.cart$.subscribe(items => {
      Object.keys(this.cartItems).filter(key => {
        return !items.includes(key);
      }).forEach(k => {
        delete this.cartItems[k];
      });
      // console.log(items);
      this.updatePrice();
      // console.log('Updated Keys and Cart');
      // console.log(this.cartItems);
    }));
  }

  sumCost(item: Product) {
    this.cartItems[item.upc] = item;
    if (item.quantity <= 0) {
      this.data.removeFromCart(item);
      delete this.cartItems[item.upc];
      // console.log('Remove item from Cart');
    } else {
      // console.log('Received Data in Cart ', item);
      // console.log('Cart Items ', this.cartItems);
    }
    this.updatePrice();
    // console.log('Total Cost ', this.totalCost);
    // console.log('Cart Items ', this.cartItems);
  }

  updatePrice() {
    this.totalCost = Object.keys(this.cartItems).reduce((a, b) => a + this.cartItems[b].quantity * this.cartItems[b].price, 0);
  }

  ngOnDestroy(): void {
    this.subg.forEach(s => s.unsubscribe());
  }

}
