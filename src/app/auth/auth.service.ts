import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Auth } from './auth.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
 url = 'http://localhost:3000/api/user';
 private token: string;

  constructor(private http: HttpClient) { }

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
    });
  }

  getToken() {
    return this.token;
  }
}
