import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewsubprocesseComponent } from './viewsubprocesse.component';

describe('ViewsubprocesseComponent', () => {
  let component: ViewsubprocesseComponent;
  let fixture: ComponentFixture<ViewsubprocesseComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ViewsubprocesseComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewsubprocesseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
