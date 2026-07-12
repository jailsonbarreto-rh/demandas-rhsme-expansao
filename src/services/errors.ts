export class InvalidCredentialsError extends Error {
  constructor(message = 'E-mail ou senha inválidos.') {
    super(message);
    this.name = 'InvalidCredentialsError';
  }
}

export class AccessPendingError extends Error {
  constructor(message = 'Seu acesso ainda aguarda aprovação de um administrador.') {
    super(message);
    this.name = 'AccessPendingError';
  }
}
