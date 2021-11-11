import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MyToDoTaskComponent } from './MyToDoTask.component';

describe('MyToDoTaskComponent', () => {
  let component: MyToDoTaskComponent;
  let fixture: ComponentFixture<MyToDoTaskComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MyToDoTaskComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MyToDoTaskComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
