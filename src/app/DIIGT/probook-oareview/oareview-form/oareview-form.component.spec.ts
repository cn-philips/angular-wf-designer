import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OareviewFormComponent } from './oareview-form.component';

describe('OareviewFormComponent', () => {
  let component: OareviewFormComponent;
  let fixture: ComponentFixture<OareviewFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OareviewFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OareviewFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
