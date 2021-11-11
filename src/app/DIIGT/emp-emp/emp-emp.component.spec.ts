import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EmpEmpComponent } from './emp-emp.component';

describe('EmpEmpComponent', () => {
  let component: EmpEmpComponent;
  let fixture: ComponentFixture<EmpEmpComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EmpEmpComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EmpEmpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
