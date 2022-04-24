import { Component, Inject, Input, OnInit, ViewChild } from '@angular/core';
import { Params, ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { switchMap } from 'rxjs/operators';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { Dish } from '../shared/dish';
import { DishService } from '../services/dish.service';
import { visibility, expand } from '../animations/app.animation';

class FormErrors {
  author: string = ''
  comment: string = ''
  rating: string = ''
}

class ValidationMessages {
  author!: ValMsg
  comment!: ValMsg
  rating!: ValMsg
}

class ValMsg {
  required: string = ''
  minlength?: string = ''
}

@Component({
  selector: 'app-dishdetail',
  templateUrl: './dishdetail.component.html',
  styleUrls: ['./dishdetail.component.scss'],
  animations: [
    visibility(),
    expand()
  ]
})
export class DishdetailComponent implements OnInit {

  dish!: Dish | null;
  dishIds: string[] = [];
  prev: string = '';
  next: string = '';
  visibility = 'shown';

  rating: number = 5;
  authorRatingForm!: FormGroup;
  @ViewChild('arform') authorRatingFormDirective: any;

  formErrors: FormErrors = {
    'author': '',
    'comment': '',
    'rating': ''
  };

  validationMessages: ValidationMessages = {
    'author': {
      'required': 'Author is required.',
      'minlength': 'Author must be at least 2 characters long.'
    },
    'comment': {
      'required': 'Comment is required.'
    },
    'rating': {
      'required': 'Rating is required.'
    }
  };

  BaseURL = this.baseURL;
  errMess: string = '';
  dishcopy!: Dish | null;

  constructor(private dishService: DishService,
    private route: ActivatedRoute,
    private location: Location, private fb: FormBuilder, @Inject('BaseURL') private baseURL: string) { 
      this.createForm();
    }

  ngOnInit() {
    this.dishService.getDishIds().subscribe(dishIds => this.dishIds = dishIds);

    this.route.params
      .pipe(switchMap((params: Params) => { 
        this.visibility = 'hidden'; 
        return this.dishService.getDish(+params['id']); 
      }))
      .subscribe({
        next: (dish: Dish) => { 
          this.dish = dish
          this.dishcopy = dish
          this.setPrevNext(dish.id)
          this.visibility = 'shown'
        },
        error: (errmess => this.errMess = <any>errmess )
      })
  }
  
  setPrevNext(dishId: string) {
    const index = this.dishIds.indexOf(dishId);
    this.prev = this.dishIds[(this.dishIds.length + index - 1) % this.dishIds.length];
    this.next = this.dishIds[(this.dishIds.length + index + 1) % this.dishIds.length];
  }

  goBack(): void {
    this.location.back();
  }

  createForm() {
    this.authorRatingForm = this.fb.group({
      author: ['', [Validators.required, Validators.minLength(2)] ],
      comment: ['', Validators.required ],
      rating: [this.rating, Validators.required ],
    });

    this.authorRatingForm.valueChanges
      .subscribe(data => this.onValueChanged(data));

    this.onValueChanged(); // (re)set validation messages now
  }

  onValueChanged(data?: any) {
    if (!this.authorRatingForm) { return; }
    const form = this.authorRatingForm;
    for (const field in this.formErrors) {
      if (this.formErrors.hasOwnProperty(field)) {
        // clear previous error message (if any)
        this.formErrors[field as keyof FormErrors] = '';
        const control = form.get(field);
        if (control && control.dirty && !control.valid) {
          const messages = this.validationMessages[field as keyof ValidationMessages];
          for (const key in control.errors) {
            if (control.errors.hasOwnProperty(key)) {
              this.formErrors[field as keyof FormErrors] += messages[key as keyof (string | number | symbol)] + ' ';
            }
          }
        }
      }
    }
  }

  onSubmit() {
    let dateVal = new Date();

    let comment = { 
      author: this.authorRatingForm.value.author,
      comment: this.authorRatingForm.value.comment,
      rating: this.authorRatingForm.value.rating,
      date: dateVal.toDateString(),
    }

    // this.dish?.comments?.push(comment);
    this.dishcopy?.comments?.push(comment);

    this.dishService.putDish(this.dishcopy!)
      .subscribe({
        next: (dish => {
          this.dish = dish; 
          this.dishcopy = dish;
        }),
        error: (errmess => { 
          this.dish = null; 
          this.dishcopy = null; 
          this.errMess = <any>errmess; 
        })
      })
      
    this.authorRatingForm = this.fb.group({
      author: ['', [Validators.required, Validators.minLength(2)] ],
      comment: ['', Validators.required ],
      rating: [this.rating, Validators.required ],
    });

    this.authorRatingFormDirective.resetForm();
  }

}
