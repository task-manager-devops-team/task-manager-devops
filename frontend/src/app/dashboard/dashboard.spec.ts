import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { environment } from '../../environments/environment';
import { Dashboard } from './dashboard';

describe('Dashboard', () => {
  let fixture: ComponentFixture<Dashboard>;
  let http: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Dashboard],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();
    http = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(Dashboard);
    fixture.detectChanges();
  });

  afterEach(() => http.verify());

  it('charge /stats et calcule le taux d\'avancement', () => {
    const req = http.expectOne(`${environment.apiUrl}/stats`);
    expect(req.request.method).toBe('GET');
    req.flush({
      total: 4,
      overdue: 1,
      byStatus: { TODO: 1, IN_PROGRESS: 1, DONE: 2 },
      byPriority: { LOW: 1, MEDIUM: 2, HIGH: 1 },
    });
    fixture.detectChanges();

    expect(fixture.componentInstance.rate()).toBe(50);
    expect(fixture.nativeElement.textContent).toContain('En retard');
  });

  it('affiche une erreur si /stats échoue', () => {
    http.expectOne(`${environment.apiUrl}/stats`).flush('', { status: 500, statusText: 'Error' });
    fixture.detectChanges();

    expect(fixture.componentInstance.error()).toBe(true);
  });
});