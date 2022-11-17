import { render, screen } from '@testing-library/react'
import App from './App'

/*

// This is the default test!!
test('renders learn react link', () => {
  render(<App />)
  const linkElement = screen.getByText(/learn react/i)
  expect(linkElement).toBeInTheDocument()
})

*/

test('renders', () => {
  render(<App />)
})
