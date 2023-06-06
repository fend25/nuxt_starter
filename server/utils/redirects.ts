import {H3Event} from 'h3'

export const redirectToUserSpace = async (event: H3Event): Promise<void> => {
  return await sendRedirect(event, getRequestURL(event).origin, 302)
}
