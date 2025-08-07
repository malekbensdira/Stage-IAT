import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-file-search',
  templateUrl: './file-search.component.html',
  styleUrls: ['./file-search.component.css']
})
export class FileSearchComponent {
  searchTerm = new Subject<string>();
  results: any[] = [];
  loading = false;
  currentTerm = '';

  constructor(private http: HttpClient) {
    this.searchTerm.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap((term: string) => {
        this.currentTerm = term;
        if (!term.trim()) {
          this.results = [];
          return [];
        }
        this.loading = true;
        return this.http.get<any[]>(`http://localhost:5000/search?filename=${term}`);
      })
    ).subscribe(data => {
      this.loading = false;
      this.results = data;
    }, error => {
      this.loading = false;
      console.error('Error fetching search results', error);
      this.results = [];
    });
  }

  search(event: any) {
    this.searchTerm.next(event.target.value);
  }

  getFileTypeIcon(filename: string): string {
    const ext = filename.split('.').pop()?.toLowerCase();
    if (!ext) return '';
    if (ext === 'pdf') return 'pdf';
    if (['doc', 'docx', 'odt', 'rtf'].includes(ext)) return 'word';
    if (['xls', 'xlsx', 'csv', 'ods'].includes(ext)) return 'excel';
    if (['png', 'jpg', 'jpeg', 'gif', 'bmp', 'svg', 'webp'].includes(ext)) return 'image';
    return '';
  }

  openLocation(result: any) {
    let pathToOpen = result.type === 'directory'
      ? result.full_path
      : result.full_path.substring(0, result.full_path.lastIndexOf('\\'));
    this.http.post('http://localhost:5000/open', { path: pathToOpen }).subscribe({
      next: () => {},
      error: err => {
        alert("Erreur lors de l'ouverture du dossier.");
        console.error(err);
      }
    });
  }
}
