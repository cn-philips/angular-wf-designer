import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EmpInComponent } from './emp-in.component';

describe('EmpInComponent', () => {
  let component: EmpInComponent;
  let fixture: ComponentFixture<EmpInComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EmpInComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EmpInComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
