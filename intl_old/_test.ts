import {IntlMessageFormat} from 'intl-messageformat'
import {FormatXMLElementFn, PrimitiveType} from 'intl-messageformat/src/formatters'
import {ILocale} from '~/intl_old/_base'

type IMFParams<T = void> = Record<string, PrimitiveType | T | FormatXMLElementFn<T>> | undefined

const messageWithParam = <T>(msg: string) => {
  return (values: IMFParams<T>) => {
    return new IntlMessageFormat(msg).format(values)
  }
}

const messagesWithParam = <T>(messages: {[K in ILocale]: string}) => {
  return messages
}

const messages = {
  common: {
    hello: {
      ru: 'Привет',
      en: 'Hello',
    },
    bye: {
      ru: messageWithParam<{name: string}>('Пока {name}'),
      en: messageWithParam<{name: string}>('Bye {name}'),
    },
    yo: messagesWithParam<{bro: string}>({
      ru: 'Йо {bro}',
      en: 'Yo {bro}',
    }),
  }
}

messages.common.bye.ru({name2: 'Вася'})

const obj = {
  a: [1],
  b: ['s'],
  c: [2],
  d: {
    e: [3],
    f: ['s'],
    g: {
      h: [4],
    }
  }
}
type IObj = typeof obj

//make a type which will recursively infer array type from every leaf in IObj
type IArray<T> = T extends Array<infer U> ? U : never
type IArrayTree<T> = {
  [K in keyof T]: T[K] extends Array<any> ? IArray<T[K]> : IArrayTree<T[K]>
}


type Leaf<S extends Array<any>> = Partial<{ [K in ILocale]: string | {msg: {[K in ILocale]: string}, params: (...p: S) => void} }>
type ExcludeLocales<T, S extends Array<any> = []> = T extends Leaf<infer S> ? T : Exclude<T, Leaf<S>>
type ITree = {
  [key: string]: ExcludeLocales<ITree> | Leaf<[]>
}

const dict2 = {
  common: {
    hello: {
      ru: 'Привет',
      en: 'Hello',
    },
    bye: {
      msg: {
        ru: 'Пока {name}',
        en: 'Bye {name}',
      },
      params: (name: string) => {}
    }
  }
} satisfies ITree
