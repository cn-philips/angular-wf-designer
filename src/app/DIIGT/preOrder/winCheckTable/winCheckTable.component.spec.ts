import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { AppService } from '../../../app.service';

import { PreOrderWinCheckTableComponent } from './winCheckTable.component';

describe('ProductInfoComponent', () => {
  let component: PreOrderWinCheckTableComponent;
  let fixture: ComponentFixture<PreOrderWinCheckTableComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      providers: [ AppService ],
      declarations: [ PreOrderWinCheckTableComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PreOrderWinCheckTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
