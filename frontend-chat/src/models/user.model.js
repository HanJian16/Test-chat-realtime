/**
 * User (contrato con backend)
 * @property {string} id
 * @property {string} nickname
 * @property {'online' | 'offline'} status
 */
export const createUser = ({ id, nickname, status = 'online', ...rest }) => ({
  id,
  nickname,
  status,
  ...rest,
})
