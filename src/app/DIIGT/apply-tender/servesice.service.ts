import { Injectable,EventEmitter} from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class Book {
  name?: string;
  price?: number;
}
export const cheakbox=[];
export class ServesiceService {
  
  defaultBook: Book = { name:'ddd', price: 20 };
  bookEventer: any= new EventEmitter();
  recive:any=new EventEmitter();
  cheakItem:any=[];
  constructor() {
    
  }
}
