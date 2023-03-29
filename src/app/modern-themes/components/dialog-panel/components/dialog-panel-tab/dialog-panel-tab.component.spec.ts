import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogPanelTabComponent } from './dialog-panel-tab.component';

describe('DialogPanelTabComponent', () => {
  let component: DialogPanelTabComponent;
  let fixture: ComponentFixture<DialogPanelTabComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DialogPanelTabComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DialogPanelTabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
