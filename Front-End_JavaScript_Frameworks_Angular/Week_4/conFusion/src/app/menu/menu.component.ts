import { Component, OnInit, Inject, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { Dish } from '../shared/dish';
import { flyInOut, expand } from '../animations/app.animation';
import { DishService } from '../services/dish.service';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss'],
  host: {
    '[@flyInOut]': 'true',
    'style': 'display: block;'
    },
    animations: [
      flyInOut(),
      expand()
    ]
})
export class MenuComponent implements OnInit {

  dishes: Dish[] | undefined;
  selectedDish!: Dish;
  BaseURL = this.baseURL;
  errMess: string = '';

  constructor(private dishService: DishService,
    @Inject('BaseURL') private baseURL: string) { }

  ngOnInit(): void {
    this.dishService.getDishes()
      .subscribe({
        next: (dishes => this.dishes = dishes),
        error: (errmess => this.errMess = errmess)
      });
  }

}
