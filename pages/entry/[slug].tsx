import flatMap from 'lodash/flatMap'
import { GetStaticProps, InferGetStaticPropsType, GetStaticPaths } from 'next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { useTranslation } from 'next-i18next'
import Link from 'next/link'
import { getPlant, getPlantList, getCategoryList } from '@api/index'
import { Typography } from '@ui/Typography'
import { Grid } from '@ui/Grid'
import { Layout } from '@components/Layout'
import { RichText } from '@components/RichText'
import { AuthorCard } from '@components/AuthorCard'
import { PlantEntryInline } from '@components/PlantCollection'
import { Image } from '@components/Image'

type PlantEntryPageProps = {
  plant: Plant
  otherEntries: Plant[]
  categories: Category[]
}

export const getStaticProps: GetStaticProps<PlantEntryPageProps> = async ({
  params,
  preview,
  locale,
}) => {
  const slug = params?.slug

  if (typeof slug !== 'string') {
    return {
      notFound: true,
    }
  }

  try {
    const plant = await getPlant(slug, preview, locale)
    const i18nConf = await serverSideTranslations(locale!)

    const otherEntries = await getPlantList({
      limit: 5,
    })

    const categories = await getCategoryList({
      limit: 10,
    })

    return {
      props: {
        plant,
        otherEntries,
        categories,
        ...i18nConf,
      },
      revalidate: 5 * 60,
    }
  } catch (e) {
    return {
      notFound: true,
    }
  }
}

type PathType = {
  params: {
    slug: string
  }
  locale: string
}

export const getStaticPaths: GetStaticPaths = async ({ locales }) => {
  if (locales == undefined) {
    throw new Error(
      'Uh, did you forget to configure locales in your Next.js config?'
    )
  }
  const plantEntriesToGenerate = await getPlantList({ limit: 10 })

  const paths: PathType[] = flatMap(
    plantEntriesToGenerate.map(({ slug }) => ({
      params: {
        slug,
      },
    })),
    (path) => locales.map((loc) => ({ locale: loc, ...path }))
  )

  return {
    paths,
    fallback: 'blocking',
  }
}

export default function PlantEntryPage({
  plant,
  otherEntries,
  categories,
}: InferGetStaticPropsType<typeof getStaticProps>) {
  const { t } = useTranslation(['page-plant-entry'])
  if (plant == null) {
    return (
      <Layout>
        <p>404</p>
      </Layout>
    )
  }
  return (
    <Layout>
      <Grid container spacing={4}>
        <Grid item xs={12} md={8} lg={9} component="article">
          <figure>
            <Image
              width={952}
              aspectRatio="4:3"
              layout="intrinsic"
              src={plant.image.url}
              alt={plant.image.title}
            />
          </figure>
          <div className="px-12 pt-8">
            <Typography variant="h2">{plant.plantName}</Typography>
          </div>
          <div className="p-10">
            <RichText richText={plant.description} />
          </div>
        </Grid>
        <Grid item xs={12} md={4} lg={3} component="aside">
          <section>
            <Typography variant="h5" component="h3" className="mb-4">
              {t('recentPosts')}
            </Typography>
            {otherEntries?.map((plantEntry) => (
              <article className="mb-4" key={plantEntry.id}>
                <PlantEntryInline {...plantEntry} />
              </article>
            ))}
          </section>
          <section className="mt-10">
            <Typography variant="h5" component="h3" className="mb-4">
              {t('categories')}
            </Typography>
            {categories?.map((category) => (
              <li key={category.id}>
                <Link passHref href={`/category/${category.slug}`}>
                  <Typography component="a" variant="h6">
                    {category.title}
                  </Typography>
                </Link>
              </li>
            ))}
          </section>
        </Grid>
      </Grid>
      <section className="my-4 border-t-2 border-b-2 border-gray-200 pt-12 pb-7">
        <AuthorCard {...plant.author} />
      </section>
    </Layout>
  )
}
