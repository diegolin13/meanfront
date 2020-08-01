import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Auth } from './auth.model';
import { Subject } from 'rxjs';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
 url = 'http://localhost:3000/api/user';
 private token: string;
 private authStatusListener = new Subject<boolean>();
 private isAuthenticated = false;
 private tokenTimer: NodeJS.Timer;
 userId: string;

  constructor(private http: HttpClient, private router: Router) { }

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
    this.http.post<{token: string, expiresIn: number, userId: string}>(`${this.url}/login`, user).subscribe(res => {
      const token = res.token;
      this.token = token;
      if (token) {
        const tokenDuration = res.expiresIn;
        this.userId = res.userId;
        this.setAuthTimer(tokenDuration);
        this.isAuthenticated = true;
        this.authStatusListener.next(true);
        const now = new Date();
        const expirationDate = new Date(now.getTime() + tokenDuration * 1000);
        this.saveAuthData(token, expirationDate, this.userId);
        this.router.navigate(['/']);
      }

    });
  }

  getUserId() {
    return this.userId;
  }

  private saveAuthData (token: string, expirationDate: Date, userId: string) {
    localStorage.setItem('token', token);
    localStorage.setItem('expiration', expirationDate.toISOString());
    localStorage.setItem('userId', userId);
  }

  private clearAuthData() {
    localStorage.removeItem('token');
    localStorage.removeItem('expiration');
    localStorage.removeItem('userId');
  }

  getisAuth() {
    return this.isAuthenticated;
  }

  getToken() {
    return this.token;
  }

  logout() {
    this.token = null;
    this.isAuthenticated = false;
    this.authStatusListener.next(false);
    this.userId = null;
    clearTimeout(this.tokenTimer);
    this.clearAuthData();
    this.router.navigate(['/login']);

  }

  private getAuthData () {
    const token = localStorage.getItem('token');
    const expirationDate = localStorage.getItem('expiration');
    const userId = localStorage.getItem('userId');

    if (!token || !expirationDate) {
      return;
    }
    return {
      token,
      expirationDate: new Date(expirationDate),
      userId
    };
  }

  private setAuthTimer(tokenDuration: number) {
    console.log('Setting timer', tokenDuration);
    this.tokenTimer = setTimeout(() => {
      this.logout();
    }, tokenDuration * 1000);
  }

  autoAuthUser() {
    const authInfo = this.getAuthData();
    if (!authInfo) {
      return;
    }
    const now = new Date();
    const expiresIn = authInfo.expirationDate.getTime() - now.getTime();
    if (expiresIn > 0) {
      this.token = authInfo.token;
      this.userId = authInfo.userId;
      this.isAuthenticated = true;
      this.setAuthTimer(expiresIn / 1000);
      this.authStatusListener.next(true);
    }
  }
}
