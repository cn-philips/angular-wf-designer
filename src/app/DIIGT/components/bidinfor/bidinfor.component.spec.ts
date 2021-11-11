import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BidinforComponent } from './bidinfor.component';

describe('BidinforComponent', () => {
  let component: BidinforComponent;
  let fixture: ComponentFixture<BidinforComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BidinforComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BidinforComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
