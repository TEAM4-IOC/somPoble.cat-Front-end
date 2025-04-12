import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReservesCliComponent } from './reserves-cli.component';

describe('ReservesCliComponent', () => {
  let component: ReservesCliComponent;
  let fixture: ComponentFixture<ReservesCliComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReservesCliComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReservesCliComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
