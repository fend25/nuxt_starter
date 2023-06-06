import {oAuth} from '~/server/utils/oauth'
import {getRandomValues} from 'node:crypto'
import {redirectToUserSpace} from '~/server/utils/redirects'
import {SUPPORTED_LOCALES} from '~/translations/supportedLocales'
import {OpenIdProvider, SessionTokenType} from '@prisma/client'
import {SESSION_TOKEN_COOKIE_NAME} from '~/shared/constants'

export default defineEventHandler(async event => {
  const provider = event.context.params?.provider
  const query = getQuery(event)

  if (provider === 'google') {
    if (typeof query.code !== 'string') {
      throw new Error('No code')
    }

    const {auth} = useRuntimeConfig()

    const {userInfo, credentials} = await oAuth.google.getUserInfoByGoogleCode(query.code, auth.google)
    if (!userInfo.email) {
      throw new Error('No email')
    }

    // const EXAMPLE_USER_INFO = {
    //   'id': '123123123123123123123',
    //   'email': 'guess@example.com',
    //   'verified_email': true,
    //   'name': 'Name Surname',
    //   'given_name': 'Name',
    //   'family_name': 'Surname',
    //   'picture': 'https://lh3.googleusercontent.com/a-/AD_cMMRhAdizTH7j3Cc7OoGK0PZHgoiJ7WBo04gz72Bqeb0Z6t5s05PxXobeXbaY04D2SbJxruN9GW7HK5turFvFKgvesp3MA53_htChnwGqEdW17d7jpWUycS6VU7eZQ_79DGjSyokR2eIf9eLAxtCVVSOI_J-BFTyHzYAzGY0_rC7IxzCdFp-5l52Ai3aYgT1XRqSTAABnGoyLgTm57VB01En0eliU-DWmcChZ-DTSfhgbE9FntyX-RhQK42glgY38E7RbJuyuKXgAMRmmpTD1Xvt55tOmNUggaR4-I2tFGSNzzBI_5UcuqkK9kL71v8jfs9ilGgyIe4d8mGW3QwIeoLFgGFh6u335iv_b496SOayT-LbfU-BIz3rxCV_gty2j6R_SNljeabZWFbzyvNZ9JGw_p6BZ8vVR-CXwHB-wp0ijCpFpRfSKbjkv8vNT4kfK_q_fbptQiQE9iXfW8tGcwped2PD7yZPSkYaDLpbpeF0LVfgyposiv7_MDuP2rx4R_1qiOKceNPiDD9I7WVGZDwQDhJjGISBpW3iNZ0ap8M3xX55YkQln5uC4sqLc49xDkHLmo5-upMLF_3UBKZL6mfcLNTxqaaaDrbkWixAbAUXUKeE2tESAAgScIo_xCcFeVb_SK9vWgIcmCWrQ4gUnrTiVy-R9atKKJeSfvt2Rb4iEoahTB-DyvEnz22QnslhCjGXZZV-SUOxTERtsCVfNlg9axWgWK8uvAD3Yh0sf0q1pMa2j64CRRKbrn-rYOSJM7o20F1P_celuby-23zsnEdnxiSaRDauGvPXU7C3LWRT_41eADyQejz03O9U5wgLUNn6eCX185Xakaqi25NDZ3tzqT47Z9eE06zc4rg2KsaAN1vUJqbo97ftuL-qypjdNeH0GHFQHG39ZvfaecMaY0RDiWws1nwFoJ4YCA4-pFEhhWsnO8DpOft962fVV=s96-c',
    //   'locale': 'en',
    //   'hd': 'example.com'
    // }

    const email = userInfo.email
    const firstName = userInfo.given_name || null
    const lastName = userInfo.family_name || null
    const fullName = userInfo.name || `${firstName || ''} ${lastName || ''}`.trim() || null
    const avatarUrl = userInfo.picture || null
    const localeFromUserInfo = userInfo.locale?.split('-')[0]
    const language = localeFromUserInfo && SUPPORTED_LOCALES.includes(localeFromUserInfo)
      ? localeFromUserInfo
      : 'en'

    let user = await prisma.user.findFirst({
      where: {email}
    })
    let openIdAccount = await event.context.prisma.openIdAccount.findFirst({
      where: {email: userInfo.email}
    })

    if (!openIdAccount) {
      if (!user) {
        user = await event.context.prisma.user.create({
          data: {
            email,
            firstName,
            lastName,
            fullName,
            language,
            avatarUrl,
            userRoles: {
              create: [
                {role: {connect: {roleName: 'user'}}},
              ]
            }
          }
        })
        if (!user) {
          throw new Error('Failed to create user')
        }
      }

      openIdAccount = await event.context.prisma.openIdAccount.create({
        data: {
          userId: user.userId,

          provider: OpenIdProvider.google,
          accountId: userInfo.id,

          lastName,
          firstName,
          fullName,
          email,
          avatarUrl,

          refreshToken: credentials.refresh_token,
          accessToken: credentials.access_token,
          accessTokenExpires: new Date(credentials.expiry_date || Date.now()),
          scope: credentials.scope,
        },
      })
      if (!openIdAccount) {
        throw new Error('Failed to create openIdAccount')
      }
    }

    const {userId} = user!
    const sessionToken = getRandomValues(new Buffer(32)).toString('hex')
    const expires = new Date(Date.now() + (1000 * 60 * 60 * 24 * 365 * 10)) // 10 years

    await event.context.prisma.session.create({
      data: {
        userId,
        type: SessionTokenType.cookie,
        name: SESSION_TOKEN_COOKIE_NAME,
        value: sessionToken,
        expires,
      }
    })

    setCookie(event, SESSION_TOKEN_COOKIE_NAME, sessionToken, {expires})
  } else {
    throw new Error('Unknown provider')
  }

  return await redirectToUserSpace(event)
})
