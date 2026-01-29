/**
 * Message (contrato con backend)
 * @property {string} nickname
 * @property {string} message
 * @property {string} time
 */
export const createMessage = ({ nickname, message, time, ...rest }) => ({
  nickname,
  message,
  time: time || new Date().toISOString(),
  ...rest, // mantiene flags como isSystem u otros
})
