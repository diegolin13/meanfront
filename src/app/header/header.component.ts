import { Component, OnInit, OnDestroy } from '@angular/core';
import { AuthService } from '../auth/auth.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit, OnDestroy {
  private authListenerSubs: Subscription;
  isAuthenticated = false;

  constructor(private authService: AuthService) { }

  ngOnInit(): void {
    this.authListenerSubs = this.authService.getAuthstatusListener().subscribe(isAuthenticated => {
      this.isAuthenticated = isAuthenticated;
    });
  }

  ngOnDestroy(): void {
    this.authListenerSubs.unsubscribe();
  }

}
