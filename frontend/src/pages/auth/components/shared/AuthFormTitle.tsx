interface AuthFormTitleProps {
  title: string
}

function AuthFormTitle({ title }: AuthFormTitleProps) {
  return <h2 className="auth-title">{title}</h2>
}

export default AuthFormTitle
