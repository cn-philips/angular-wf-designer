import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InconComponent } from './incon.component';

describe('InconComponent', () => {
  let component: InconComponent;
  let fixture: ComponentFixture<InconComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InconComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InconComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
