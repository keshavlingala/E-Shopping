import {Component, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {ProductsService} from '../products.service';
import {Product} from '../Product';
import {Subscription} from 'rxjs';

@Component({
  selector: 'app-item-desc',
  templateUrl: './item-desc.component.html',
  styleUrls: ['./item-desc.component.scss']
})
export class ItemDescComponent implements OnInit, OnDestroy {
  currItem: Product = null;
  subscrip: Subscription;

  constructor(
    private route: ActivatedRoute,
    private data: ProductsService
  ) {
  }


  ngOnInit() {
    this.subscrip = this.route.params.subscribe(param => {
      console.log(param.id);
      this.currItem = this.data.getItem(param.id);
      console.log(this.currItem);
    });

  }

  ngOnDestroy(): void {
    this.subscrip.unsubscribe();
  }
}
