import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { Feedback, ContactType } from '../shared/feedback';
import { flyInOut, expand } from '../animations/app.animation';
import { FeedbackService } from '../services/feedback.service';

class FormErrors {
  firstname: string = ''
  lastname: string = ''
  telnum: string = ''
  email: string = ''
}

class ValidationMessages {
  firstname!: ValidationTypes
  lastname!: ValidationTypes
  telnum!: TelNum
  email!: Email
}

class ValidationTypes {
  required: string = ''
  minlength: string = ''
  maxlength: string = ''
}

class TelNum {
  required: string = ''
  pattern: string = ''
}

class Email {
  required: string = ''
  email: string = ''
}

@Component({
  selector: 'app-contact',
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.scss'],
  host: {
    '[@flyInOut]': 'true',
    'style': 'display: block;'
    },
    animations: [
      flyInOut(),
      expand()
    ]
})
export class ContactComponent implements OnInit {

  feedbackForm!: FormGroup;
  feedback!: Feedback | null;
  feedbackCopy!: Feedback | null;
  contactType = ContactType;
  errMsg = '';
  showForm: boolean = true;
  @ViewChild('fform') feedbackFormDirective: any;

  formErrors: FormErrors = {
    'firstname': '',
    'lastname': '',
    'telnum': '',
    'email': ''
  };

  validationMessages: ValidationMessages = {
    'firstname': {
      'required':      'First Name is required.',
      'minlength':     'First Name must be at least 2 characters long.',
      'maxlength':     'FirstName cannot be more than 25 characters long.'
    },
    'lastname': {
      'required':      'Last Name is required.',
      'minlength':     'Last Name must be at least 2 characters long.',
      'maxlength':     'Last Name cannot be more than 25 characters long.'
    },
    'telnum': {
      'required':      'Tel. number is required.',
      'pattern':       'Tel. number must contain only numbers.'
    },
    'email': {
      'required':      'Email is required.',
      'email':         'Email not in valid format.'
    },
  };

  constructor(private fb: FormBuilder, private feedbackService: FeedbackService) {
    this.createForm();
  }

  ngOnInit() {
  }

  createForm() {
    this.feedbackForm = this.fb.group({
      firstname: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(25)] ],
      lastname: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(25)] ],
      telnum: ['', [Validators.required, Validators.pattern] ],
      email: ['', [Validators.required, Validators.email] ],
      agree: false,
      contacttype: 'None',
      message: ''
    });

    this.feedbackForm.valueChanges
      .subscribe(data => this.onValueChanged(data));

    this.onValueChanged(); // (re)set validation messages now
  }

  onValueChanged(data?: any) {
    if (!this.feedbackForm) { return; }
    const form = this.feedbackForm;
    for (const field in this.formErrors) {
      if (this.formErrors.hasOwnProperty(field)) {
        // clear previous error message (if any)
        this.formErrors[field as keyof FormErrors] = '';
        const control = form.get(field);
        if (control && control.dirty && !control.valid) {
          const messages = this.validationMessages[field as keyof ValidationMessages];
          for (const key in control.errors) {
            if (control.errors.hasOwnProperty(key)) {
              this.formErrors[field as keyof FormErrors] += messages[key as keyof (ValidationTypes | TelNum | Email)] + ' ';
            }
          }
        }
      }
    }
  }
  
  onSubmit() {
    this.showForm = false;

    let feedback = this.feedbackForm.getRawValue()
    this.feedbackService.submitFeedback(feedback).subscribe({
      next: (feedback => {
        this.feedback = feedback

        setTimeout(() => {
          this.showForm = true
          this.feedback = null
        }, 5000)
      }),
      error: (errmes => {
        this.feedback = null;
        this.errMsg = <any>errmes
      })
    })

    this.feedbackForm.reset({
      firstname: '' ,
      lastname: '' ,
      telnum: '' ,
      email: '' ,
      agree: false ,
      contacttype: 'None' ,
      message: ''
    });
  }

}
