import { Component, EventEmitter, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss']
})
export class SearchComponent {
  public searchTerm: string = '';

  @Output()
  public searchChanged: EventEmitter<string> = new EventEmitter<string>();

  public onSearch(): void {
    this.searchChanged.emit(this.searchTerm);
  }
}
