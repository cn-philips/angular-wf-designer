import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ImportedInfoComponent } from './imported-info.component';

describe('ImportedInfoComponent', () => {
  let component: ImportedInfoComponent;
  let fixture: ComponentFixture<ImportedInfoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ImportedInfoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ImportedInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
