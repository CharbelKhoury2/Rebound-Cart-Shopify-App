import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  BookOpen, 
  PlayCircle, 
  FileText, 
  CheckCircle, 
  Clock, 
  Users, 
  Award,
  Download,
  ExternalLink,
  Video,
  FileQuestion,
  Target,
  TrendingUp,
  Calendar
} from 'lucide-react';

interface TrainingModule {
  id: string;
  title: string;
  description: string;
  type: 'video' | 'article' | 'quiz' | 'webinar';
  duration: number; // in minutes
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  category: string;
  completed: boolean;
  progress?: number;
  url?: string;
  requiredForTier?: string[];
}

interface TrainingResourcesProps {
  repId: string;
  repTier: string;
  completedModules: string[];
  onModuleComplete: (moduleId: string) => void;
  showProgress?: boolean;
}

export function TrainingResources({ 
  repId, 
  repTier, 
  completedModules, 
  onModuleComplete,
  showProgress = true 
}: TrainingResourcesProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');

  const trainingModules: TrainingModule[] = [
    {
      id: 'basic-onboarding',
      title: 'Platform Onboarding',
      description: 'Learn the basics of the Rebound Cart platform and dashboard navigation',
      type: 'video',
      duration: 15,
      difficulty: 'beginner',
      category: 'onboarding',
      completed: completedModules.includes('basic-onboarding'),
      progress: completedModules.includes('basic-onboarding') ? 100 : 0,
      url: '#',
      requiredForTier: ['BRONZE']
    },
    {
      id: 'customer-communication',
      title: 'Effective Customer Communication',
      description: 'Master the art of recovering abandoned carts through strategic communication',
      type: 'article',
      duration: 20,
      difficulty: 'intermediate',
      category: 'skills',
      completed: completedModules.includes('customer-communication'),
      progress: completedModules.includes('customer-communication') ? 100 : 30,
      url: '#',
      requiredForTier: ['SILVER']
    },
    {
      id: 'advanced-recovery-tactics',
      title: 'Advanced Recovery Strategies',
      description: 'Learn proven techniques to maximize cart recovery rates',
      type: 'webinar',
      duration: 45,
      difficulty: 'advanced',
      category: 'advanced',
      completed: completedModules.includes('advanced-recovery-tactics'),
      progress: completedModules.includes('advanced-recovery-tactics') ? 100 : 0,
      url: '#',
      requiredForTier: ['GOLD', 'PLATINUM']
    },
    {
      id: 'analytics-fundamentals',
      title: 'Analytics & Performance Tracking',
      description: 'Understanding your metrics and using data to improve performance',
      type: 'video',
      duration: 25,
      difficulty: 'intermediate',
      category: 'analytics',
      completed: completedModules.includes('analytics-fundamentals'),
      progress: completedModules.includes('analytics-fundamentals') ? 100 : 60,
      url: '#',
      requiredForTier: ['SILVER']
    },
    {
      id: 'tier-progression-quiz',
      title: 'Tier Progression Assessment',
      description: 'Test your knowledge and qualify for the next tier level',
      type: 'quiz',
      duration: 30,
      difficulty: 'intermediate',
      category: 'assessment',
      completed: completedModules.includes('tier-progression-quiz'),
      progress: completedModules.includes('tier-progression-quiz') ? 100 : 0,
      url: '#',
      requiredForTier: ['SILVER', 'GOLD', 'PLATINUM']
    },
    {
      id: 'negotiation-techniques',
      title: 'Advanced Negotiation Techniques',
      description: 'Learn how to handle objections and close more recoveries',
      type: 'webinar',
      duration: 60,
      difficulty: 'advanced',
      category: 'skills',
      completed: completedModules.includes('negotiation-techniques'),
      progress: completedModules.includes('negotiation-techniques') ? 100 : 0,
      url: '#',
      requiredForTier: ['PLATINUM']
    }
  ];

  const categories = ['all', ...Array.from(new Set(trainingModules.map(m => m.category)))];
  const types = ['all', ...Array.from(new Set(trainingModules.map(m => m.type)))];

  const filteredModules = trainingModules.filter(module => {
    const categoryMatch = selectedCategory === 'all' || module.category === selectedCategory;
    const typeMatch = selectedType === 'all' || module.type === selectedType;
    return categoryMatch && typeMatch;
  });

  const getModuleIcon = (type: string) => {
    switch (type) {
      case 'video': return <Video className="h-4 w-4" />;
      case 'article': return <FileText className="h-4 w-4" />;
      case 'quiz': return <FileQuestion className="h-4 w-4" />;
      case 'webinar': return <Users className="h-4 w-4" />;
      default: return <BookOpen className="h-4 w-4" />;
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-status-success/10 text-status-success';
      case 'intermediate': return 'bg-status-warning/10 text-status-warning';
      case 'advanced': return 'bg-destructive/10 text-destructive';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const isRequiredForCurrentTier = (module: TrainingModule) => {
    return module.requiredForTier?.includes(repTier) || false;
  };

  const completedCount = trainingModules.filter(m => m.completed).length;
  const totalCount = trainingModules.length;
  const overallProgress = (completedCount / totalCount) * 100;

  return (
    <div className="space-y-6">
      {/* Overall Progress */}
      {showProgress && (
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              Training Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-muted-foreground">Overall Completion</span>
                  <span className="font-medium text-foreground">{completedCount}/{totalCount} modules</span>
                </div>
                <Progress value={overallProgress} className="h-2" />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-status-success">{completedCount}</div>
                  <p className="text-xs text-muted-foreground">Completed</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-status-warning">{totalCount - completedCount}</div>
                  <p className="text-xs text-muted-foreground">Remaining</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">{overallProgress.toFixed(0)}%</div>
                  <p className="text-xs text-muted-foreground">Progress</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <Card className="glass-card">
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4">
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">Category</label>
              <div className="flex gap-2">
                {categories.map(category => (
                  <Button
                    key={category}
                    variant={selectedCategory === category ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCategory(category)}
                    className="text-xs"
                  >
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </Button>
                ))}
              </div>
            </div>
            
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">Type</label>
              <div className="flex gap-2">
                {types.map(type => (
                  <Button
                    key={type}
                    variant={selectedType === type ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedType(type)}
                    className="text-xs"
                  >
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Training Modules */}
      <div className="space-y-4">
        {filteredModules.map(module => (
          <Card key={module.id} className={`glass-card ${module.completed ? 'border-status-success/50' : ''}`}>
            <CardContent className="p-4">
              <div className="flex items-start gap-4">
                <div className={`p-2 rounded-lg ${
                  module.completed ? 'bg-status-success/10 text-status-success' : 'bg-primary/10 text-primary'
                }`}>
                  {getModuleIcon(module.type)}
                </div>
                
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-foreground flex items-center gap-2">
                        {module.title}
                        {isRequiredForCurrentTier(module) && (
                          <Badge variant="outline" className="text-xs border-status-warning text-status-warning">
                            Required for {repTier}
                          </Badge>
                        )}
                        {module.completed && (
                          <CheckCircle className="h-4 w-4 text-status-success" />
                        )}
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1">{module.description}</p>
                      
                      <div className="flex items-center gap-4 mt-2">
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {module.duration} min
                        </div>
                        <Badge variant="outline" className={`text-xs ${getDifficultyColor(module.difficulty)}`}>
                          {module.difficulty}
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          {module.category}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {module.url && (
                        <Button variant="outline" size="sm" asChild>
                          <a href={module.url} target="_blank" rel="noopener noreferrer">
                            {module.completed ? <ExternalLink className="h-4 w-4" /> : <PlayCircle className="h-4 w-4" />}
                            {module.completed ? 'Review' : 'Start'}
                          </a>
                        </Button>
                      )}
                      
                      {!module.completed && onModuleComplete && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => onModuleComplete(module.id)}
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Mark Complete
                        </Button>
                      )}
                    </div>
                  </div>
                  
                  {/* Progress Bar */}
                  {module.progress !== undefined && module.progress > 0 && module.progress < 100 && (
                    <div className="mt-3">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-muted-foreground">Progress</span>
                        <span className="font-medium">{module.progress}%</span>
                      </div>
                      <Progress value={module.progress} className="h-1" />
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredModules.length === 0 && (
        <Card className="glass-card">
          <CardContent className="p-8 text-center">
            <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No training modules found</h3>
            <p className="text-sm text-muted-foreground">
              Try adjusting your filters to see more training content.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// Training Summary Component
interface TrainingSummaryProps {
  reps: Array<{
    id: string;
    name: string;
    tier: string;
    completedModules: string[];
  }>;
}

export function TrainingSummary({ reps }: TrainingSummaryProps) {
  const totalModules = 6; // Total number of available training modules
  
  const summary = reps.map(rep => ({
    ...rep,
    completionRate: (rep.completedModules.length / totalModules) * 100,
    isOnTrack: rep.completedModules.length >= getRequiredModulesForTier(rep.tier).length
  }));

  const getRequiredModulesForTier = (tier: string) => {
    switch (tier) {
      case 'BRONZE': return ['basic-onboarding'];
      case 'SILVER': return ['basic-onboarding', 'customer-communication', 'analytics-fundamentals'];
      case 'GOLD': return ['basic-onboarding', 'customer-communication', 'advanced-recovery-tactics', 'analytics-fundamentals'];
      case 'PLATINUM': return ['basic-onboarding', 'customer-communication', 'advanced-recovery-tactics', 'analytics-fundamentals', 'negotiation-techniques'];
      default: return [];
    }
  };

  const averageCompletion = summary.reduce((sum, rep) => sum + rep.completionRate, 0) / summary.length;
  const onTrackCount = summary.filter(rep => rep.isOnTrack).length;

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="h-5 w-5" />
          Team Training Overview
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">{averageCompletion.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">Average Completion</p>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-status-success">{onTrackCount}/{reps.length}</div>
            <p className="text-xs text-muted-foreground">On Track</p>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-status-warning">{totalModules}</div>
            <p className="text-xs text-muted-foreground">Total Modules</p>
          </div>
        </div>

        <div className="space-y-3">
          {summary.map(rep => (
            <div key={rep.id} className="flex items-center gap-3 p-3 rounded-lg border border-border/50">
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-foreground">{rep.name}</span>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {rep.tier}
                    </Badge>
                    {rep.isOnTrack ? (
                      <CheckCircle className="h-4 w-4 text-status-success" />
                    ) : (
                      <Clock className="h-4 w-4 text-status-warning" />
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Progress value={rep.completionRate} className="flex-1 h-2" />
                  <span className="text-xs text-muted-foreground w-12 text-right">
                    {rep.completionRate.toFixed(0)}%
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
