export type GoogleAuthConfig = {
  clientId: string
  clientSecret: string
  callbackUrl: string
}

export interface IGoogleCredentials {
  /**
   * This field is only present if the access_type parameter was set to offline in the authentication request. For details, see Refresh tokens.
   */
  refresh_token?: string | null
  /**
   * The time in ms at which this token is thought to expire.
   */
  expiry_date?: number | null
  /**
   * A token that can be sent to a Google API.
   */
  access_token?: string | null
  /**
   * Identifies the type of token returned. At this time, this field always has the value Bearer.
   */
  token_type?: string | null
  /**
   * A JWT that contains identity information about the user that is digitally signed by Google.
   */
  id_token?: string | null
  /**
   * The scopes of access granted by the access_token expressed as a list of space-delimited, case-sensitive strings.
   */
  scope?: string
}

export interface IGoogleUserInfo {
  /**
   * The user's email address.
   */
  email?: string | null
  /**
   * The user's last name.
   */
  family_name?: string | null
  /**
   * The user's gender.
   */
  gender?: string | null
  /**
   * The user's first name.
   */
  given_name?: string | null
  /**
   * The hosted domain e.g. example.com if the user is Google apps user.
   */
  hd?: string | null
  /**
   * The obfuscated ID of the user.
   */
  id?: string | null
  /**
   * URL of the profile page.
   */
  link?: string | null
  /**
   * The user's preferred locale.
   */
  locale?: string | null
  /**
   * The user's full name.
   */
  name?: string | null
  /**
   * URL of the user's picture image.
   */
  picture?: string | null
  /**
   * Boolean flag which is true if the email address is verified. Always verified because we only return the user's primary email address.
   */
  verified_email?: boolean | null
}


const googleOAuth = {
  getAuthenticateUrl: (callbackUrl: string, clientId: string) => {
    return `https://accounts.google.com/o/oauth2/v2/auth?access_type=offline&` +
      `scope=${encodeURIComponent('https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email')}&` +
      `response_type=code&` +
      `client_id=${clientId}&` +
      `redirect_uri=${encodeURIComponent(callbackUrl)}`
  },
  async getGoogleTokenByCallbackRequestCode (code: string, config: GoogleAuthConfig): Promise<IGoogleCredentials> {
    const requestBodyObject = {
      code,
      client_id: config.clientId,
      client_secret: config.clientSecret,
      redirect_uri: config.callbackUrl,
      grant_type: 'authorization_code',
      code_verifier: ''
    }

    const tokenResponse = await fetch(`https://oauth2.googleapis.com/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        // 'User-Agent': 'google-api-nodejs-client/8.8.0',
        // 'x-goog-api-client': 'gl-node/20.2.0 auth/8.8.0',
        // 'Accept': 'application/json'
      },
      body: new URLSearchParams(requestBodyObject),
    })

    const tokenData = await tokenResponse.json()

    return tokenData
  },
  async getGoogleUserInfoByAccessToken (accessToken: string): Promise<IGoogleUserInfo> {
    const userInfoResponse = await fetch(`https://www.googleapis.com/userinfo/v2/me`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        // 'x-goog-api-client': 'gdcl/6.0.4 gl-node/20.2.0 auth/8.8.0',
        // 'Accept-Encoding': 'gzip',
        // 'User-Agent': 'google-api-nodejs-client/6.0.4 (gzip)',
        // 'Accept': 'application/json'
      },
    })

    const userInfo = await userInfoResponse.json()
    return userInfo
  },
  async getUserInfoByGoogleCode(code: string, config: GoogleAuthConfig) {
    const credentials = await googleOAuth.getGoogleTokenByCallbackRequestCode(code, config)
    if (!credentials.access_token) {
      throw new Error('No access_token in credentials')
    }

    const userInfo = await googleOAuth.getGoogleUserInfoByAccessToken(credentials.access_token)
    return {
      credentials,
      userInfo
    }
  },
}

export const oAuth = {
  google: googleOAuth,
}
