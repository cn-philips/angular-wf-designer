import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SoformComponent } from './soform.component';

describe('SoformComponent', () => {
  let component: SoformComponent;
  let fixture: ComponentFixture<SoformComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SoformComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SoformComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
