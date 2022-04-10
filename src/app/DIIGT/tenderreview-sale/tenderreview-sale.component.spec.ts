import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TenderreviewSaleComponent } from './tenderreview-sale.component';

describe('TenderreviewSaleComponent', () => {
  let component: TenderreviewSaleComponent;
  let fixture: ComponentFixture<TenderreviewSaleComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TenderreviewSaleComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TenderreviewSaleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
