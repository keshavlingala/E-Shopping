import {AfterViewInit, Component, OnInit} from '@angular/core';
import {Product} from '../Product';
import {ProductsService} from '../products.service';
import {Observable} from 'rxjs';
import {ActivatedRoute, Router} from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit, AfterViewInit {

  items$: Observable<Product[]>;

  constructor(
    private data: ProductsService,
    private routes: ActivatedRoute
  ) {

  }

  ngOnInit(): void {
    this.data.init('Products', 'sku');
    console.log('Inited');
    console.log(this.data.query);
  }

  ngAfterViewInit(): void {
    // this.items$ = this.data.getProducts(0);
  }

  reSort(name: string, reverse: boolean) {
    this.data.query.reserve = reverse;
    this.data.query.field = name;
    this.data.init('Products', name, reverse);
    console.log(this.data.query);

  }
}
