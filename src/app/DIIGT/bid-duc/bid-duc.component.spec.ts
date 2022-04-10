import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BidDucComponent } from './bid-duc.component';

describe('BidDucComponent', () => {
  let component: BidDucComponent;
  let fixture: ComponentFixture<BidDucComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BidDucComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BidDucComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
