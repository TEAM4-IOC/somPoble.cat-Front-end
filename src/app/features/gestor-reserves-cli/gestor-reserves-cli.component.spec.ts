import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GestorReservesCliComponent } from './gestor-reserves-cli.component';

describe('GestorReservesCliComponent', () => {
  let component: GestorReservesCliComponent;
  let fixture: ComponentFixture<GestorReservesCliComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GestorReservesCliComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GestorReservesCliComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
