'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, Upload, FileText, Zap, CheckCircle2, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export default function AnalyzePage() {
  const router = useRouter();
  const [step, setStep] = useState<'upload' | 'job-description' | 'analyzing' | 'results'>('upload');
  const [resumeId, setResumeId] = useState('');
  const [jobDescription, setJobDescription] = useState({
    title: '',
    company: '',
    description: '',
    requiredSkills: [] as string[],
    preferredSkills: [] as string[],
  });
  const [results, setResults] = useState<any>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploadType, setUploadType] = useState<'file' | 'text'>('file');
  const [resumeText, setResumeText] = useState('');

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('file', file);

      const token = localStorage.getItem('accessToken');
      const response = await fetch('/api/resume/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to upload resume');
      }

      setResumeId(data.resume.id);
      setStep('job-description');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleTextUpload = async () => {
    if (!resumeText.trim()) {
      setError('Please paste your resume content');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('textContent', resumeText);

      const token = localStorage.getItem('accessToken');
      const response = await fetch('/api/resume/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to upload resume');
      }

      setResumeId(data.resume.id);
      setStep('job-description');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyze = async () => {
    if (!jobDescription.title || !jobDescription.description) {
      setError('Please fill in job title and description');
      return;
    }

    setStep('analyzing');
    setError('');

    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch('/api/ats/analyze', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          resumeId,
          jobDescription,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Analysis failed');
      }

      setResults(data.result);
      setStep('results');
    } catch (err: any) {
      setError(err.message);
      setStep('job-description');
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 80) return 'bg-green-100';
    if (score >= 60) return 'bg-yellow-100';
    return 'bg-red-100';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Step Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-4">
            <div className={`flex items-center ${step !== 'upload' ? 'text-blue-600' : 'text-gray-900'}`}>
              <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                step !== 'upload' ? 'bg-blue-600 text-white' : 'bg-gray-200'
              }`}>
                {step !== 'upload' ? <CheckCircle2 className="h-6 w-6" /> : '1'}
              </div>
              <span className="ml-2 font-medium">Upload Resume</span>
            </div>
            <div className="h-1 w-16 bg-gray-200"></div>
            <div className={`flex items-center ${
              step === 'analyzing' || step === 'results' ? 'text-blue-600' : 
              step === 'job-description' ? 'text-gray-900' : 'text-gray-400'
            }`}>
              <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                step === 'analyzing' || step === 'results' ? 'bg-blue-600 text-white' :
                step === 'job-description' ? 'bg-gray-200' : 'bg-gray-100'
              }`}>
                {step === 'analyzing' || step === 'results' ? <CheckCircle2 className="h-6 w-6" /> : '2'}
              </div>
              <span className="ml-2 font-medium">Job Description</span>
            </div>
            <div className="h-1 w-16 bg-gray-200"></div>
            <div className={`flex items-center ${
              step === 'results' ? 'text-blue-600' : 'text-gray-400'
            }`}>
              <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                step === 'results' ? 'bg-blue-600 text-white' : 'bg-gray-100'
              }`}>
                {step === 'results' ? <CheckCircle2 className="h-6 w-6" /> : '3'}
              </div>
              <span className="ml-2 font-medium">Results</span>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start">
            <AlertCircle className="h-5 w-5 text-red-600 mr-3 mt-0.5" />
            <div>
              <p className="font-medium text-red-900">Error</p>
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        )}

        {/* Step 1: Upload Resume */}
        {step === 'upload' && (
          <Card>
            <CardHeader>
              <CardTitle>Upload Your Resume</CardTitle>
              <CardDescription>
                Upload a PDF/DOCX file or paste your resume text
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="flex gap-4 mb-6">
                  <Button
                    variant={uploadType === 'file' ? 'default' : 'outline'}
                    onClick={() => setUploadType('file')}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Upload File
                  </Button>
                  <Button
                    variant={uploadType === 'text' ? 'default' : 'outline'}
                    onClick={() => setUploadType('text')}
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Paste Text
                  </Button>
                </div>

                {uploadType === 'file' ? (
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center hover:border-blue-400 transition-colors">
                    <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 mb-2">
                      Drag and drop your resume here, or click to browse
                    </p>
                    <p className="text-sm text-gray-500 mb-4">
                      Supports PDF and DOCX files up to 5MB
                    </p>
                    <Input
                      type="file"
                      accept=".pdf,.docx"
                      onChange={handleFileUpload}
                      disabled={loading}
                      className="max-w-xs mx-auto"
                    />
                  </div>
                ) : (
                  <div className="space-y-4">
                    <Textarea
                      placeholder="Paste your resume content here..."
                      value={resumeText}
                      onChange={(e) => setResumeText(e.target.value)}
                      rows={15}
                      className="font-mono text-sm"
                    />
                    <Button
                      onClick={handleTextUpload}
                      disabled={loading || !resumeText.trim()}
                      className="w-full"
                    >
                      {loading ? 'Processing...' : 'Continue'}
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Job Description */}
        {step === 'job-description' && (
          <Card>
            <CardHeader>
              <CardTitle>Add Job Description</CardTitle>
              <CardDescription>
                Paste the job description you're applying for
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Job Title *</label>
                <Input
                  placeholder="e.g., Senior Software Engineer"
                  value={jobDescription.title}
                  onChange={(e) => setJobDescription({ ...jobDescription, title: e.target.value })}
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Company (Optional)</label>
                <Input
                  placeholder="e.g., Google"
                  value={jobDescription.company}
                  onChange={(e) => setJobDescription({ ...jobDescription, company: e.target.value })}
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Job Description *</label>
                <Textarea
                  placeholder="Paste the full job description here..."
                  value={jobDescription.description}
                  onChange={(e) => setJobDescription({ ...jobDescription, description: e.target.value })}
                  rows={12}
                />
              </div>

              <div className="flex gap-4">
                <Button variant="outline" onClick={() => setStep('upload')}>
                  Back
                </Button>
                <Button
                  onClick={handleAnalyze}
                  disabled={!jobDescription.title || !jobDescription.description}
                  className="flex-1"
                >
                  <Zap className="h-4 w-4 mr-2" />
                  Analyze Resume
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Analyzing */}
        {step === 'analyzing' && (
          <Card>
            <CardContent className="py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-6"></div>
                <h3 className="text-xl font-semibold mb-2">Analyzing Your Resume...</h3>
                <p className="text-gray-600">
                  Our AI is comparing your resume against the job description
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 4: Results */}
        {step === 'results' && results && (
          <div className="space-y-6">
            {/* Overall Score */}
            <Card className="border-2">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>ATS Score</CardTitle>
                    <CardDescription>Overall compatibility rating</CardDescription>
                  </div>
                  <div className={`text-6xl font-bold ${getScoreColor(results.overallScore)}`}>
                    {results.overallScore}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Progress value={results.overallScore} className="h-3" />
                <p className="text-sm text-gray-600 mt-4">
                  {results.overallScore >= 80 && "Excellent! Your resume is highly ATS-compatible."}
                  {results.overallScore >= 60 && results.overallScore < 80 && "Good, but there's room for improvement."}
                  {results.overallScore < 60 && "Needs improvement to pass ATS screening."}
                </p>
              </CardContent>
            </Card>

            {/* Component Scores */}
            <Card>
              <CardHeader>
                <CardTitle>Score Breakdown</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Skills Match</span>
                  <div className="flex items-center gap-3">
                    <Progress value={results.componentScores.skills} className="w-32 h-2" />
                    <span className={`font-bold ${getScoreColor(results.componentScores.skills)}`}>
                      {results.componentScores.skills}
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Experience Relevance</span>
                  <div className="flex items-center gap-3">
                    <Progress value={results.componentScores.experience} className="w-32 h-2" />
                    <span className={`font-bold ${getScoreColor(results.componentScores.experience)}`}>
                      {results.componentScores.experience}
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Keyword Density</span>
                  <div className="flex items-center gap-3">
                    <Progress value={results.componentScores.keywords} className="w-32 h-2" />
                    <span className={`font-bold ${getScoreColor(results.componentScores.keywords)}`}>
                      {results.componentScores.keywords}
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Formatting Quality</span>
                  <div className="flex items-center gap-3">
                    <Progress value={results.componentScores.formatting} className="w-32 h-2" />
                    <span className={`font-bold ${getScoreColor(results.componentScores.formatting)}`}>
                      {results.componentScores.formatting}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Matched & Missing */}
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-green-600">Matched Skills</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {results.matched.skills.map((skill: string, i: number) => (
                      <span key={i} className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
                        {skill}
                      </span>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-red-600">Missing Skills</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {results.missing.skills.map((skill: string, i: number) => (
                      <span key={i} className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm">
                        {skill}
                      </span>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* AI Analysis */}
            <Card>
              <CardHeader>
                <CardTitle>AI Analysis</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h4 className="font-semibold text-green-600 mb-3">Strengths</h4>
                  <ul className="space-y-2">
                    {results.aiAnalysis.strengths.map((strength: string, i: number) => (
                      <li key={i} className="flex items-start text-sm">
                        <CheckCircle2 className="h-4 w-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                        {strength}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold text-orange-600 mb-3">Areas for Improvement</h4>
                  <ul className="space-y-2">
                    {results.aiAnalysis.weaknesses.map((weakness: string, i: number) => (
                      <li key={i} className="flex items-start text-sm">
                        <AlertCircle className="h-4 w-4 text-orange-600 mr-2 mt-0.5 flex-shrink-0" />
                        {weakness}
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Suggestions */}
            <Card>
              <CardHeader>
                <CardTitle>Actionable Suggestions</CardTitle>
                <CardDescription>Follow these to improve your ATS score</CardDescription>
              </CardHeader>
              <CardContent>
                <ol className="space-y-3">
                  {results.suggestions.map((suggestion: string, i: number) => (
                    <li key={i} className="flex items-start">
                      <span className="flex-shrink-0 h-6 w-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm mr-3">
                        {i + 1}
                      </span>
                      <span className="text-sm">{suggestion}</span>
                    </li>
                  ))}
                </ol>
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex gap-4">
              <Link href="/dashboard" className="flex-1">
                <Button variant="outline" className="w-full">
                  Back to Dashboard
                </Button>
              </Link>
              <Button
                onClick={() => {
                  setStep('upload');
                  setResumeId('');
                  setJobDescription({ title: '', company: '', description: '', requiredSkills: [], preferredSkills: [] });
                  setResults(null);
                }}
                className="flex-1"
              >
                New Analysis
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
