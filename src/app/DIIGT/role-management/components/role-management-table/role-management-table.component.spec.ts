import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RoleManagementTableComponent } from './role-management-table.component';

describe('RoleManagementTableComponent', () => {
  let component: RoleManagementTableComponent;
  let fixture: ComponentFixture<RoleManagementTableComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RoleManagementTableComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RoleManagementTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
