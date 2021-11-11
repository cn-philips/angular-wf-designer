import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BidSuppComponent } from './bid-supp.component';

describe('BidSuppComponent', () => {
  let component: BidSuppComponent;
  let fixture: ComponentFixture<BidSuppComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BidSuppComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BidSuppComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
