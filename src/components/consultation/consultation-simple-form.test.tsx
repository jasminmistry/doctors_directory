import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ConsultationSimpleForm } from '@/components/consultation/consultation-simple-form'

function renderForm(onSubmit = jest.fn()) {
  render(
    <ConsultationSimpleForm
      clinicName="Test Clinic"
      submitLabel="Send request"
      submitting={false}
      onSubmit={onSubmit}
    />,
  )
  return { onSubmit }
}

const submitButton = () => screen.getByRole('button', { name: 'Send request' }) as HTMLButtonElement

describe('ConsultationSimpleForm', () => {
  test('does not collect name or date of birth', () => {
    renderForm()
    expect(screen.queryByText(/first name/i)).toBeNull()
    expect(screen.queryByText(/last name/i)).toBeNull()
    expect(screen.queryByText(/date of birth/i)).toBeNull()
  })

  test('shows email, an optional phone field and a required reason dropdown', () => {
    renderForm()
    expect(screen.getByText('Email address')).toBeTruthy()
    expect(screen.getByText(/phone number \(optional\)/i)).toBeTruthy()
    expect(screen.getByText('Reason for contact')).toBeTruthy()
    expect(screen.getByRole('combobox')).toBeTruthy()
  })

  test('submit is disabled until email, a reason and all four consents are given', async () => {
    const user = userEvent.setup()
    const { onSubmit } = renderForm()

    expect(submitButton().disabled).toBe(true)

    await user.type(screen.getByPlaceholderText('you@example.com'), 'patient@example.com')
    await user.selectOptions(screen.getByRole('combobox'), 'consultation_24h')
    for (const box of screen.getAllByRole('checkbox')) {
      await user.click(box)
    }

    expect(submitButton().disabled).toBe(false)
    await user.click(submitButton())

    expect(onSubmit).toHaveBeenCalledWith({
      email: 'patient@example.com',
      phone: '',
      contactReason: 'consultation_24h',
    })
  })

  test('rejects an invalid UK phone number but allows a blank one', async () => {
    const user = userEvent.setup()
    const { onSubmit } = renderForm()

    await user.type(screen.getByPlaceholderText('you@example.com'), 'patient@example.com')
    await user.selectOptions(screen.getByRole('combobox'), 'consultation')
    for (const box of screen.getAllByRole('checkbox')) {
      await user.click(box)
    }
    await user.type(screen.getByPlaceholderText('07700 900000'), '12345')
    await user.click(submitButton())

    expect(onSubmit).not.toHaveBeenCalled()
    expect(screen.getByText(/valid UK number/i)).toBeTruthy()
  })
})
