import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OrderApprovalEntriesComponent } from './order-approval-entries.component';

describe('OrderApprovalEntriesComponent', () => {
  let component: OrderApprovalEntriesComponent;
  let fixture: ComponentFixture<OrderApprovalEntriesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OrderApprovalEntriesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OrderApprovalEntriesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
