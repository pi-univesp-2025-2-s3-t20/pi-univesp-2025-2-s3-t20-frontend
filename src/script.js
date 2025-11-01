import './config.js';

// Verifica se o usuário está autenticado
document.addEventListener('DOMContentLoaded', () => {
  const isAuthenticated = localStorage.getItem('auth') === 'true';

  // Se não estiver logado, redireciona para a página de login
  if (!isAuthenticated && window.location.pathname !== '/login.html') {
    window.location.href = 'login.html';
  }

  // Configura o botão de logout, se existir
  const btnLogout = document.getElementById('btn-logout');
  if (btnLogout) {
    btnLogout.addEventListener('click', () => {
      localStorage.removeItem('auth');
      window.location.href = 'login.html';
    });
  }
});