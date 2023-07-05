import {IntlMessageFormat} from 'intl-messageformat'

type Leaf<T, Language extends string> = {
  [K in Language]?: string
} & {
  params?: T
}

// lets exclude translations from non-leaf nodes
type ExcludeTranslations<T, L extends string> =
  T extends Leaf<any, L>
    ? T
    : Exclude<T, Leaf<any, L>>

type Tree<L extends string> = {
  [key: string]: ExcludeTranslations<Tree<L>, L> | Leaf<any, L>
}

// type Params<T> = T extends Leaf<infer U, any> ? U : never

type TranslatedTree<T extends Tree<L>, L extends string> = {
  [K in keyof T]: T[K] extends Tree<L>
    ? TranslatedTree<T[K], L>
    : T[K] extends Leaf<infer P, L>
      // ? (params: Params<T[K]> extends (unknown | undefined) ? undefined : Params<T[K]>) => string
      ? (params: P) => string
      : never
}

const isLeaf = <T, L extends string>(node: any, locales: L[] | readonly L[]): node is Leaf<T, L> => {
  if (typeof node !== 'object' || node === null) {
    return false
  }
  const keys = Object.keys(node) as Array<keyof T>
  if (keys.length === 0) {
    return false
  }

  const possibleLeafKeys = [...locales, 'params']

  //check that keys are only from PossibleLeafKeys and there are no other keys
  return keys.every(key => possibleLeafKeys.includes(key as string))
}


type Formatter<T extends any[] = any[]> = (...params: T) => string
type ICache<T extends any[] = any[]> = { [key: string]: Formatter<T> }

const transformLeaf = <L extends string, T extends any[]>(
  leaf: Leaf<T, L>,
  language: L,
  defaultLanguage: L,
  cache: ICache<T>,
  key: string,
) => {
  if (cache[key]) {
    return cache[key]
  }
  const message = leaf[language] || leaf[defaultLanguage] || ''
  const messageFormat = new IntlMessageFormat(message)
  const fn = (...params: T) => messageFormat.format(...params) as string
  cache[key] = fn
  return fn
}

function traverseAndTransformLeaves<L extends string>(
  node: Tree<L> | Leaf<any, L>,
  locale: L,
  defaultLocale: L,
  locales: L[] | readonly L[],
  cache: ICache = {},
  path: string = locale,
): TranslatedTree<Tree<L>, L> | Formatter {
  if (isLeaf<any, L>(node, locales)) {
    return transformLeaf(
      node,
      locale,
      defaultLocale,
      cache,
      path,
    )
  }

  const transformedNode: TranslatedTree<Tree<L>, L> = {};
  for (const key in node) {
    const result = traverseAndTransformLeaves(
        node[key],
        locale,
        defaultLocale,
        locales,
        cache,
        `${path}.${key}`,
      )
    ;(transformedNode[key] as any) = 'transformedNode' in result
      ? result.transformedNode
      : result
  }


  return transformedNode
}

const transformDictToTranslations = <T extends Tree<L>, L extends string>(
  dict: T,
  locale: L,
  defaultLocale: L,
  locales: L[] | readonly L[],
  cache: ICache = {},
): TranslatedTree<Tree<L>, L> => {
  return traverseAndTransformLeaves(dict, locale, defaultLocale, locales, cache) as TranslatedTree<Tree<L>, L>
}

///////////////////////////////////////
///////////////////////////////////////
///////////////////////////////////////
///////////////////////////////////////
///////////////////////////////////////
///////////////////////////////////////
///////////////////////////////////////
///////////////////////////////////////
///////////////////////////////////////

const myLocales = ['ru', 'en'] as const
type MyLocale = typeof myLocales[number]

const dict = {
  common: {
    hello: {
      ru: 'Привет',
      en: 'Hello',
      // params: {name: 5},
    },
    withParams: {
      ru: 'Привет, {name}',
      en: 'Hello {name}',
      params: {
        name: 'string',
      }
    }
  }
} satisfies Tree<MyLocale>

const translatedTree = {
  common: {
    hello: () => new IntlMessageFormat(dict.common.hello.ru).format() as string,
    withParams: (p: { name: string }) => new IntlMessageFormat(dict.common.withParams.ru).format(p) as string,
  }
} satisfies TranslatedTree<typeof dict, MyLocale>


const cache: ICache = {}
const tr = transformDictToTranslations(
  dict,
  'ru',
  'en',
  myLocales,
  cache,
)

console.dir(tr, {depth: 100})
console.dir(cache, {depth: 100})
console.log(translatedTree.common.hello())
console.log(translatedTree.common.withParams({name: 'Vasya'}))
console.log(tr.common.hello())
console.log(tr.common.withParams({name: 'Vasya'}))
