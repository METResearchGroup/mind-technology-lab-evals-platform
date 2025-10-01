'use client';

import { ReactNode } from 'react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, AlertCircle, DollarSign, TrendingUp } from 'lucide-react';

interface DashboardLayoutProps {
  children: ReactNode;
  metrics?: {
    overall_pass_rate: number;
    pass_rate_trend: number;
    critical_failures: number;
    cost_today: number;
    cost_budget: number;
  };
}

export function DashboardLayout({ children, metrics }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Mind and Technology Lab Evaluation Platform</h1>
              <p className="text-sm text-muted-foreground">LLM Evaluation Dashboard</p>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="outline" className="text-xs">
                DUMMY DATA
              </Badge>
            </div>
          </div>
        </div>
      </header>

      {/* Metrics Overview */}
      {metrics && (
        <div className="border-b bg-muted/50">
          <div className="container mx-auto px-4 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pass Rate</CardTitle>
                  <CheckCircle className="h-4 w-4 text-eval-success" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {(metrics.overall_pass_rate * 100).toFixed(1)}%
                  </div>
                  <p className="text-xs text-muted-foreground flex items-center">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    +{(metrics.pass_rate_trend * 100).toFixed(1)}% from last week
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Critical Failures</CardTitle>
                  <XCircle className="h-4 w-4 text-eval-error" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{metrics.critical_failures}</div>
                  <p className="text-xs text-muted-foreground">
                    Must-fix issues
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Cost Today</CardTitle>
                  <DollarSign className="h-4 w-4 text-eval-info" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">${metrics.cost_today.toFixed(2)}</div>
                  <p className="text-xs text-muted-foreground">
                    / ${metrics.cost_budget.toFixed(2)} budget
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Status</CardTitle>
                  <AlertCircle className="h-4 w-4 text-eval-warning" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">Active</div>
                  <p className="text-xs text-muted-foreground">
                    System operational
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Recent Activity</CardTitle>
                  <CheckCircle className="h-4 w-4 text-eval-success" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">3</div>
                  <p className="text-xs text-muted-foreground">
                    Runs today
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        {children}
      </main>
    </div>
  );
}

interface TabNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function TabNavigation({ activeTab, onTabChange }: TabNavigationProps) {
  return (
    <Tabs value={activeTab} onValueChange={onTabChange} className="w-full">
      <TabsList className="grid w-full grid-cols-5">
        <TabsTrigger value="evaluate">Evaluate</TabsTrigger>
        <TabsTrigger value="add-task">Add Task</TabsTrigger>
        <TabsTrigger value="view-tasks">View Tasks</TabsTrigger>
        <TabsTrigger value="add-model">Add Model</TabsTrigger>
        <TabsTrigger value="review-performance">Review Performance</TabsTrigger>
      </TabsList>
    </Tabs>
  );
}
