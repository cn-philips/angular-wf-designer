import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EmpPucComponent } from './emp-puc.component';

describe('EmpPucComponent', () => {
  let component: EmpPucComponent;
  let fixture: ComponentFixture<EmpPucComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EmpPucComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EmpPucComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
