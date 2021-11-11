import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SuppfileComponent } from './suppfile.component';

describe('SuppfileComponent', () => {
  let component: SuppfileComponent;
  let fixture: ComponentFixture<SuppfileComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SuppfileComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SuppfileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
