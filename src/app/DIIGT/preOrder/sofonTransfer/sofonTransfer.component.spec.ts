import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { AppService } from '../../../app.service';

import { PreOrderSofonTransferComponent } from './sofonTransfer.component';

describe('BaseInfoComponent', () => {
  let component: PreOrderSofonTransferComponent;
  let fixture: ComponentFixture<PreOrderSofonTransferComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      providers: [ AppService ],
      declarations: [ PreOrderSofonTransferComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PreOrderSofonTransferComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
