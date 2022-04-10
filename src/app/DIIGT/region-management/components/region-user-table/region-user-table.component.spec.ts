import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RegionUserTableComponent } from './region-user-table.component';

describe('RegionUserTableComponent', () => {
  let component: RegionUserTableComponent;
  let fixture: ComponentFixture<RegionUserTableComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RegionUserTableComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RegionUserTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
