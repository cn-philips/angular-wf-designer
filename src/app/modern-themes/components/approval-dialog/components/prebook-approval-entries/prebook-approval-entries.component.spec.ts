import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PrebookApprovalEntriesComponent } from './prebook-approval-entries.component';

describe('PrebookApprovalEntriesComponent', () => {
  let component: PrebookApprovalEntriesComponent;
  let fixture: ComponentFixture<PrebookApprovalEntriesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PrebookApprovalEntriesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PrebookApprovalEntriesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
