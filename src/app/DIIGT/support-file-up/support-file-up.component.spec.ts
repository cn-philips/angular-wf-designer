import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SupportFileUpComponent } from './support-file-up.component';

describe('SupportFileUpComponent', () => {
  let component: SupportFileUpComponent;
  let fixture: ComponentFixture<SupportFileUpComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SupportFileUpComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SupportFileUpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
