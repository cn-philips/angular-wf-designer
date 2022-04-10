import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WinningsuppleComponent } from './winningsupple.component';

describe('WinningsuppleComponent', () => {
  let component: WinningsuppleComponent;
  let fixture: ComponentFixture<WinningsuppleComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WinningsuppleComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WinningsuppleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
