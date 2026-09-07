interface AuthFormErrorProps {
  message: string
}

function AuthFormError({ message }: AuthFormErrorProps) {
  if (message === "") {
    return null
  }
  return <p className="auth-error">{message}</p>
}

export default AuthFormError
