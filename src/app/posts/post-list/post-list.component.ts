import { Component, OnInit, OnDestroy } from '@angular/core';
import { Post } from '../post.model';
import { PostService } from '../post.service';
import { Subscription } from 'rxjs';
import { PageEvent } from '@angular/material/paginator';


@Component({
  selector: 'app-post-list',
  templateUrl: './post-list.component.html',
  styleUrls: ['./post-list.component.css']
})
export class PostListComponent implements OnInit, OnDestroy {

 postList: Post[] = [];
 private postSub: Subscription;
 isLoading = false;
 postPerPage = 2;
 postsNumber = 10;
 currentPage = 1;

  constructor(public postService: PostService) {
   }

  ngOnInit(): void {
   this.isLoading = true;
   this.postService.getPosts(this.postPerPage, this.currentPage);
   this.postSub = this.postService.getPostUpdatedListener()
    .subscribe((posts: Post[]) => {
      this.postList = posts;
      this.isLoading = false;
    });
  }

  ngOnDestroy() {
    this.postSub.unsubscribe();
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
