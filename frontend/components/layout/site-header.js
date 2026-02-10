export default function SiteHeader() {
  return (
    <header>
      <p>CyberMart</p>
      <nav>
        <a href="/">Home</a> | <a href="/categories">Categories</a> | <a href="/tools">Tools</a> |{' '}
        <a href="/login">Login</a> | <a href="/register">Register</a> | <a href="/dashboard/developer">Developer Dashboard</a> | <a href="/dashboard/admin">Admin Dashboard</a>
      </nav>
    </header>
  );
}
