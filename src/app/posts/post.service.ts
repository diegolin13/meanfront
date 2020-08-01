import { Injectable } from '@angular/core';
import { Post } from './post.model';
import { Subject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import {map} from 'rxjs/operators';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class PostService {
  private posts: Post[] = [];
  private postUpdated = new Subject<Post[]>();
  constructor(private http: HttpClient, private router: Router) { }
  url = 'http://localhost:3000/api';

  getPosts(postPerPAge: number, currentPage: number) {
    const queryParams = `?pagesize=${postPerPAge}&page=${currentPage}`;
    this.http.get<{message: string, posts: any}>(`${this.url}/posts${queryParams}`)
    .pipe(map((postData) => {
      return postData.posts.map(post => {
        return {
          title: post.title,
          content: post.content,
          id: post._id,
          imagePath: post.imagePath,
          creator: post.creator
        };
      });
    }))
    .subscribe((postsTransformed) => {
      this.posts = postsTransformed;
      this.postUpdated.next([...this.posts]);
    });

  }

  getPostUpdatedListener(){
    return this.postUpdated.asObservable();
  }

  addPost(title: string, content: string, image: File) {
    const postData = new FormData();
    postData.append('title', title);
    postData.append('content', content);
    postData.append('image', image, title);
    this.http.post<{message: string, post: Post}>(`${this.url}/posts`, postData).subscribe((resp) => {
        this.router.navigate(['/']);
    });

  }

  getOnePost(id: string) {
    return this.http.get<{_id: string, title: string, content: string, imagePath: string, creator: string}>(`${this.url}/posts/${id}`);
  }

  updatePost(id: string, title: string, content: string, image: File | string) {
    let postData: Post | FormData
    if (typeof (image) === 'object') {
      postData = new FormData();
      postData.append('id', id);
      postData.append('title', title);
      postData.append('content', content);
      postData.append('image', image, title);

    } else {
        postData = {
        id,
        title,
        content,
        imagePath: image,
        creator: null
      }
    }
    this.http.put(`${this.url}/posts/${id}`, postData)
    .subscribe(response => {
      this.router.navigate(['/']);
    });
  }

  deletePost(postId: string) {
    this.http.delete(`${this.url}/posts/${postId}`).subscribe(() => {
        const updatedPosts = this.posts.filter(
        post => post.id !== postId);
        this.posts = updatedPosts;
        this.postUpdated.next([...this.posts]);
    });
  }
}
