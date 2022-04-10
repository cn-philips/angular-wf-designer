import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WinningbaseComponent } from './winningbase.component';

describe('WinningbaseComponent', () => {
  let component: WinningbaseComponent;
  let fixture: ComponentFixture<WinningbaseComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WinningbaseComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WinningbaseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
