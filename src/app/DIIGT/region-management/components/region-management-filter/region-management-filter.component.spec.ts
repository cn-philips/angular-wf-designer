import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RegionManagementFilterComponent } from './region-management-filter.component';

describe('RegionManagementFilterComponent', () => {
  let component: RegionManagementFilterComponent;
  let fixture: ComponentFixture<RegionManagementFilterComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RegionManagementFilterComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RegionManagementFilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
