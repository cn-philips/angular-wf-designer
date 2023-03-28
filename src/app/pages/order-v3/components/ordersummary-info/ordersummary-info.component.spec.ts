import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OrdersummaryInfoComponent } from './ordersummary-info.component';

describe('OrdersummaryInfoComponent', () => {
  let component: OrdersummaryInfoComponent;
  let fixture: ComponentFixture<OrdersummaryInfoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OrdersummaryInfoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OrdersummaryInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
