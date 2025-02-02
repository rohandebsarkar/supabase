import toc from 'markdown-toc'
import { MDXRemote } from 'next-mdx-remote'
import { serialize } from 'next-mdx-remote/serialize'
import components from '../components/index'
import NewLayout from '~/layouts/DefaultGuideLayout'

import Layout from '~/layouts/Default'
import { getAllDocs, getDocsBySlug } from '../lib/docs'

interface Meta {
  id: string
  title: string
  sidebar_label: string
  hide_table_of_contents: boolean
}

interface Props {
  meta: Meta
  content: any
  toc: any
}
const isNewDocs = process.env.NEXT_PUBLIC_NEW_DOCS === 'true'

export default function Doc({ meta, content, toc }: Props) {
  return (
    // @ts-ignore
    <>
      {Object.entries(meta).length > 0 || !isNewDocs ? (
        <Layout meta={meta} toc={toc}>
          <MDXRemote {...content} components={components} />
        </Layout>
      ) : (
        <NewLayout meta={meta} toc={toc}>
          <MDXRemote {...content} components={components} />
        </NewLayout>
      )}
    </>
  )
}

export async function getStaticProps({ params }: { params: { slug: string[] } }) {
  let slug
  if (params.slug.length > 1) {
    slug = `docs/${params.slug.join('/')}`
  } else {
    slug = `docs/${params.slug[0]}`
  }

  let doc = getDocsBySlug(slug)
  const content = await serialize(doc.content || '')

  return {
    props: {
      ...doc,
      content,
      toc: toc(doc.content, { maxdepth: 1, firsth1: false }),
    },
  }
}

export function getStaticPaths() {
  let docs = getAllDocs()

  return {
    paths: docs.map(() => {
      return {
        params: {
          slug: docs.map((d) => d.slug),
        },
      }
    }),
    fallback: 'blocking',
  }
}
