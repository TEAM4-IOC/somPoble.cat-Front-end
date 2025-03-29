import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShowServicesComponent } from './show-services.component';

describe('ShowServicesComponent', () => {
  let component: ShowServicesComponent;
  let fixture: ComponentFixture<ShowServicesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ShowServicesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ShowServicesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
