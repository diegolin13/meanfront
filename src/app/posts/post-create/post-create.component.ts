import { Component, OnInit, OnDestroy} from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { PostService } from '../post.service';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { Post } from '../post.model';
import { mimeType } from './mime-type.validator';
import { Subscription } from 'rxjs';
import { AuthService } from '../../auth/auth.service';

@Component({
  selector: 'app-post-create',
  templateUrl: './post-create.component.html',
  styleUrls: ['./post-create.component.css']
})
export class PostCreateComponent implements OnInit, OnDestroy {
  post: Post;
  isLoading = false;
  form: FormGroup;
  imagePreview: string;
  private mode = 'create';
  private postId: string;
  private authStatusSub: Subscription;

  constructor(public postService: PostService, public activatedRoute: ActivatedRoute, private authService: AuthService) { }

  ngOnInit(): void {
    this.authStatusSub = this.authService.getAuthstatusListener().subscribe(authStatus => {
      this.isLoading = false;
    });
    this.form = new FormGroup({
      title: new FormControl(null, [Validators.required, Validators.minLength(3)]),
      content: new FormControl(null, [Validators.required]),
      image: new FormControl(null, [Validators.required], [mimeType]),
      creator: new FormControl(null)
    });
    this.activatedRoute.paramMap.subscribe((paramMap: ParamMap) => {
        if (paramMap.has('postId')) {
            this.mode = 'edit';
            this.postId = paramMap.get('postId');
            this.isLoading = true;
            this.postService.getOnePost(this.postId).subscribe((postData: any) => {
              this.isLoading = false;
              this.post = {id: postData.post._id, title: postData.post.title, content: postData.post.content, imagePath: postData.post.imagePath, creator: postData.post.creator};
              this.form.setValue({
                title: postData.post.title,
                content: postData.post.content,
                image: postData.post.imagePath,
                creator: postData.post.creator,
              });
            });
        } else {
          this.mode = 'create';
          this.postId = null;
        }
    });
  }
  onSavePost(): void{
   if (this.form.invalid){
      return;
    }
   this.isLoading = true;
   if (this.mode === 'create') {
      this.postService.addPost(this.form.value.title, this.form.value.content, this.form.value.image );
    }
    else {
      this.postService.updatePost(this.postId, this.form.value.title, this.form.value.content, this.form.value.image );
    }
   this.form.reset();
  }

  // tslint:disable-next-line: typedef
  onImpagePicked(event) {
    const file = (event.target as HTMLInputElement).files[0];
    this.form.patchValue({image: file});
    this.form.get('image').updateValueAndValidity();
    console.log(file);
    console.log(this.form);
    const reader = new FileReader();
    reader.onload = () => {
      this.imagePreview = reader.result as string;
    };
    reader.readAsDataURL(file);
  }
  ngOnDestroy() {
    this.authStatusSub.unsubscribe();
  }

}
