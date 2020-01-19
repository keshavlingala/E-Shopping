import {Component, Input, OnInit} from '@angular/core';
import {Product} from '../Product';
import {ProductsService} from '../products.service';

@Component({
  selector: 'app-item-card',
  templateUrl: './item-card.component.html',
  styleUrls: ['./item-card.component.scss']
})
export class ItemCardComponent implements OnInit {
  @Input() item: Product;

  constructor(
    private data: ProductsService
  ) {
  }

  ngOnInit() {

  }

  replaceImg(item: Product) {
    this.item.image = 'http://lorempixel.com/g/400/200';
  }
}
