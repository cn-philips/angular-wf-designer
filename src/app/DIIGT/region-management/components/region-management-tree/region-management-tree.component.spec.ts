import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RegionManagementTreeComponent } from './region-management-tree.component';

describe('RegionManagementTreeComponent', () => {
  let component: RegionManagementTreeComponent;
  let fixture: ComponentFixture<RegionManagementTreeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RegionManagementTreeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RegionManagementTreeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
