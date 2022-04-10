import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RoleManagementFilterComponent } from './role-management-filter.component';

describe('RoleManagementFilterComponent', () => {
  let component: RoleManagementFilterComponent;
  let fixture: ComponentFixture<RoleManagementFilterComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RoleManagementFilterComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RoleManagementFilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
