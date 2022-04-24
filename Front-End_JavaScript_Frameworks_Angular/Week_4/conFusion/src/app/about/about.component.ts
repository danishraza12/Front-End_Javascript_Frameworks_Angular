import { Component, Inject, OnInit } from '@angular/core';

import { Leader } from '../shared/leader';
import { LeaderService } from '../services/leader.service';
import { flyInOut, expand } from '../animations/app.animation';

@Component({
  selector: 'app-about',
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.scss'],
  host: {
    '[@flyInOut]': 'true',
    'style': 'display: block;'
    },
    animations: [
      flyInOut(),
      expand()
    ]
})
export class AboutComponent implements OnInit {

  constructor(private leaderService: LeaderService, @Inject('BaseURL') private baseURL: string) { }

  leaders!: Leader[];
  BaseURL = this.baseURL;
  errMsg: string = '';

  ngOnInit(): void {
    this.leaderService.getLeaders()
      .subscribe({
        next: (leaders => this.leaders = leaders),
        error: (errmess => this.errMsg = errmess)
      });
  }

}
