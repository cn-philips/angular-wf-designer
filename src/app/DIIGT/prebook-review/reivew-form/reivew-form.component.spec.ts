import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ReivewFormComponent } from './reivew-form.component';

describe('ReivewFormComponent', () => {
  let component: ReivewFormComponent;
  let fixture: ComponentFixture<ReivewFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ReivewFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReivewFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
