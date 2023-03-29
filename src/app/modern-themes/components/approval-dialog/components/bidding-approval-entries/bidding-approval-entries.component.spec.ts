import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BiddingApprovalEntriesComponent } from './bidding-approval-entries.component';

describe('BiddingApprovalEntriesComponent', () => {
  let component: BiddingApprovalEntriesComponent;
  let fixture: ComponentFixture<BiddingApprovalEntriesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BiddingApprovalEntriesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BiddingApprovalEntriesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
