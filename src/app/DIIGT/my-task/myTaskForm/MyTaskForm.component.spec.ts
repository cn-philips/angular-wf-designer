import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MyTaskFormComponent } from './MyTaskForm.component';

describe('MyTaskFormComponent', () => {
  let component: MyTaskFormComponent;
  let fixture: ComponentFixture<MyTaskFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MyTaskFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MyTaskFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
