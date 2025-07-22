import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { NgChartsModule } from 'ng2-charts';

import { AppComponent } from './app.component';
import { LoginComponent } from './login/login.component';
import { ChatbotComponent } from './chatbot/chatbot.component';
import { AdminDashboardComponent } from './admin-dashboard/admin-dashboard.component';
import { AdminUsersComponent } from './admin-users/admin-users.component';
import { MessengerComponent } from './messenger/messenger.component';
import { PrivateChatComponent } from './private-chat/private-chat.component';
import { DemandeCreditComponent } from './demande-credit/demande-credit.component';
import { AdminDemandesComponent } from './admin-demandes/admin-demandes.component';
import { AppRoutingModule } from './app-routing.module';
import { AuthInterceptor } from './auth.interceptor';
import { DemandeItComponent } from './demande-it/demande-it.component';
import { AdminItDemandesComponent } from './admin-it-demandes/admin-it-demandes.component';
import { ParametresComponent } from './parametres/parametres.component';
import { FileSearchComponent } from './file-search/file-search.component';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    ChatbotComponent,
    AdminDashboardComponent,
    AdminUsersComponent,
    MessengerComponent,
    PrivateChatComponent,
    DemandeCreditComponent,
    AdminDemandesComponent,
    DemandeItComponent,
    AdminItDemandesComponent,
    ParametresComponent,
    FileSearchComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpClientModule,
    NgChartsModule,
    AppRoutingModule
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true }
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
