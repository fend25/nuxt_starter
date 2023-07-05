import {IntlMessageFormat} from 'intl-messageformat'

type ILanguage = 'ru' | 'en'
type IDefault = 'en'
const Languages = ['ru', 'en'] as ILanguage[]
const PossibleLeafKeys = [...Languages, 'params']

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

const dict = {
  common: {
    hello: {
      ru: 'Привет, {name}',
      en: 'Hello {name}',
      params: 5,
    },
    withParams: {
      ru: 'Привет, {name}',
      en: 'Hello {name}',
      params: {
        name: 'string',
      }
    }
  }
} satisfies Tree<ILanguage>

const translatedTree = {
  common: {
    hello: (n: number) => ``,
    withParams: (p: { name: string }) => ``,
  }
} satisfies TranslatedTree<typeof dict, ILanguage>


const isLeaf = <T, L extends string>(node: any): node is Leaf<T, L> => {
  if (typeof node !== 'object' || node === null) {
    return false
  }
  const keys = Object.keys(node) as Array<keyof T>
  if (keys.length === 0) {
    return false
  }

  //check that keys are only from PossibleLeafKeys and there are no other keys
  return keys.every(key => PossibleLeafKeys.includes(key as string))
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
  cache: ICache = {},
  key = `${locale}.`
): Tree<L> | Formatter {
  if (isLeaf<any, L>(node)) {
    return transformLeaf(
      node,
      locale,
      defaultLocale,
      cache,
      key,
    )
  }

  const transformedNode:TranslatedTree<Tree<L>, L> = {};
  for (const key in node) {
    transformedNode[key] = traverseAndTransformLeaves(node[key]);
  }

  return transformedNode;
}

// write a function which will make translatedTree from dict
const makeTranslatedTree = <T extends Tree<Locales>, Locales extends string>(
  language: Locales,
  defaultLanguage: Locales,
  tree: T,
  result: TranslatedTree<T, Locales>,
  previousPath: string[] = [],
): TranslatedTree<T, Locales> => {
  for (const key in tree) {
    const node = tree[key]
    const currentPath = [...previousPath, key]

    if (typeof node !== 'object') {
      throw new Error(`Node ${key} is not an object`)
    }
    if (isLeaf(node)) {
      const message = node[language] || node[defaultLanguage]
      if (typeof message !== 'string') {
        throw new Error(`Translation for ${key} is missing in ${language}`)
      }
      setValueByPath(
        result,

      )
      result[key] = (
        (...params: any[]) => new IntlMessageFormat(message).format(...params)
      ) as any
    }

    //if nodeKeys has keys only from possibleLeafKeys
    if (nodeKeys.every(nodeKey => possibleLeafKeys.includes(nodeKey as string))) {

    } else {
    }


    if (typeof node === 'string') {
      result[key] = () => node
    } else if (typeof node === 'object') {
      result[key] = makeTranslatedTree(node)
    } else {
      result[key] = (params) => node(params)
    }
  }
  return result
}

/*function translateTree<Language extends string, T extends Tree<any>>(tree: T): TranslatedTree<T, Language> {
  const translated: TranslatedTree<T, Language> = {} as TranslatedTree<T, Language>

  for (const key in tree) {
    if (tree.hasOwnProperty(key)) {
      const node = tree[key]

      if (typeof node === 'object') {
        if ('params' in node) {
          translated[key] = (params) => {
            const translation = node[translator]
            if (typeof translation !== 'string') {
              throw new Error(`Translation for ${key} is missing in ${translator}`)
            }
            if (params && node.params) {
              let translatedText = translation
              for (const paramKey in node.params) {
                translatedText = translatedText.replace(`{${paramKey}}`, params[paramKey])
              }
              return translatedText
            }
            return translation
          }
        } else {
          translated[key] = translateTree(node, translator)
        }
      } else {
        translated[key] = () => node
      }
    }
    }
  return translated
}

*/

