import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RoleManagementFormUserTableComponent } from './role-management-form-user-table.component';

describe('UserTableComponent', () => {
  let component: RoleManagementFormUserTableComponent;
  let fixture: ComponentFixture<RoleManagementFormUserTableComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RoleManagementFormUserTableComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RoleManagementFormUserTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
