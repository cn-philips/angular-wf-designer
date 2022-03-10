import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ChangeSceneComponent } from './change-scene.component';

describe('ChangeSceneComponent', () => {
  let component: ChangeSceneComponent;
  let fixture: ComponentFixture<ChangeSceneComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ChangeSceneComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ChangeSceneComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
