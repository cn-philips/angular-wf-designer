import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BidCkComponent } from './bid-ck.component';

describe('BidCkComponent', () => {
  let component: BidCkComponent;
  let fixture: ComponentFixture<BidCkComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BidCkComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BidCkComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
