import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AnnouncementSettingComponent } from './announcement-setting.component';

describe('AnnouncementSettingComponent', () => {
  let component: AnnouncementSettingComponent;
  let fixture: ComponentFixture<AnnouncementSettingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AnnouncementSettingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AnnouncementSettingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
