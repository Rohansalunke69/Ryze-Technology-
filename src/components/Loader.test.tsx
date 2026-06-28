import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';
import { Loader } from './Loader';

describe('Loader', () => {
  it('renders the 3D box loading animation structure', () => {
    const { container } = render(<Loader />);
    
    // Check if the boxes wrapper is present
    const boxes = container.querySelector('.boxes');
    expect(boxes).toBeInTheDocument();
    
    // Check if it renders 4 boxes
    const boxElements = container.querySelectorAll('.box');
    expect(boxElements).toHaveLength(4);
  });
});
