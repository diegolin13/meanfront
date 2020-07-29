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

  getPosts() {
    // return [...this.posts];
    this.http.get<{message: string, posts: any}>(`${this.url}/posts`)
    .pipe(map((postData)=> {
      return postData.posts.map(post => {
        return {
          title: post.title,
          content: post.content,
          id: post._id
        }
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

  addPost(title: string, content: string) {
    const post: Post = {id: null, title, content};
    this.http.post<{message: string, postId: string}>(`${this.url}/posts`, post).subscribe((resp) => {
        const id = resp.postId;
        post.id = id;
        this.posts.push(post);
        this.postUpdated.next([...this.posts]);
        this.router.navigate(['/']);
    });

  }

  getOnePost(id: string) {
    return this.http.get<{_id: string, title: string, content: string}>(`${this.url}/posts/${id}`);
  }

  updatePost(id: string, title: string, content: string) {
    const post: Post = {id: id, title: title, content: content};
    this.http.put(`${this.url}/posts/${id}`, post)
    .subscribe(response => {
      const updatedPosts = [...this.posts];
      const oldPostIndex = updatedPosts.findIndex(p => p.id === post.id);
      updatedPosts[oldPostIndex] = post;
      this.posts = updatedPosts;
      this.postUpdated.next([...this.posts]);
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
