import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EntrustComponent } from './entrust.component';

describe('EntrustComponent', () => {
  let component: EntrustComponent;
  let fixture: ComponentFixture<EntrustComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EntrustComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EntrustComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
