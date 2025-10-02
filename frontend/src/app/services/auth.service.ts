import { Injectable } from '@angular/core';

export interface User {
  name: string;
  email: string;
  password: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly usersKey = 'registered_users';
  private readonly sessionKey = 'auth_session';

  private getUsers(): User[] {
    const users = localStorage.getItem(this.usersKey);
    return users ? JSON.parse(users) : [];
  }

  private saveUsers(users: User[]): void {
    localStorage.setItem(this.usersKey, JSON.stringify(users));
  }

  register(user: User): boolean {
    const users = this.getUsers();

    const exists = users.some(u => u.email === user.email);
    if (exists) {
      return false;
    }

    user.password = btoa(user.password)
    users.push(user);
    this.saveUsers(users);
    localStorage.setItem(this.sessionKey, JSON.stringify(user));
    return true;
  }

  update(user: User): boolean {
    let users = this.getUsers();

    const exists = users.some(u => u.email === user.email);
    if (exists) {
      user.password = btoa(user.password)
      users = users.filter(u => u.email !== user.email)
      users.push(user);
      this.saveUsers(users);
      localStorage.setItem(this.sessionKey, JSON.stringify(user));
      return true;
    }
    return false;
  }

  login(email: string, password: string): boolean {
    const users = this.getUsers();
    const user = users.find(u => u.email === email && u.password === btoa(password));

    if (user) {
      localStorage.setItem(this.sessionKey, JSON.stringify(user));
      return true;
    }

    return false;
  }

  getUser(): User | null {
    const data = localStorage.getItem(this.sessionKey);
    return data ? JSON.parse(data) : null;
  }

  isAuthenticated(): boolean {
    return !!this.getUser();
  }

  logout(): void {
    localStorage.removeItem(this.sessionKey);
  }
}
