import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InconInComponent } from './incon-in.component';

describe('InconInComponent', () => {
  let component: InconInComponent;
  let fixture: ComponentFixture<InconInComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InconInComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InconInComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
