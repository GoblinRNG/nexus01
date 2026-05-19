import { SKILLS } from '../data/skills'

export function SkillsGrid() {
  const totalLevel = SKILLS.reduce((sum, s) => sum + s.level, 0)
  const maxLevel = SKILLS.reduce((sum, s) => sum + (s.level >= 120 ? 120 : 99), 0)

  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-[9px] text-nexus-text uppercase tracking-wider font-bold">Skills</span>
        <span className="text-[9px] text-nexus-accent font-bold">
          {totalLevel.toLocaleString()} / {maxLevel.toLocaleString()}
        </span>
      </div>
      <div className="grid grid-cols-3 gap-0.5">
        {SKILLS.map((skill) => (
          <SkillRow key={skill.name} skill={skill} />
        ))}
      </div>
    </div>
  )
}

interface SkillRowProps {
  skill: { name: string; level: number; color: string; abbr: string }
}

function SkillRow({ skill }: SkillRowProps) {
  const isMax = skill.level >= 120 || (skill.level === 99 && skill.name !== 'Dungeoneering' && skill.name !== 'Invention' && skill.name !== 'Archaeology' && skill.name !== 'Necromancy')

  return (
    <div className="flex items-center gap-1 px-1 py-0.5 hover:bg-nexus-card rounded transition-colors">
      <div
        className="skill-icon flex-shrink-0"
        style={{ backgroundColor: skill.color + '33', border: `1px solid ${skill.color}55` }}
      >
        <span style={{ color: skill.color }} className="text-[7px] font-bold leading-none">
          {skill.abbr[0]}
        </span>
      </div>
      <span className="text-[9px] text-nexus-text truncate flex-1">{skill.abbr}</span>
      <span
        className={`text-[10px] font-bold tabular-nums ${isMax ? 'text-nexus-gold' : 'text-nexus-text-bright'}`}
      >
        {skill.level}
      </span>
    </div>
  )
}
