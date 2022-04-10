import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BusinessInfoAreaComponent } from './business-info-area.component';

describe('BusinessInfoAreaComponent', () => {
  let component: BusinessInfoAreaComponent;
  let fixture: ComponentFixture<BusinessInfoAreaComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BusinessInfoAreaComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BusinessInfoAreaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
