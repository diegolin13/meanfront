import { Component, OnInit, OnDestroy } from '@angular/core';
import { Post } from '../post.model';
import { PostService } from '../post.service';
import { Subscription } from 'rxjs';
import { PageEvent } from '@angular/material/paginator';
import { AuthService } from '../../auth/auth.service';


@Component({
  selector: 'app-post-list',
  templateUrl: './post-list.component.html',
  styleUrls: ['./post-list.component.css']
})
export class PostListComponent implements OnInit, OnDestroy {

 isAuthenticated = false;
 private authListenerSubs: Subscription;
 postList: Post[] = [];
 private postSub: Subscription;
 isLoading = false;
 postPerPage = 4;
 postsNumber = 10;
 currentPage = 1;
 userId: string;


  constructor(public postService: PostService, private authService: AuthService) {
   }

  ngOnInit(): void {
   this.isLoading = true;
   this.postService.getPosts(this.postPerPage, this.currentPage);
   this.userId = this.authService.getUserId();
   console.log(this.userId);
   this.postSub = this.postService.getPostUpdatedListener()
    .subscribe((posts: Post[]) => {
      this.postList = posts;
      this.isLoading = false;
    });
   this.isAuthenticated = this.authService.getisAuth();
   this.authListenerSubs = this.authService.getAuthstatusListener().subscribe(
     isAuthenticated => { 
       this.isAuthenticated = isAuthenticated;
       this.userId = this.authService.getUserId();
      }
   );
  }

  ngOnDestroy() {
    this.postSub.unsubscribe();
    this.authListenerSubs.unsubscribe();
  }

  delete(id: string) {
    this.postService.deletePost(id);
  }

  onPageChanged(pageEvent: PageEvent) {
    this.isLoading = true;
    this.currentPage = pageEvent.pageIndex + 1;
    this.postPerPage = pageEvent.pageSize;
    this.postService.getPosts(this.postPerPage, this.currentPage);

  }
}
