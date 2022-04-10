import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InoderfromComponent } from './inoderfrom.component';

describe('InoderfromComponent', () => {
  let component: InoderfromComponent;
  let fixture: ComponentFixture<InoderfromComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InoderfromComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InoderfromComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
