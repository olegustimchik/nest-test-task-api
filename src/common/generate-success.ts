export const generateSuccess = <T>(message: string, data?: T) => {
  return {
    success: true,
    message,
    data,
  }
}
