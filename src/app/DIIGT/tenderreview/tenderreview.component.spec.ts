import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TenderreviewComponent } from './tenderreview.component';

describe('TenderreviewComponent', () => {
  let component: TenderreviewComponent;
  let fixture: ComponentFixture<TenderreviewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TenderreviewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TenderreviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
