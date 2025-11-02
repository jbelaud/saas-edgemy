import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { GlassCard } from '@/components/ui';

describe('GlassCard Component', () => {
  it('devrait s\'afficher correctement', () => {
    render(<GlassCard>Test Content</GlassCard>);

    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('devrait appliquer les classes personnalisées', () => {
    const { container } = render(
      <GlassCard className="custom-class">Test</GlassCard>
    );

    const card = container.firstChild;
    expect(card).toHaveClass('custom-class');
  });

  it('devrait afficher les enfants correctement', () => {
    render(
      <GlassCard>
        <div data-testid="child-1">Child 1</div>
        <div data-testid="child-2">Child 2</div>
      </GlassCard>
    );

    expect(screen.getByTestId('child-1')).toBeInTheDocument();
    expect(screen.getByTestId('child-2')).toBeInTheDocument();
  });
});
