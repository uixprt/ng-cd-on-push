import {ChangeDetectionStrategy, Component, OnInit} from '@angular/core';
import {FormControl} from '@angular/forms';
import {Observable} from 'rxjs/internal/Observable';
import {UsersService, UsersState} from "./users.service";

@Component({
  selector: 'app-root',
  template: `
      <div *ngIf="viewModel$ | ngrxPush as vm" class="container">
          <div class="row my-3">
              <div class="col-6">
                  <label class="form-label">Search for Users:</label>
                  <input
                      [formControl]="searchControl"
                      class="form-control"
                      type="text"
                  />
              </div>

              <div class="col-6">
                  <label class="form-label">Number of Rows:</label>

                  <div class="btn-group d-block">
                      <button
                          *ngFor="let option of vm.pagination.sizeOptions"
                          (click)="userService.setResultsSize(option)"
                          [class.active]="option === vm.pagination.resultsSize"
                          class="btn btn-outline-primary"
                      >
                          {{ option }}
                      </button>
                  </div>
              </div>
          </div>

          <div class="table-wrapper">
              <div *ngIf="vm.loading" class="table-loader text-primary">
                  <div class="table-spinner spinner-border ">
                      <span class="visually-hidden">Loading...</span>
                  </div>
              </div>

              <div class="table-container">
                  <table class="table">
                      <thead>
                      <tr>
                          <th class="col">#</th>
                          <th class="col">First Name</th>
                          <th class="col">Last Name</th>
                          <th class="col">Email</th>
                      </tr>
                      </thead>
                      <tbody>
                      <tr *ngFor="let user of vm.users; let i = index">
                          <td>{{ i }}</td>
                          <td>{{ user.name.first }}</td>
                          <td>{{ user.name.last }}</td>
                          <td>{{ user.email }}</td>
                      </tr>
                      </tbody>
                  </table>
              </div>
          </div>
      </div>
  `,
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [UsersService],
})
export class AppComponent implements OnInit {
  searchControl: FormControl;
  viewModel$: Observable<UsersState>;

  constructor(public userService: UsersService) {
  }

  ngOnInit(): void {
    const formControl = new FormControl();
    this.userService.updateStateSearchQuery(formControl.valueChanges);
    this.searchControl = formControl;
    this.viewModel$ = this.userService.viewModel$;
  }
}
