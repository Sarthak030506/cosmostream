interface DifficultyBadgeProps {
  level: string;
  size?: 'sm' | 'md' | 'lg';
}

export function DifficultyBadge({ level, size = 'md' }: DifficultyBadgeProps) {
  const getDifficultyStyles = (level: string) => {
    const normalizedLevel = level.toLowerCase();

    switch (normalizedLevel) {
      case 'beginner':
        return {
          bg: 'bg-green-500/20',
          text: 'text-green-300',
          border: 'border-green-500/50',
          label: 'Beginner',
        };
      case 'intermediate':
        return {
          bg: 'bg-blue-500/20',
          text: 'text-blue-300',
          border: 'border-blue-500/50',
          label: 'Intermediate',
        };
      case 'advanced':
        return {
          bg: 'bg-purple-500/20',
          text: 'text-purple-300',
          border: 'border-purple-500/50',
          label: 'Advanced',
        };
      case 'expert':
        return {
          bg: 'bg-red-500/20',
          text: 'text-red-300',
          border: 'border-red-500/50',
          label: 'Expert',
        };
      case 'all':
        return {
          bg: 'bg-gray-500/20',
          text: 'text-gray-300',
          border: 'border-gray-500/50',
          label: 'All Levels',
        };
      default:
        return {
          bg: 'bg-gray-500/20',
          text: 'text-gray-300',
          border: 'border-gray-500/50',
          label: level,
        };
    }
  };

  const sizeStyles = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-1.5 text-base',
  };

  const styles = getDifficultyStyles(level);

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border ${styles.bg} ${styles.text} ${styles.border} ${sizeStyles[size]} font-medium`}
    >
      <span className="w-2 h-2 rounded-full bg-current"></span>
      {styles.label}
    </span>
  );
}
