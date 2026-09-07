interface AuthErrorProps {
  message: string
}

function AuthError({ message }: AuthErrorProps) {
  if (message === "") {
    return null
  }
  return <p className="auth-error">{message}</p>
}

export default AuthError
