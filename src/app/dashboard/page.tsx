'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import Link from 'next/link';
import { Upload, FileText, TrendingUp, LogOut, User } from 'lucide-react';

interface UserData {
  id: string;
  email: string;
  name: string;
  subscriptionPlan: string;
  scansUsedThisMonth: number;
  scansResetDate: string;
}

interface ResumeData {
  id: string;
  fileName: string;
  createdAt: string;
  _count: {
    atsScores: number;
  };
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserData | null>(null);
  const [resumes, setResumes] = useState<ResumeData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserData();
    loadResumes();
  }, []);

  const loadUserData = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        router.push('/auth/login');
        return;
      }

      const response = await fetch('/api/user/me', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to load user data');
      }

      const data = await response.json();
      setUser(data.user);
    } catch (error) {
      console.error('Error loading user:', error);
      router.push('/auth/login');
    }
  };

  const loadResumes = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch('/api/resume', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setResumes(data.resumes);
      }
    } catch (error) {
      console.error('Error loading resumes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    router.push('/');
  };

  const maxScans = user?.subscriptionPlan === 'FREE' ? 5 : 999999;
  const scansRemaining = maxScans - (user?.scansUsedThisMonth || 0);
  const scanPercentage = user ? (user.scansUsedThisMonth / maxScans) * 100 : 0;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">ATS Checker</h1>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">
              <User className="inline h-4 w-4 mr-1" />
              {user?.name || user?.email}
            </span>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Overview */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardDescription>Subscription Plan</CardDescription>
              <CardTitle className="text-3xl">
                {user?.subscriptionPlan}
                {user?.subscriptionPlan === 'FREE' && (
                  <span className="text-sm font-normal text-gray-500 ml-2">
                    <Link href="#upgrade" className="text-blue-600 hover:underline">
                      Upgrade
                    </Link>
                  </span>
                )}
              </CardTitle>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <CardDescription>Scans This Month</CardDescription>
              <CardTitle className="text-3xl">
                {user?.scansUsedThisMonth || 0} / {maxScans === 999999 ? '∞' : maxScans}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Progress value={scanPercentage} className="h-2" />
              <p className="text-xs text-gray-500 mt-2">
                {scansRemaining > 100 ? 'Unlimited' : `${scansRemaining} scans remaining`}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardDescription>Total Resumes</CardDescription>
              <CardTitle className="text-3xl">{resumes.length}</CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 cursor-pointer hover:shadow-lg transition-shadow">
            <Link href="/dashboard/analyze">
              <CardHeader>
                <Upload className="h-12 w-12 mb-4" />
                <CardTitle className="text-white">New Analysis</CardTitle>
                <CardDescription className="text-blue-100">
                  Upload a resume and get instant ATS score
                </CardDescription>
              </CardHeader>
            </Link>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0 cursor-pointer hover:shadow-lg transition-shadow">
            <Link href="/dashboard/history">
              <CardHeader>
                <TrendingUp className="h-12 w-12 mb-4" />
                <CardTitle className="text-white">View History</CardTitle>
                <CardDescription className="text-purple-100">
                  See your past ATS scores and improvements
                </CardDescription>
              </CardHeader>
            </Link>
          </Card>
        </div>

        {/* Recent Resumes */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Resumes</CardTitle>
            <CardDescription>Your uploaded resumes and analysis</CardDescription>
          </CardHeader>
          <CardContent>
            {resumes.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 mb-4">No resumes uploaded yet</p>
                <Link href="/dashboard/analyze">
                  <Button>Upload Your First Resume</Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {resumes.slice(0, 5).map((resume) => (
                  <div
                    key={resume.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center space-x-4">
                      <FileText className="h-8 w-8 text-blue-600" />
                      <div>
                        <p className="font-medium">{resume.fileName}</p>
                        <p className="text-sm text-gray-500">
                          {new Date(resume.createdAt).toLocaleDateString()} • 
                          {resume._count.atsScores} analysis
                        </p>
                      </div>
                    </div>
                    <Link href={`/dashboard/analyze?resumeId=${resume.id}`}>
                      <Button variant="outline" size="sm">
                        Analyze Again
                      </Button>
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Upgrade CTA */}
        {user?.subscriptionPlan === 'FREE' && (
          <Card id="upgrade" className="mt-8 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
            <CardHeader>
              <CardTitle>Upgrade to Pro</CardTitle>
              <CardDescription>
                Get unlimited scans and advanced features for just $19/month
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 mb-6">
                <li className="flex items-center text-sm">
                  <span className="text-green-600 mr-2">✓</span>
                  Unlimited ATS scans
                </li>
                <li className="flex items-center text-sm">
                  <span className="text-green-600 mr-2">✓</span>
                  Advanced AI analysis
                </li>
                <li className="flex items-center text-sm">
                  <span className="text-green-600 mr-2">✓</span>
                  Detailed skill gap reports
                </li>
                <li className="flex items-center text-sm">
                  <span className="text-green-600 mr-2">✓</span>
                  Priority support
                </li>
              </ul>
              <Button className="w-full md:w-auto">Upgrade Now</Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
