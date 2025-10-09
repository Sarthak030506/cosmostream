# Contributing to CosmoStream

Thank you for your interest in contributing to CosmoStream! This document provides guidelines and instructions for contributing.

## Code of Conduct

- Be respectful and inclusive
- Provide constructive feedback
- Focus on what is best for the community
- Show empathy towards others

## Getting Started

1. **Fork the repository**
2. **Clone your fork**
   ```bash
   git clone https://github.com/your-username/cosmostream.git
   cd cosmostream
   ```
3. **Install dependencies**
   ```bash
   npm install
   ```
4. **Create a branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

## Development Workflow

### 1. Make Your Changes

- Write clean, readable code
- Follow existing code style
- Add tests for new features
- Update documentation as needed

### 2. Test Your Changes

```bash
# Run linter
npm run lint

# Run tests
npm test

# Run type checking
npm run build
```

### 3. Commit Your Changes

We follow [Conventional Commits](https://www.conventionalcommits.org/):

```bash
git commit -m "feat: add AR mode to sky map"
git commit -m "fix: resolve video playback issue on Safari"
git commit -m "docs: update API documentation"
```

**Commit Types**:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

### 4. Push and Create PR

```bash
git push origin feature/your-feature-name
```

Then create a Pull Request on GitHub.

## Pull Request Guidelines

### PR Title

Use the same format as commit messages:
- `feat: Add AR mode to sky map`
- `fix: Resolve video playback issue`

### PR Description

Include:
- **What**: Brief description of changes
- **Why**: Motivation and context
- **How**: Technical approach
- **Testing**: How you tested the changes
- **Screenshots**: For UI changes

**Template**:
```markdown
## Description
Brief description of the changes

## Motivation
Why are these changes needed?

## Changes Made
- Change 1
- Change 2

## Testing
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] Manual testing completed

## Screenshots (if applicable)
Add screenshots here
```

### Code Review Process

1. **Automated Checks**: CI pipeline must pass
2. **Peer Review**: At least 1 approval required
3. **Address Feedback**: Make requested changes
4. **Merge**: Squash and merge to main

## Coding Standards

### TypeScript

```typescript
// Use explicit types
function calculateDistance(a: number, b: number): number {
  return Math.sqrt(a * a + b * b);
}

// Use interfaces for objects
interface User {
  id: string;
  email: string;
  name: string;
}

// Prefer const over let
const API_URL = 'https://api.cosmostream.com';
```

### React Components

```typescript
// Use function components with TypeScript
interface VideoPlayerProps {
  videoId: string;
  autoplay?: boolean;
}

export function VideoPlayer({ videoId, autoplay = false }: VideoPlayerProps) {
  // Component implementation
}

// Use meaningful component names
// ✓ Good: VideoPlayer, UserProfile, SkyMap
// ✗ Bad: Component1, Thing, Stuff
```

### Naming Conventions

- **Files**: kebab-case (`video-player.tsx`)
- **Components**: PascalCase (`VideoPlayer`)
- **Functions**: camelCase (`calculateDistance`)
- **Constants**: UPPER_SNAKE_CASE (`MAX_FILE_SIZE`)
- **Interfaces**: PascalCase with 'I' prefix optional (`User` or `IUser`)

### File Organization

```
component/
├── index.tsx           # Main component
├── component.test.tsx  # Tests
├── component.styles.ts # Styles (if using styled-components)
└── types.ts           # Type definitions
```

## Testing Guidelines

### Unit Tests

```typescript
// Example test
describe('calculateDistance', () => {
  it('should calculate distance correctly', () => {
    expect(calculateDistance(3, 4)).toBe(5);
  });

  it('should handle zero values', () => {
    expect(calculateDistance(0, 0)).toBe(0);
  });
});
```

### Integration Tests

```typescript
// Example integration test
describe('User API', () => {
  it('should create a new user', async () => {
    const response = await request(app)
      .post('/graphql')
      .send({
        query: `
          mutation {
            signup(email: "test@example.com", password: "password", name: "Test User") {
              token
              user { id email }
            }
          }
        `,
      });

    expect(response.status).toBe(200);
    expect(response.body.data.signup.user.email).toBe('test@example.com');
  });
});
```

### Test Coverage

- Aim for 80%+ coverage
- Focus on critical paths
- Test edge cases
- Mock external dependencies

## Documentation

### Code Comments

```typescript
/**
 * Calculates the distance between two points in 2D space.
 * @param a - X coordinate
 * @param b - Y coordinate
 * @returns The Euclidean distance
 */
function calculateDistance(a: number, b: number): number {
  return Math.sqrt(a * a + b * b);
}
```

### README Updates

Update relevant READMEs when:
- Adding new features
- Changing configuration
- Updating dependencies
- Modifying setup process

### API Documentation

Document GraphQL schema changes:

```graphql
"""
Represents a video in the system
"""
type Video {
  """Unique identifier"""
  id: ID!

  """Video title"""
  title: String!

  """Video creator"""
  creator: User!
}
```

## Issue Reporting

### Bug Reports

Include:
- **Description**: What happened?
- **Expected behavior**: What should happen?
- **Steps to reproduce**: Detailed steps
- **Environment**: Browser, OS, etc.
- **Screenshots**: If applicable
- **Error messages**: Full stack trace

### Feature Requests

Include:
- **Problem**: What problem does this solve?
- **Solution**: Proposed solution
- **Alternatives**: Other options considered
- **Use cases**: Real-world examples

## Project Structure

```
cosmostream/
├── apps/                    # Application services
│   ├── web/                # Next.js frontend
│   ├── api/                # GraphQL API
│   ├── media-processor/    # Video processing
│   └── realtime/           # WebSocket server
├── packages/               # Shared packages
│   └── shared/            # Shared types/utils
├── database/              # Database schemas
├── infrastructure/        # Terraform IaC
├── kubernetes/           # K8s manifests
├── docs/                 # Documentation
└── .github/              # GitHub workflows
```

## Commit Message Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Example**:
```
feat(api): add video search endpoint

Implement Elasticsearch-based video search with
filters for category, tags, and date range.

Closes #123
```

## Review Checklist

Before submitting PR:
- [ ] Code follows style guidelines
- [ ] Tests added/updated and passing
- [ ] Documentation updated
- [ ] No console.log statements
- [ ] No commented-out code
- [ ] Types are properly defined
- [ ] Error handling implemented
- [ ] Performance considered

## Questions?

- Open an issue for questions
- Join our Discord community
- Email: dev@cosmostream.com

## License

By contributing, you agree that your contributions will be licensed under the project's license.
