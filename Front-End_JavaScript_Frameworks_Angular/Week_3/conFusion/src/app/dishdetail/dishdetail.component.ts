import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { Params, ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { switchMap } from 'rxjs/operators';

import { Dish } from '../shared/dish';
import { DishService } from '../services/dish.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

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
  styleUrls: ['./dishdetail.component.scss']
})
export class DishdetailComponent implements OnInit {

  dish!: Dish;
  dishIds: string[] = [];
  prev: string = '';
  next: string = '';

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

  constructor(private dishservice: DishService,
    private route: ActivatedRoute,
    private location: Location, private fb: FormBuilder) { 
      this.createForm();
    }

  ngOnInit() {
    this.dishservice.getDishIds().subscribe(dishIds => this.dishIds = dishIds);
    this.route.params.pipe(switchMap((params: Params) => this.dishservice.getDish(params['id'])))
    .subscribe(dish => { this.dish = dish; this.setPrevNext(dish.id); });
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

    this.dish.comments.push(comment);

    this.authorRatingForm = this.fb.group({
      author: ['', [Validators.required, Validators.minLength(2)] ],
      comment: ['', Validators.required ],
      rating: [this.rating, Validators.required ],
    });

    this.authorRatingFormDirective.resetForm();
  }

}
