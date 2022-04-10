import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ApproveChangeComponent } from './approve-change.component';

describe('ApproveChangeComponent', () => {
  let component: ApproveChangeComponent;
  let fixture: ComponentFixture<ApproveChangeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ApproveChangeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ApproveChangeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
