import { Component, OnInit, OnDestroy } from '@angular/core';
import { NgForm } from '@angular/forms';
import { AuthService } from '../auth.service';
import { Subscription } from 'rxjs';


@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent implements OnInit, OnDestroy {
  isLoading = false;
  private authstatusSub: Subscription;
  constructor(private authService: AuthService) { }

  ngOnInit(): void {
    this.authstatusSub = this.authService.getAuthstatusListener().subscribe(authStatus => {
      this.isLoading = false;
    });
  }

  ngOnDestroy(): void {
    this.authstatusSub.unsubscribe();
  }

  onSignin(form: NgForm) {
    if (form.invalid) {
      return;
    }
    this.isLoading = true;
    this.authService.createUser(form.value.email, form.value.password);
  }

}
