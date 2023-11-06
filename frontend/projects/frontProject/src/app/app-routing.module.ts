import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent }   from '../component/login/login.component';
import { Layout }   from '../component/layout/layout';
import { HeroesComponent }      from '../component/heroes-component/heroes-component.component';
import { HeroesDetailComponent }  from '../component/heroes-detail-component/heroes-detail-component.component';
import { ProductDetailComponent }  from '../component/product-detail/product-detail.component';
import { DashboardBackgroundComponent }  from '../component/dashboard-background/dashboard-background.component';
import { ProductDetailLayout }  from '../component/product-detail/product-detail-layout/product-detail-layout';
const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: '', component: Layout, children: [
    {
      path: 'Dashboard',
      component: DashboardBackgroundComponent,
    },
    // {
    //   path: 'productDetail',
    //   component: ProductDetailLayout,
    // },
    {
      path: 'productDetail',
      component: ProductDetailComponent,
    }
  ] },
  { path: 'detail/:id', component: HeroesDetailComponent },
  { path: 'heroes', component: HeroesComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
