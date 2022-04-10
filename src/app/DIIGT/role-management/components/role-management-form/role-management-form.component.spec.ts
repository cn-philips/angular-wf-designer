import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RoleManagementFormComponent } from './role-management-form.component';

describe('RoleFormComponent', () => {
  let component: RoleManagementFormComponent;
  let fixture: ComponentFixture<RoleManagementFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RoleManagementFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RoleManagementFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
