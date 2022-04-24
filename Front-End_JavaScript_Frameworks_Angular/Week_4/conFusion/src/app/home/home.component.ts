import { Component, Inject, OnInit } from '@angular/core';

import { Dish } from '../shared/dish';
import { DishService } from '../services/dish.service';
import { Promotion } from '../shared/promotion';
import { PromotionService } from '../services/promotion.service';
import { Leader } from '../shared/leader';
import { LeaderService } from '../services/leader.service';
import { flyInOut } from '../animations/app.animation';


@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  host: {
    '[@flyInOut]': 'true',
    'style': 'display: block;'
    },
    animations: [
      flyInOut()
    ]
})
export class HomeComponent implements OnInit {

  dish!: Dish;
  promotion!: Promotion;
  leader!: Leader;
  BaseURL = this.baseURL;
  errMsg: string = '';

  constructor(private dishservice: DishService,
    private promotionservice: PromotionService,
    private leaderService: LeaderService,
    @Inject('BaseURL') private baseURL: string) { }

  ngOnInit() {
    this.dishservice.getFeaturedDish()
      .subscribe({
        next: (dish => this.dish = dish),
        error: (errmess => this.errMsg = errmess)
      })

    this.promotionservice.getFeaturedPromotion()
      .subscribe({
        next: (promo => this.promotion = promo),
        error: (errmess => this.errMsg = errmess)
      });

    this.leaderService.getFeaturedLeader()
      .subscribe({
        next: (leader => this.leader = leader),
        error: (errmess => this.errMsg = errmess)
      });
  }

}
