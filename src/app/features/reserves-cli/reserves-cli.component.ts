import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';


@Component({
  selector: 'app-reserves-cli',
  standalone: true,
  imports: [],
  templateUrl: './reserves-cli.component.html',
  styleUrl: './reserves-cli.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ReservesCliComponent implements OnInit {
  serviceData: any;

  constructor(private route: ActivatedRoute) { }

  ngOnInit(): void {
    // Recuperar els paràmetres de la ruta
    this.route.queryParams.subscribe(params => {
      this.serviceData = params;
      console.log('Dades del servei:', this.serviceData);
    });
  }
}
