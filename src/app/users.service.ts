import { Injectable } from '@angular/core';
import { ComponentStore } from '@ngrx/component-store';
import { combineLatest, Observable } from 'rxjs';
import {
  debounceTime,
  distinctUntilChanged,
  map,
  shareReplay,
  switchMap,
  tap,
} from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import produce from 'immer';

interface User {
  name: {
    first: string;
    last: string;
  };
  email: string;
}

export interface UsersState {
  users: Array<User>;
  loading: boolean;
  searchQuery: string;
  pagination: {
    sizeOptions: Array<number>;
    resultsSize: number;
  };
}

let _state: UsersState = {
  users: [],
  loading: false,
  searchQuery: '',
  pagination: {
    sizeOptions: [5, 10, 50],
    resultsSize: 5,
  },
};

@Injectable()
export class UsersService extends ComponentStore<UsersState> {
  private searchQuery$ = this.select((state) => state.searchQuery);
  private pagination$ = this.select((state) => state.pagination);

  viewModel$: Observable<UsersState> = combineLatest([
    this.select((state) => state.users),
    this.select((state) => state.loading),
    this.searchQuery$,
    this.pagination$,
  ]).pipe(
    map(([users, loading, searchQuery, pagination]) => ({
      users,
      loading,
      searchQuery,
      pagination,
    })),
  );

  constructor(private httpClient: HttpClient) {
    super(_state);
    combineLatest([this.searchQuery$, this.pagination$])
      .pipe(
        switchMap(([searchQuery, pagination]) =>
          this.loadUsers(searchQuery, pagination.resultsSize),
        ),
      )
      .subscribe((users) => {
        this.patchState({ users: users, loading: false });
      });
  }

  loadUsers(searchQuery: string, resultsSize: number) {
    return this.httpClient
      .get(
        `https://randomuser.me/api/?results=${resultsSize}&seed=${searchQuery}`,
      )
      .pipe(
        map((response: any) => response.results),
        shareReplay({ refCount: true, bufferSize: 1 }),
      );
  }

  setResultsSize(size: number) {
    this.patchState((state) => ({
      pagination: produce(state.pagination, (draft) => {
        draft.resultsSize = size;
      }),
      loading: true,
    }));
  }

  updateStateSearchQuery = this.effect((value$: Observable<string>) => {
    return value$.pipe(
      debounceTime(400),
      distinctUntilChanged(),
      tap((value) =>
        this.patchState({
          searchQuery: value,
          loading: true,
        }),
      ),
    );
  });
}
