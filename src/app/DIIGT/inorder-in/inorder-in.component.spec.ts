import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InorderInComponent } from './inorder-in.component';

describe('InorderInComponent', () => {
  let component: InorderInComponent;
  let fixture: ComponentFixture<InorderInComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InorderInComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InorderInComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
