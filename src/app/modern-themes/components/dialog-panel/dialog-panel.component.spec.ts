import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogPanelComponent } from './dialog-panel.component';

describe('DialogPanelComponent', () => {
  let component: DialogPanelComponent;
  let fixture: ComponentFixture<DialogPanelComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DialogPanelComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DialogPanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
