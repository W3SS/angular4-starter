import { Component, OnInit } from '@angular/core';
import { User } from './user';
import { Http }  from '@angular/http';
import { HttpFallback } from '../components/http/http.fallback.service';
import { JwtHelper } from 'angular2-jwt';
import { StoreService } from '../components/storage/store.service';
import { Router } from '@angular/router';

@Component({
    selector: 'my-login',
    templateUrl: './login.component.html',
    providers: [ JwtHelper ]
})

export class LoginComponent implements OnInit {

    submitted: boolean;
    validated: boolean;
    user: User;

    constructor(
        private http: Http,
        private jwtHelper: JwtHelper,
        private storeService: StoreService,
        private httpFallback: HttpFallback,
        private router: Router) {
        this.jwtHelper = new JwtHelper();
    }

    ngOnInit() {
        console.log('login page loaded');
        this.submitted = false;
        this.validated = false;
        this.user = new User();
    }

    onSubmit() {
        this.submitted = true;

        this.http.post('/api/login', this.user, {})
            .map(res => {
                if (res.status === 404) {
                    throw new Error('bad login or password');
                    // display error front message //
                } else { return res.json(); }
            })
            .subscribe((data) => {
                let token = data.token;
                this.storeService.set('id_token', token);

                let profile = this.jwtHelper.decodeToken(token);
                this.storeService.set('profile', profile);
                this.validated = true;

                /** can we force angular state refreshing like with angular ui router ? **/
                setTimeout(() => {
                    this.router.navigate(['']).then(() => {
                        this.submitted = false;
                        window.location.reload();
                    });
                }, 1000);
            }, (err) => this.httpFallback.fallback(err));
    }

    get diagnostic() {
        return JSON.stringify(this.user);
    }
}
