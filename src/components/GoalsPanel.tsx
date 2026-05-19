import React, { useState } from 'react'
import { Target, ChevronRight, Star, CheckCircle2, ArrowRight, BookOpen, Plus } from 'lucide-react'
import type { Goal } from '../types'

interface GoalsPanelProps {
  goals: Goal[]
}

const SAMPLE_GOAL: Goal = {
  id: 'necromancy-1',
  title: 'Unlock Necromancy',
  description: 'Complete the "Necromancy!" quest to unlock the Necromancy skill and gain access to the City of Um.',
  prerequisites: [
    'Level 20 Magic',
    'Level 20 Defence',
    'Completion of "Rune Mysteries"',
  ],
  exactAction: 'Travel to the City of Um and speak to Death',
  currentProgress: 0,
  targetProgress: 1,
  unit: 'quest',
  rewards: [
    'Necromancy skill unlocked',
    'Access to City of Um',
    "Death's office teleport",
  ],
  guideUrl: 'https://runescape.wiki/w/Necromancy!',
}

function ProgressBar({ current, target, color = '#00c8e0' }: { current: number; target: number; color?: string }) {
  const pct = target > 0 ? Math.min((current / target) * 100, 100) : 0
  return (
    <div className="relative h-2 bg-nexus-bg rounded-full overflow-hidden">
      <div
        className="h-full rounded-full transition-all duration-500"
        style={{ width: `${pct}%`, backgroundColor: color }}
      />
    </div>
  )
}

interface MainGoalCardProps {
  goal: Goal
}

