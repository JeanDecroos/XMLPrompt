// Achievement definitions and helper logic for gamification

export const ACHIEVEMENTS = [
  {
    id: 'first-prompt',
    name: 'First Prompt',
    description: 'Create your first prompt',
    icon: '⭐',
    check: (stats) => stats.promptsCreated >= 1,
  },
  {
    id: 'role-explorer',
    name: 'Role Explorer',
    description: 'Create prompts in 3 different roles',
    icon: '🧭',
    check: (stats) => stats.rolesExplored.length >= 3,
  },
  {
    id: 'streak-starter',
    name: 'Streak Starter',
    description: 'Use the app 3 days in a row',
    icon: '🔥',
    check: (stats) => stats.streak >= 3,
  },
  {
    id: 'prompt-pro',
    name: 'Prompt Pro',
    description: 'Create 50 prompts',
    icon: '🏆',
    check: (stats) => stats.promptsCreated >= 50,
  },
  {
    id: 'community-sharer',
    name: 'Community Sharer',
    description: 'Share a prompt',
    icon: '🤝',
    check: (stats) => stats.promptsShared >= 1,
  },
  // Add more achievements as needed
]

export function getUnlockedAchievements(stats) {
  return ACHIEVEMENTS.filter(a => a.check(stats));
}

export function getXP(stats) {
  // Simple XP logic: 10 XP per prompt, 20 per new role, 5 per day streak, 30 per share
  return (
    stats.promptsCreated * 10 +
    stats.rolesExplored.length * 20 +
    stats.streak * 5 +
    stats.promptsShared * 30
  );
}

export function getLevel(xp) {
  // Level up every 100 XP
  return Math.floor(xp / 100) + 1;
}

export function getXPProgress(xp) {
  // Progress to next level (0-1)
  return (xp % 100) / 100;
} 