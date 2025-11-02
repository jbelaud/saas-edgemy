import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BookingModal } from '@/components/coach/public/BookingModal';

// Mock de useSession
vi.mock('@/lib/auth-client', () => ({
  useSession: () => ({
    data: {
      user: {
        id: 'test-user-id',
        email: 'test@example.com',
      },
    },
    isPending: false,
  }),
}));

// Mock de redirectToCheckout
vi.mock('@/lib/stripe-client', () => ({
  redirectToCheckout: vi.fn(),
}));

describe('BookingModal Component', () => {
  const mockAnnouncement = {
    id: 'test-announcement-id',
    title: 'Session de Coaching',
    description: 'Description de test',
    price: 50,
    duration: 60,
    packs: [],
  };

  const mockOnClose = vi.fn();

  it('devrait afficher le modal quand isOpen est true', () => {
    render(
      <BookingModal
        isOpen={true}
        onClose={mockOnClose}
        announcement={mockAnnouncement}
        coachId="test-coach-id"
      />
    );

    expect(screen.getByText(mockAnnouncement.title)).toBeInTheDocument();
  });

  it('ne devrait pas afficher le modal quand isOpen est false', () => {
    render(
      <BookingModal
        isOpen={false}
        onClose={mockOnClose}
        announcement={mockAnnouncement}
        coachId="test-coach-id"
      />
    );

    expect(screen.queryByText(mockAnnouncement.title)).not.toBeInTheDocument();
  });

  it('devrait afficher le prix de la session', () => {
    render(
      <BookingModal
        isOpen={true}
        onClose={mockOnClose}
        announcement={mockAnnouncement}
        coachId="test-coach-id"
      />
    );

    expect(screen.getByText(/50/)).toBeInTheDocument();
  });

  it('devrait afficher la durée de la session', () => {
    render(
      <BookingModal
        isOpen={true}
        onClose={mockOnClose}
        announcement={mockAnnouncement}
        coachId="test-coach-id"
      />
    );

    expect(screen.getByText(/60/)).toBeInTheDocument();
  });

  it.skip('devrait permettre de sélectionner un créneau', async () => {
    const user = userEvent.setup();

    render(
      <BookingModal
        isOpen={true}
        onClose={mockOnClose}
        announcement={mockAnnouncement}
        coachId="test-coach-id"
      />
    );

    // Attendre que les créneaux se chargent
    await waitFor(
      () => {
        const timeSlots = screen.queryAllByTestId('time-slot');
        expect(timeSlots.length).toBeGreaterThan(0);
      },
      { timeout: 3000 }
    );

    const firstSlot = screen.getAllByTestId('time-slot')[0];
    await user.click(firstSlot);

    expect(firstSlot).toHaveClass(/selected|active/);
  });

  it('devrait appeler onClose quand on ferme le modal', async () => {
    const user = userEvent.setup();

    render(
      <BookingModal
        isOpen={true}
        onClose={mockOnClose}
        announcement={mockAnnouncement}
        coachId="test-coach-id"
      />
    );

    // Chercher le bouton de fermeture (X ou Close)
    const closeButton = screen.getByRole('button', { name: /close|fermer/i });

    if (closeButton) {
      await user.click(closeButton);
      expect(mockOnClose).toHaveBeenCalled();
    }
  });
});