function MainGoalCard({ goal }: MainGoalCardProps) {
  const pct = goal.targetProgress > 0
    ? Math.round((goal.currentProgress / goal.targetProgress) * 100)
    : 0
  const isComplete = goal.currentProgress >= goal.targetProgress

  return (
    <div className="border border-nexus-border rounded-xl overflow-hidden bg-nexus-card">
      {/* Card header strip */}
      <div
        className="px-4 py-2 flex items-center gap-2"
        style={{ background: 'linear-gradient(90deg, rgba(0,200,224,0.12) 0%, transparent 100%)' }}
      >
        <div className="p-1 rounded bg-nexus-accent/20 border border-nexus-accent/30">
          <Target className="w-3.5 h-3.5 text-nexus-accent" />
        </div>
        <span className="text-[10px] font-mono text-nexus-accent uppercase tracking-widest font-bold">Primary Goal</span>
        {isComplete && (
          <div className="ml-auto flex items-center gap-1 text-nexus-green">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span className="text-[10px] font-mono font-bold">COMPLETE</span>
          </div>
        )}
      </div>

      <div className="p-4 space-y-4">
        {/* Title & description */}
        <div>
          <h3 className="text-base font-mono font-bold text-nexus-text-bright mb-1">{goal.title}</h3>
          <p className="text-xs font-mono text-nexus-text leading-relaxed">{goal.description}</p>
        </div>

        {/* Prerequisites */}
        {goal.prerequisites.length > 0 && (
          <div>
            <p className="text-[10px] font-mono text-nexus-text uppercase tracking-widest mb-2">Prerequisites</p>
            <div className="space-y-1.5">
              {goal.prerequisites.map((req, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-nexus-border flex-shrink-0" />
                  <span className="text-xs font-mono text-nexus-text">{req}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Exact Immediate Action */}
        <div className="border-2 border-nexus-gold/40 bg-nexus-gold/5 rounded-xl p-3">
          <div className="flex items-center gap-1.5 mb-2">
            <ArrowRight className="w-3.5 h-3.5 text-nexus-gold" />
            <span className="text-[10px] font-mono text-nexus-gold uppercase tracking-widest font-bold">
              Exact Immediate Action
            </span>
          </div>
          <p className="text-sm font-mono text-nexus-gold font-semibold">{goal.exactAction}</p>
        </div>

        {/* Progress */}
        <div>
          <div className="flex justify-between items-center mb-1.5">
            <span className="text-[10px] font-mono text-nexus-text uppercase tracking-wider">Progress</span>
            <span className="text-[10px] font-mono text-nexus-text-bright font-bold">
              {goal.currentProgress}/{goal.targetProgress} {goal.unit}
              <span className="text-nexus-text ml-1">({pct}%)</span>
            </span>
          </div>
          <ProgressBar current={goal.currentProgress} target={goal.targetProgress} color="#00c8e0" />
        </div>

        {/* Rewards */}
        {goal.rewards.length > 0 && (
          <div>
            <p className="text-[10px] font-mono text-nexus-text uppercase tracking-widest mb-2">Rewards</p>
            <div className="grid grid-cols-1 gap-1.5">
              {goal.rewards.map((reward, i) => (
                <div key={i} className="flex items-center gap-2">
                  <Star className="w-3 h-3 text-nexus-gold flex-shrink-0" />
                  <span className="text-xs font-mono text-nexus-text-bright">{reward}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action button */}
        <div className="flex gap-2 pt-1">
          {goal.guideUrl ? (
            <a
              href={goal.guideUrl}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 px-4 py-2 bg-nexus-accent/10 border border-nexus-accent/40 text-nexus-accent text-xs font-mono font-bold rounded-lg hover:bg-nexus-accent/20 transition-colors"
            >
              <BookOpen className="w-3.5 h-3.5" />
              View Guide
              <ChevronRight className="w-3 h-3" />
            </a>
          ) : (
            <button className="flex items-center gap-1.5 px-4 py-2 bg-nexus-accent/10 border border-nexus-accent/40 text-nexus-accent text-xs font-mono font-bold rounded-lg hover:bg-nexus-accent/20 transition-colors">
              <BookOpen className="w-3.5 h-3.5" />
              View Guide
              <ChevronRight className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

interface SmallGoalCardProps {
  goal: Goal
}

function SmallGoalCard({ goal }: SmallGoalCardProps) {
  const pct = goal.targetProgress > 0
    ? Math.round((goal.currentProgress / goal.targetProgress) * 100)
    : 0

  return (
    <div className="border border-nexus-border rounded-xl p-3 hover:border-nexus-border/80 bg-nexus-card transition-colors space-y-2">
      <div className="flex items-start gap-2">
        <div className="p-1 rounded bg-nexus-accent/10 border border-nexus-accent/20 flex-shrink-0 mt-0.5">
          <Target className="w-3 h-3 text-nexus-accent" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-mono font-bold text-nexus-text-bright truncate">{goal.title}</p>
          <p className="text-[10px] font-mono text-nexus-text truncate">{goal.description}</p>
        </div>
        <span className="text-[10px] font-mono text-nexus-text-bright flex-shrink-0">{pct}%</span>
      </div>
      <ProgressBar current={goal.currentProgress} target={goal.targetProgress} color="#00c8e0" />
      <p className="text-[10px] font-mono text-nexus-gold">→ {goal.exactAction}</p>
    </div>
  )
}

export function GoalsPanel({ goals }: GoalsPanelProps) {
  const displayGoals = goals.length > 0 ? goals : [SAMPLE_GOAL]
  const [primaryGoal, ...restGoals] = displayGoals

  return (
    <div className="flex flex-col h-full bg-nexus-panel border border-nexus-border rounded-xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-nexus-border bg-nexus-bg/50 flex-shrink-0">
        <div className="p-1.5 rounded-lg bg-nexus-accent/10 border border-nexus-accent/30">
          <Target className="w-4 h-4 text-nexus-accent" />
        </div>
        <div>
          <h2 className="text-sm font-mono font-bold text-nexus-text-bright tracking-wider">Goals & Progression</h2>
          <p className="text-[10px] font-mono text-nexus-text">{displayGoals.length} goal{displayGoals.length !== 1 ? 's' : ''}</p>
        </div>
        <button className="ml-auto flex items-center gap-1 px-2.5 py-1.5 bg-nexus-accent/10 border border-nexus-accent/30 text-nexus-accent text-[10px] font-mono rounded-lg hover:bg-nexus-accent/20 transition-colors">
          <Plus className="w-3 h-3" />
          Add Goal
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-4">
        {/* Primary goal — large card */}
        <MainGoalCard goal={primaryGoal} />

        {/* Additional goals */}
        {restGoals.length > 0 && (
          <div>
            <p className="text-[10px] font-mono text-nexus-text uppercase tracking-widest mb-2">Additional Goals</p>
            <div className="space-y-2">
              {restGoals.map(goal => (
                <SmallGoalCard key={goal.id} goal={goal} />
              ))}
            </div>
          </div>
        )}

        {/* Add goal placeholder when empty */}
        {goals.length === 0 && (
          <div className="border border-dashed border-nexus-border rounded-xl p-4 text-center space-y-2">
            <p className="text-xs font-mono text-nexus-text">No custom goals yet.</p>
            <p className="text-[10px] font-mono text-nexus-text/60">Add your own goals to track quest completions, skill targets, or collection milestones.</p>
            <button className="mt-1 flex items-center gap-1.5 mx-auto px-3 py-1.5 bg-nexus-accent/10 border border-nexus-accent/30 text-nexus-accent text-xs font-mono rounded-lg hover:bg-nexus-accent/20 transition-colors">
              <Plus className="w-3 h-3" />
              Add First Goal
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
