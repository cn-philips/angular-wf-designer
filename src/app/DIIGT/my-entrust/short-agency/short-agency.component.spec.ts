import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ShortAgencyComponent } from './short-agency.component';

describe('ShortAgencyComponent', () => {
  let component: ShortAgencyComponent;
  let fixture: ComponentFixture<ShortAgencyComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ShortAgencyComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ShortAgencyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
