'use client';

export function LoginButton() {
  const handleLogin = () => {
    const event = new CustomEvent('openLoginModal');
    window.dispatchEvent(event);
  };

  return (
    <button
      onClick={handleLogin}
      className="text-emerald-400 hover:text-emerald-300 underline"
    >
      Se connecter
    </button>
  );
}
