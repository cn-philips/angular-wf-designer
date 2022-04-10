import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { IGTMyTaskComponent } from './MyTask.component';

describe('IGTMyTaskComponent', () => {
  let component: IGTMyTaskComponent;
  let fixture: ComponentFixture<IGTMyTaskComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ IGTMyTaskComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(IGTMyTaskComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
