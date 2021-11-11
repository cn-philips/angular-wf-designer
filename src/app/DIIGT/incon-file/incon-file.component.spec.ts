import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InconFileComponent } from './incon-file.component';

describe('InconFileComponent', () => {
  let component: InconFileComponent;
  let fixture: ComponentFixture<InconFileComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InconFileComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InconFileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
