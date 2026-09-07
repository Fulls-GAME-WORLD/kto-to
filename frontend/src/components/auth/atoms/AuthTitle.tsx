interface AuthTitleProps {
  title: string
}

function AuthTitle({ title }: AuthTitleProps) {
  return <h2 className="auth-title">{title}</h2>
}

export default AuthTitle
