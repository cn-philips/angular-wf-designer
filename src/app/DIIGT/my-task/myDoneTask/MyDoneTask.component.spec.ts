import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MyDoneTaskComponent } from './MyDoneTask.component';

describe('MyDoneTaskComponent', () => {
  let component: MyDoneTaskComponent;
  let fixture: ComponentFixture<MyDoneTaskComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MyDoneTaskComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MyDoneTaskComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
