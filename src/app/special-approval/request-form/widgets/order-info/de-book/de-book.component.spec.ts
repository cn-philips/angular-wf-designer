import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DeBookComponent } from './de-book.component';

describe('DeBookComponent', () => {
  let component: DeBookComponent;
  let fixture: ComponentFixture<DeBookComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DeBookComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DeBookComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
