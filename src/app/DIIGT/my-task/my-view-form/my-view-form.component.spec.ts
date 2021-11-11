import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MyViewFormComponent } from './my-view-form.component';

describe('MyViewFormComponent', () => {
  let component: MyViewFormComponent;
  let fixture: ComponentFixture<MyViewFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MyViewFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MyViewFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
