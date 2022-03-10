import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EmpEmpAppComponent } from './emp-emp-app.component';

describe('EmpEmpAppComponent', () => {
  let component: EmpEmpAppComponent;
  let fixture: ComponentFixture<EmpEmpAppComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EmpEmpAppComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EmpEmpAppComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
