import { Injectable } from '@angular/core';
import { Post } from './post.model';
import { Subject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import {map} from 'rxjs/operators';
import { Router } from '@angular/router';
import {Form} from "@angular/forms";

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
          id: post._id,
          imagePath: post.imagePath
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

  addPost(title: string, content: string, image: File) {
    const postData = new FormData();
    postData.append('title', title);
    postData.append('content', content);
    postData.append('image', image, title);
    this.http.post<{message: string, post: Post}>(`${this.url}/posts`, postData).subscribe((resp) => {
        const  post: Post = {id: resp.post.id, title: title, content: content, imagePath: resp.post.imagePath};
        this.posts.push(post);
        this.postUpdated.next([...this.posts]);
        this.router.navigate(['/']);
    });

  }

  getOnePost(id: string) {
    return this.http.get<{_id: string, title: string, content: string, imagePath: string}>(`${this.url}/posts/${id}`);
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
        id: id,
        title: title,
        content: content,
        imagePath: image
      }
    }
    this.http.put(`${this.url}/posts/${id}`, postData)
    .subscribe(response => {
      const updatedPosts = [...this.posts];
      const oldPostIndex = updatedPosts.findIndex(p => p.id === id);
      const post: Post = {
        id: id,
        title: title,
        content: content,
        imagePath: ''
      }
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
