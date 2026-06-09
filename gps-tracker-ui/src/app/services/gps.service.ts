import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface LocationResponse {
  message?: string;
  data?: string;
  location?: string;
}

@Injectable({
  providedIn: 'root'
})
export class GpsService {
  private apiUrl = 'http://localhost:5011/api/Gps';

  constructor(private http: HttpClient) { }

  fetchLocation(): Observable<LocationResponse> {
    return this.http.post<LocationResponse>(`${this.apiUrl}/fetch-location`, {});
  }

  getLocation(): Observable<LocationResponse> {
    return this.http.get<LocationResponse>(`${this.apiUrl}/get-location`);
  }
}
