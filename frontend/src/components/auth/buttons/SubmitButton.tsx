interface SubmitButtonProps {
  label: string
}

function SubmitButton({ label }: SubmitButtonProps) {
  return (
    <div className="buttons-auth">
      <button type="submit">{label}</button>
    </div>
  )
}

export default SubmitButton
