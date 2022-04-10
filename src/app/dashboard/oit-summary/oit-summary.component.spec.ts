import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OitSummaryComponent } from './oit-summary.component';

describe('OitSummaryComponent', () => {
  let component: OitSummaryComponent;
  let fixture: ComponentFixture<OitSummaryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OitSummaryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OitSummaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
