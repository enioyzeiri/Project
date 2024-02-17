import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { SignUpComponent } from './components/sign-up/sign-up.component';
import { LogInComponent } from './components/log-in/log-in.component';
import { DashboardComponent } from './components/lista-e-menuve/dashboard/dashboard.component';
import { KlientComponent } from './components/lista-e-menuve/klient/klient.component';
import { DokumentaComponent } from './components/lista-e-menuve/dokumenta/dokumenta.component';
import { HarteComponent } from './components/lista-e-menuve/harte/harte.component';

const routes: Routes = [
  { path: '', component: SignUpComponent },
  { path: 'log-in', component: LogInComponent },
  { path: 'dashboard', component: DashboardComponent},
  { path: 'klient', component: KlientComponent},
  { path: 'dokumenta', component: DokumentaComponent},
  { path: 'harte', component: HarteComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
