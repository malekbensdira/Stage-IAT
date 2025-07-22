import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { LoginComponent } from './login/login.component';
import { ChatbotComponent } from './chatbot/chatbot.component';
import { AdminDashboardComponent } from './admin-dashboard/admin-dashboard.component';
import { AdminUsersComponent } from './admin-users/admin-users.component';
import { MessengerComponent } from './messenger/messenger.component';
import { DemandeCreditComponent } from './demande-credit/demande-credit.component';
import { AdminDemandesComponent } from './admin-demandes/admin-demandes.component';
import { AuthGuard } from './auth.guard';
import { DemandeItComponent } from './demande-it/demande-it.component';
import { AdminItDemandesComponent } from './admin-it-demandes/admin-it-demandes.component';
import { ParametresComponent } from './parametres/parametres.component';
import { FileSearchComponent } from './file-search/file-search.component';
import { UserDashboardComponent } from './user-dashboard/user-dashboard.component';


const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'user-dashboard', component: UserDashboardComponent, canActivate: [AuthGuard] },
  { path: 'admin-dashboard', component: AdminDashboardComponent, canActivate: [AuthGuard], data: { role: 'admin' } },
  { path: 'admin-users', component: AdminUsersComponent, canActivate: [AuthGuard], data: { role: 'admin' } },
  { path: 'admin-demandes', component: AdminDemandesComponent, canActivate: [AuthGuard], data: { role: 'admin' } },
  { path: 'admin-it-demandes', component: AdminItDemandesComponent, canActivate: [AuthGuard], data: { role: 'admin' } },
  { path: 'messenger', component: MessengerComponent, canActivate: [AuthGuard] },
  { path: 'parametres', component: ParametresComponent, canActivate: [AuthGuard] },
  { path: 'demande-credit', component: DemandeCreditComponent, canActivate: [AuthGuard] },
  { path: 'demande-it', component: DemandeItComponent, canActivate: [AuthGuard] },
  { path: 'file-search', component: FileSearchComponent, canActivate: [AuthGuard] },
  { path: 'chatbot', component: ChatbotComponent, canActivate: [AuthGuard] },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
