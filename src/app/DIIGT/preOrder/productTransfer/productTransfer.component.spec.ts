import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { AppService } from '../../../app.service';

import { PreOrderProductTransferComponent } from './productTransfer.component';

describe('BaseInfoComponent', () => {
  let component: PreOrderProductTransferComponent;
  let fixture: ComponentFixture<PreOrderProductTransferComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      providers: [ AppService ],
      declarations: [ PreOrderProductTransferComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PreOrderProductTransferComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
