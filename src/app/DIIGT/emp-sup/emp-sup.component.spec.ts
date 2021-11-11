import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EmpSupComponent } from './emp-sup.component';

describe('EmpSupComponent', () => {
  let component: EmpSupComponent;
  let fixture: ComponentFixture<EmpSupComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EmpSupComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EmpSupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
