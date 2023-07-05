import {IntlMessageFormat} from 'intl-messageformat'

type Leaf<T, Locale extends string, DefaultLocale extends string> = {
  [K in DefaultLocale]: string
} & {
  [K in Locale]?: string
} & {
  param?: T
}

type IDict<L extends string, D extends L> = {
  [key: string]: Leaf<object, L, D>
}

type ITranslators<T extends IDict<L, D>, L extends string, D extends L> = {
  [key in keyof T]: T[key] extends { param: infer P }
    ? (param: P) => string
    : () => string
}

/////////////////////////////////////////
/////////////////////////////////////////
/////////////////////////////////////////

type Formatter<T extends any> = T extends (undefined | never) ? () => string : (param: T) => string
type ICache<T extends any = any> = { [key: string]: Formatter<T> }

const getFormatter = <T extends any, L extends string, D extends L>(
  leaf: Leaf<T, L, D>,
  language: L,
  defaultLanguage: L,
  cache: ICache<T>,
  tag: string,
  key: string,
) => {
  if (cache[key]) {
    return cache[key]
  }
  const message = leaf[language] || leaf[defaultLanguage] || ''
  const messageFormat = new IntlMessageFormat(message)
  const fn = (param: T) => messageFormat.format(param as any) as string
  cache[`${tag}.${key}.${language}`] = fn as any
  return fn
}

const randomHash = (tag: string = (0.5 + Math.random()).toString(36).substring(2)) => tag

// function which will convert dict to translators
const createTranslatorsForOneLocale = <T extends IDict<L, D>, L extends string, D extends L>(
  dict: T,
  language: L,
  defaultLanguage: D,
  tag: string,
  cache: ICache,
): ITranslators<T, L, D> => {
  const translators = {} as ITranslators<T, L, D>
  for (const key in dict) {
    translators[key] = getFormatter(dict[key], language, defaultLanguage, cache, tag, key) as any
  }
  return translators as ITranslators<T, L, D>
}

const createTranslators = <T extends { [K in string]: IDict<L, D> }, L extends string, D extends L>(
  dictObject: T,
  locales: L,
  defaultLocale: D,
  initialLocale: D,
  cache: ICache = {}
) => {
  const readyTranslations = {} as {
    [K in L]: { [K in keyof T]: ITranslators<T[K], L, D> }
  }
  readyTranslations[initialLocale] = createTranslatorsForOneLocale(
    dict,
    initialLocale,
    defaultLocale,
    'root',
    cache
  )
  const result = {
    locale: initialLocale,
    setLocale(newLocale: D) {
      readyTranslations[newLocale] = createTranslatorsForOneLocale(
        dict,
        newLocale,
        defaultLocale,
        'root',
        cache
      )
      result.locale = newLocale
    },
    get translations() {
      return readyTranslations[result.locale]
    },
  }

  return result
}

/////////////////////////////////////////
/////////////////////////////////////////
/////////////////////////////////////////

const myLocales = ['ru', 'en'] as const
type MyLocale = typeof myLocales[number]

const dict = {
  hello: {
    ru: 'Привет',
    en: 'Hello',
  },
  withParams: {
    ru: 'Привет, {name}',
    en: 'Hello {name}',
    param: {name: 'string'},
  },
  withNum: {
    ru: 'Привет, {name}, у тебя {num, plural, one {# яблоко} few {# яблока} many {# яблок} other {# яблока}}',
    en: 'Hello {name}, you have {num, plural, one {# apple} few {# apples} many {# apples} other {# apples}}',
    param: {name: '', num: 0},
  },
  withNumSimple: {
    ru: '{num}',
    en: '{num}',
    param: {num: 0},
  },
} satisfies IDict<MyLocale, 'en'>

// const translators = {
//   hello: () => new IntlMessageFormat(dict.hello.ru).format() as string,
//   withParams: (params: typeof dict.withParams.param) => new IntlMessageFormat(dict.withParams.ru).format(params) as string,
// } satisfies ITranslators<typeof dict, MyLocale, 'en'>
// console.log(translators.hello())
// console.log(translators.withParams({name: 'Vasya'}))

const cacheFlat = {} as ICache
const trFlat = createTranslatorsForOneLocale(dict, 'ru' as MyLocale, 'en', 'root', cacheFlat)

console.log(trFlat.hello())
console.log(trFlat.withParams({name: 'Vasya'}))
console.log(trFlat.withNumSimple({num: 5}))
console.log(trFlat.withNum({name: 'Vasya', num: -1}))
console.log(trFlat.withNum({name: 'Vasya', num: 0}))
console.log(trFlat.withNum({name: 'Vasya', num: 1}))
console.log(trFlat.withNum({name: 'Vasya', num: 2}))
console.log(trFlat.withNum({name: 'Vasya', num: 5}))

const all = createTranslators(
  {common: dict},
  myLocales,
  'en',
  'ru',
  cacheFlat
)
let tr = all.translations

console.log(tr.common.hello())
all.setLocale('en')
console.log(tr.common.hello())
