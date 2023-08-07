import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent }   from '../component/login/login.component';
import { DashboardComponent }   from '../component/dashboard-component/dashboard-component.component';
import { HeroesComponent }      from '../component/heroes-component/heroes-component.component';
import { HeroesDetailComponent }  from '../component/heroes-detail-component/heroes-detail-component.component';
const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'detail/:id', component: HeroesDetailComponent },
  { path: 'heroes', component: HeroesComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
