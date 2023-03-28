import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CarouselFormDialogComponent } from './carousel-form-dialog.component';

describe('CarouselFormDialogComponent', () => {
  let component: CarouselFormDialogComponent;
  let fixture: ComponentFixture<CarouselFormDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CarouselFormDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CarouselFormDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
