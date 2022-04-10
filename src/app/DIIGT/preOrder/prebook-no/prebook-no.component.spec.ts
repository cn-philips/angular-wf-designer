import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PrebookNoComponent } from './prebook-no.component';

describe('PrebookNoComponent', () => {
  let component: PrebookNoComponent;
  let fixture: ComponentFixture<PrebookNoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PrebookNoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PrebookNoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
