import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Auth } from './auth.model';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
 url = 'http://localhost:3000/api/user';
 private token: string;
 private authStatusListener = new Subject<boolean>();
 private isAuthenticated = false;

  constructor(private http: HttpClient) { }

  getAuthstatusListener() {
    return this.authStatusListener.asObservable();
  }

  createUser(email: string, password: string) {
    const user: Auth = {
      email,
      password
    };
    this.http.post(`${this.url}/signup`, user).subscribe(res => {
      console.log(res);
    });
  }

  login(email: string, password: string) {
    const user: Auth = {
      email,
      password
    };
    this.http.post<{token: string}>(`${this.url}/login`, user).subscribe(res => {
      const token = res.token;
      this.token = token;
      if (token) {
        this.isAuthenticated = true;
        this.authStatusListener.next(true);
      }

    });
  }

  getisAuth() {
    return this.isAuthenticated;
  }

  getToken() {
    return this.token;
  }
}
