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
  host:any=new EventEmitter();
  supportFileMissing:any=new EventEmitter();
  payment:any=new EventEmitter();
  dealerCode:any=new EventEmitter();
  dealTable:any=new EventEmitter();
  confirmTime:any=new EventEmitter();
  centralizeds:any=new EventEmitter();
  cheakItem:any=[];
  constructor() {}
}
