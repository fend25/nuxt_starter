import {IntlMessageFormat} from 'intl-messageformat'

export const supportedLocales = ['ru', 'en'] as const
export type ILocale = typeof supportedLocales[number]

type Leaf<Locales extends string, T extends object = any> = Partial<{ [K in Locales]: string | {msg: string, params: T} }>
type ExcludeLocales<T, Locales extends string, Value> = T extends Leaf<Locales, Value> ? T : Exclude<T, Leaf<Locales, Value>>
type ITree<Locales extends string, Value> = {
  [key: string]: ExcludeLocales<ITree<Locales, Value>, Locales, Value> | Leaf<Locales, Value>
}
export type IDictionary<Locales extends string> = ITree<Locales, string | {msg: string, params: T}>

type IIntlTree<T> = T extends Leaf<ILocale, string>
  ? IntlMessageFormat
  : { [K in keyof T]: IIntlTree<T[K]> }

const messages = {
  common: {
    hello: {
      ru: 'Привет',
      en: 'Hello',
    }
  }
} satisfies IDictionary<ILocale>

type IMessages = typeof messages


const cache = {} as { [key: string]: IntlMessageFormat }

const makeMessages = <T extends IDictionary<ILocale>>(messages: T): IIntlTree<T> => {
  const result = {} as IIntlTree<T>
  const keys = Object.keys(messages) as Array<keyof T>
  if (keys.every(key => typeof messages[key] === 'string')) {

  }
  for (const key in messages) {
    const leaf = messages[key]
    if (typeof leaf === 'string') {
      result[key] = new IntlMessageFormat(leaf)
    } else {
      result[key] = makeMessages(leaf as T)
    }
  }
  return result
}
