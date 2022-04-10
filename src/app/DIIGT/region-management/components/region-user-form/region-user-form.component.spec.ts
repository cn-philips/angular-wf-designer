import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RegionUserFormComponent } from './region-user-form.component';

describe('RegionUserFormComponent', () => {
  let component: RegionUserFormComponent;
  let fixture: ComponentFixture<RegionUserFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RegionUserFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RegionUserFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
