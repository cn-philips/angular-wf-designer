import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OitRealtimeComponent } from './oit-realtime.component';

describe('OitRealtimeComponent', () => {
  let component: OitRealtimeComponent;
  let fixture: ComponentFixture<OitRealtimeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OitRealtimeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OitRealtimeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
