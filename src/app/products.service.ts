import {Injectable} from '@angular/core';
import {Product} from './Product';
import {BehaviorSubject, merge, Observable} from 'rxjs';
import {map, scan, take, tap} from 'rxjs/operators';
import {MatSnackBar} from '@angular/material';
import {AngularFirestore, AngularFirestoreCollection} from '@angular/fire/firestore';

interface QueryConfig {
  path: string;
  field: string;
  limit?: number;
  reserve?: boolean;
  prepend?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ProductsService {
  private _done = new BehaviorSubject(false);
  private _loading = new BehaviorSubject(false);
  private _data = new BehaviorSubject<Product[]>([]);
  private _cart = new BehaviorSubject<string[]>([]);
  query: QueryConfig;
  done: Observable<boolean> = this._done.asObservable();
  loading: Observable<boolean> = this._loading.asObservable();
  data: Observable<Product[]>;

  cartProducts: Product[] = [];
  cart$ = this._cart.asObservable();

  constructor(
    private snack: MatSnackBar,
    private afs: AngularFirestore
  ) {
    if (JSON.parse(localStorage.getItem('_cart')) as Product[]) {
      this.cartProducts = JSON.parse(localStorage.getItem('_cart')) as Product[];
      this.cartProducts.forEach(item => {
        this._cart.next([...this._cart.value, item.upc]);
        // this._cart.push(item.upc);
      });
    }
  }


  removeFromCart(item: Product) {
    console.log('Removed Item from _cart');
    this.cartProducts = this.cartProducts.filter(prod => {
      return prod.upc !== item.upc;
    });
    this._cart.next(this._cart.value.filter(str => {
      return str !== item.upc;
    }));
    localStorage.setItem('_cart', JSON.stringify(this.cartProducts));
  }

  async addToCart(item: Product) {
    delete item.doc;
    item.quantity = 1;
    if (!this._cart.value.includes(item.upc)) {
      this._cart.next([...this._cart.value, item.upc]);
    } else {
      this.snack.open('Already Added to Cart', '', {
        duration: 1000
      });
    }
    this.cartProducts.push(item);
    localStorage.setItem('_cart', JSON.stringify(this.cartProducts));
  }

  inCart(item: string) {
    return this._cart.value.includes(item);
  }

  getItem(id: string) {
    return this._data.value.find(val => {
      return val.upc === id;
    });
  }

  scrollHandler(event) {
    console.log(event);
    if (event === 'bottom') {
      this.more();
    }
  }

  init(path, field, opts?) {
    this.query = {
      path,
      field,
      limit: 3,
      prepend: false,
      reserve: false,
      ...opts
    };
    const first = this.afs.collection<Product>(this.query.path, ref => {
      return ref
        // .orderBy(this.query.field, this.query.reserve ? 'desc' : 'asc')
        .limit(this.query.limit);
    });
    this.mapAndUpdate(first);
    this.data = this._data.asObservable().pipe(
      scan((acc, value) => this.query.prepend ? value.concat(acc) : acc.concat(value))
    );
  }

  private mapAndUpdate(col: AngularFirestoreCollection<Product>) {
    if (this._done.value || this._loading.value) {
      return;
    }
    this._loading.next(true);
    return col.snapshotChanges().pipe(
      tap(arr => {
        let values = arr.map(snap => {
          const data = snap.payload.doc.data();
          const doc = snap.payload.doc;
          return {...data, doc};
        });
        values = this.query.prepend ? values.reverse() : values;

        // update source with new values, done loading
        this._data.next(values);
        this._loading.next(false);

        // no more values, mark done
        if (!values.length) {
          this._done.next(true);
        }
      }),
      take(1)
    ).subscribe();
  }

  // More
  more() {
    const cursor = this.getCursor();
    console.log(cursor);
    const more = this.afs.collection<Product>(this.query.path, ref => {
      return ref
        // .orderBy(this.query.field, this.query.reserve ? 'desc' : 'asc')
        .limit(this.query.limit)
        .startAfter(cursor);
    });
    this.mapAndUpdate(more);
  }

  private getCursor() {
    const current = this._data.value;
    if (current.length) {
      return this.query.prepend ? current[0].doc : current[current.length - 1].doc;
    }
    return null;
  }
}
