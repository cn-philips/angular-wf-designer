import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BidIndexComponent } from './bid-index.component';

describe('BidIndexComponent', () => {
  let component: BidIndexComponent;
  let fixture: ComponentFixture<BidIndexComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BidIndexComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BidIndexComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
