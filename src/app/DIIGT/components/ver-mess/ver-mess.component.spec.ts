import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { VerMessComponent } from './ver-mess.component';

describe('VerMessComponent', () => {
  let component: VerMessComponent;
  let fixture: ComponentFixture<VerMessComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ VerMessComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VerMessComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
