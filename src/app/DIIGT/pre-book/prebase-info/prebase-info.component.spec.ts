import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PrebaseInfoComponent } from './prebase-info.component';

describe('PrebaseInfoComponent', () => {
  let component: PrebaseInfoComponent;
  let fixture: ComponentFixture<PrebaseInfoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PrebaseInfoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PrebaseInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
