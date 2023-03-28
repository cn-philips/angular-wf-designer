import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SpecialApprovalEntriesComponent } from './special-approval-entries.component';

describe('SpecialApprovalEntriesComponent', () => {
  let component: SpecialApprovalEntriesComponent;
  let fixture: ComponentFixture<SpecialApprovalEntriesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SpecialApprovalEntriesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SpecialApprovalEntriesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
