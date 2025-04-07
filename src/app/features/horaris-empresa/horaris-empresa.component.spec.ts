import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HorarisEmpresaComponent } from './horaris-empresa.component';

describe('HorarisEmpresaComponent', () => {
  let component: HorarisEmpresaComponent;
  let fixture: ComponentFixture<HorarisEmpresaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HorarisEmpresaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HorarisEmpresaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
