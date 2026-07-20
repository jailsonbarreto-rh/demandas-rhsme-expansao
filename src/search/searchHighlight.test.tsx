import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { HighlightedText } from './searchHighlight';

describe('HighlightedText', () => {
  it('destaca termo mesmo quando a consulta omite o acento', () => {
    render(<HighlightedText text="Solicitação de cessão" query="cessao" />);

    expect(screen.getByText('cessão').tagName).toBe('MARK');
  });

  it('destaca múltiplos termos sem interpretar HTML do texto original', () => {
    render(<HighlightedText text={'<script>alert(1)</script> Ricardo 2025'} query="ricardo 2025" />);

    expect(screen.getByText('<script>alert(1)</script>', { exact: false })).toBeInTheDocument();
    expect(screen.getByText('Ricardo').tagName).toBe('MARK');
    expect(screen.getByText('2025').tagName).toBe('MARK');
    expect(document.querySelector('script')).toBeNull();
  });
});
