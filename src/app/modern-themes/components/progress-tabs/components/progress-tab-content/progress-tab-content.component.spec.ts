import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProgressTabContentComponent } from './progress-tab-content.component';

describe('ProgressTabContentComponent', () => {
  let component: ProgressTabContentComponent;
  let fixture: ComponentFixture<ProgressTabContentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProgressTabContentComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProgressTabContentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
