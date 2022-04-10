import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ApplyRemarksComponent } from './apply-remarks.component';

describe('ApplyRemarksComponent', () => {
  let component: ApplyRemarksComponent;
  let fixture: ComponentFixture<ApplyRemarksComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ApplyRemarksComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ApplyRemarksComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
