import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PreproductInfoComponent } from './preproduct-info.component';

describe('PreproductInfoComponent', () => {
  let component: PreproductInfoComponent;
  let fixture: ComponentFixture<PreproductInfoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PreproductInfoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PreproductInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
