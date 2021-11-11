import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ConsignOrderComponent } from './consign-order.component';

describe('ConsignOrderComponent', () => {
  let component: ConsignOrderComponent;
  let fixture: ComponentFixture<ConsignOrderComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ConsignOrderComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ConsignOrderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
