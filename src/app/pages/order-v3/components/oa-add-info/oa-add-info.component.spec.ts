import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OaAddInfoComponent } from './oa-add-info.component';

describe('OaAddInfoComponent', () => {
  let component: OaAddInfoComponent;
  let fixture: ComponentFixture<OaAddInfoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OaAddInfoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OaAddInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
