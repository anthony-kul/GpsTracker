import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, tap } from 'rxjs/operators';

export interface LocationResponse {
  message?: string;
  data?: string;
  location?: string;
}

@Injectable({
  providedIn: 'root'
})
export class GpsService {
  private apiUrl = 'https://app.gpstrack.in/api/get_current_data?token=cqzFZ57r1rLz9G7YQRzn5RQtflKLum5H&email=pragasam1016@gmail.com';
  private lastLocationData: any = null;

  constructor(private http: HttpClient) { 
    const saved = localStorage.getItem('lastLocationData');
    if (saved) {
      try {
        this.lastLocationData = JSON.parse(saved);
      } catch(e) {}
    }
  }

  fetchLocation(): Observable<LocationResponse> {
    return this.http.get<any>(this.apiUrl).pipe(
      tap(data => {
        const dataObj = Array.isArray(data) ? data[0] : data;
        const lat = dataObj?.lat || dataObj?.latitude;
        const lng = dataObj?.lng || dataObj?.longitude;
        if (lat !== undefined && lng !== undefined) {
          this.lastLocationData = data;
          localStorage.setItem('lastLocationData', JSON.stringify(data));
        }
      }),
      map(data => ({
        message: 'Location fetched successfully',
        data: JSON.stringify(data)
      }))
    );
  }

  getLocation(): Observable<LocationResponse> {
    if (this.lastLocationData) {
      return of({
        location: JSON.stringify(this.lastLocationData)
      });
    } else {
      return of({
        location: ''
      });
    }
  }
}
