import { Component, OnInit, OnDestroy } from '@angular/core';
import { Post } from '../post.model';
import { PostService } from '../post.service';
import { Subscription } from 'rxjs';


@Component({
  selector: 'app-post-list',
  templateUrl: './post-list.component.html',
  styleUrls: ['./post-list.component.css']
})
export class PostListComponent implements OnInit, OnDestroy {

 postList: Post[] = [];
 private postSub: Subscription;
 isLoading = false;

  constructor(public postService: PostService) {
   }

  ngOnInit(): void {
   this.isLoading = true;
   this.postService.getPosts();
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
}
