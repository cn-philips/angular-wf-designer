import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LabelPopupComponent } from './label-popup.component';

describe('LabelPopupComponent', () => {
  let component: LabelPopupComponent;
  let fixture: ComponentFixture<LabelPopupComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LabelPopupComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LabelPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
