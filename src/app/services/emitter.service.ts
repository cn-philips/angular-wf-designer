
import {Injectable, EventEmitter, OnInit} from "@angular/core";
  @Injectable({
    providedIn: 'root'
  })
  
  export class EmitterService implements OnInit {

      private _currentRequest : any = {};
      public eventEmit: any;
  
      constructor() {
          this.eventEmit = new EventEmitter();
      }
  
      ngOnInit() {
  
      }

      public get currentRequest():any{
        return this._currentRequest;
      }

      public set currentRequest( value: any ) {
        this._currentRequest = value;
      }
  
  }