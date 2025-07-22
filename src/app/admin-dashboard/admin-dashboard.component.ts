import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from '../user.service';
import { ChartConfiguration, ChartType } from 'chart.js';

@Component({
  selector: 'app-admin-dashboard',
  template: `
    <div class="admin-dashboard-wrapper">
      <div class="admin-header">
        <h2>Dashboard Administrateur</h2>
        <button class="logout-btn" (click)="logout()">Déconnexion</button>
      </div>
      <div class="stats-section">
        <div class="stat-card">
          <h3>Utilisateurs</h3>
          <p class="stat-value">{{ userCount }}</p>
        </div>
        <div class="stat-card">
          <h3>Messages</h3>
          <p class="stat-value">{{ messageCount }}</p>
        </div>
        <div class="stat-card">
          <h3>Admins</h3>
          <p class="stat-value">{{ adminCount }}</p>
        </div>
      </div>
      <div class="chart-section">
        <h3>Statistiques d'activité</h3>
        <div style="background:#fff; border-radius:8px; padding:16px;">
          <canvas baseChart
            [data]="barChartData"
            [type]="barChartType"
            [options]="barChartOptions">
          </canvas>
        </div>
      </div>
      <app-chatbot></app-chatbot>
    </div>
  `,
  styles: [`
    .admin-dashboard-wrapper {
      max-width: 900px;
      margin: 40px auto;
      padding: 32px 24px;
      background: #fff;
      border-radius: 16px;
      box-shadow: 0 2px 16px #b3c6e0;
    }
    .admin-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 32px;
    }
    .logout-btn {
      background: #d32f2f;
      color: #fff;
      border: none;
      border-radius: 4px;
      padding: 10px 24px;
      font-size: 16px;
      cursor: pointer;
      transition: background 0.2s;
    }
    .logout-btn:hover {
      background: #b71c1c;
    }
    .stats-section {
      display: flex;
      gap: 24px;
      margin-bottom: 40px;
      justify-content: center;
      flex-wrap: wrap;
    }
    .stat-card {
      background: #f4f6fb;
      border-radius: 10px;
      box-shadow: 0 1px 6px #e0e7ef;
      padding: 28px 36px;
      min-width: 180px;
      text-align: center;
      flex: 1 1 180px;
    }
    .stat-card h3 {
      color: #1976d2;
      margin-bottom: 10px;
      font-size: 20px;
    }
    .stat-value {
      font-size: 32px;
      font-weight: bold;
      color: #222;
    }
    .chart-section {
      margin-top: 32px;
      background: #f4f6fb;
      border-radius: 10px;
      padding: 24px 16px;
      box-shadow: 0 1px 6px #e0e7ef;
    }
    .chart-section h3 {
      color: #1976d2;
      margin-bottom: 18px;
      font-size: 20px;
      text-align: center;
    }
    .chart-placeholder {
      height: 260px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #fff;
      border-radius: 8px;
      box-shadow: 0 1px 4px #e0e7ef;
      color: #b3c6e0;
      font-size: 22px;
      font-style: italic;
    }
    @media (max-width: 900px) {
      .admin-dashboard-wrapper {
        padding: 12px 2vw;
      }
      .stats-section {
        flex-direction: column;
        gap: 16px;
      }
      .stat-card {
        min-width: 0;
        padding: 18px 10px;
      }
    }
  `]
})
export class AdminDashboardComponent implements OnInit {
  userCount = 0;
  messageCount = 0;
  adminCount = 0;

  // Chart.js
  barChartType: ChartType = 'bar';
  barChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    plugins: {
      legend: { display: false },
      title: { display: false }
    }
  };
  barChartData = {
    labels: ['Utilisateurs', 'Messages', 'Admins'],
    datasets: [
      { data: [0, 0, 0], label: 'Statistiques', backgroundColor: ['#1976d2', '#388e3c', '#d32f2f'] }
    ]
  };

  constructor(private userService: UserService, private router: Router) {}

  ngOnInit() {
    this.userService.getUserCount().subscribe(
      res => {
        this.userCount = res.count;
        this.updateChart();
      },
      error => {
        console.error('Erreur lors de la récupération du nombre d\'utilisateurs:', error);
        this.userCount = 0;
        this.updateChart();
      }
    );
    this.userService.getMessageCount().subscribe(
      res => {
        this.messageCount = res.count;
        this.updateChart();
      },
      error => {
        console.error('Erreur lors de la récupération du nombre de messages:', error);
        this.messageCount = 0;
        this.updateChart();
      }
    );
    this.userService.getAdminCount().subscribe(
      res => {
        this.adminCount = res.count;
        this.updateChart();
      },
      error => {
        console.error('Erreur lors de la récupération du nombre d\'admins:', error);
        this.adminCount = 0;
        this.updateChart();
      }
    );
  }

  updateChart() {
    this.barChartData = {
      ...this.barChartData,
      datasets: [
        { ...this.barChartData.datasets[0], data: [this.userCount, this.messageCount, this.adminCount] }
      ]
    };
  }

  logout() {
    this.userService.logout();
    this.router.navigate(['/']);
  }
}
