import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common'; 

@Component({
  selector: 'app-user-home',
  standalone: true,
  imports: [RouterModule, CommonModule],
  templateUrl: './user-home.component.html',
  styleUrl: './user-home.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserHomeComponent implements OnInit {
  tipoUsuario: number | null = null;

  ngOnInit(): void {
    this.checkSession();
  }

  checkSession(): void {
    const sessionData = localStorage.getItem('session');
    if (sessionData) {
      const session = JSON.parse(sessionData);
      console.log(session);
      this.tipoUsuario = session.tipoUsuario || null;
    } else {
      this.tipoUsuario = null;
    }
  }
}
