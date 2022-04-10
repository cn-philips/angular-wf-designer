import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PrebookReviewComponent } from './prebook-review.component';

describe('ProbookReviewComponent', () => {
  let component: PrebookReviewComponent;
  let fixture: ComponentFixture<PrebookReviewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PrebookReviewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PrebookReviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
