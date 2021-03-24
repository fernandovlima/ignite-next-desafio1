import { GetStaticProps } from 'next';
import Head from 'next/head';
import { FiCalendar, FiUser } from 'react-icons/fi';
import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';

import Prismic from '@prismicio/client';
import { getPrismicClient } from '../services/prismic';

import commonStyles from '../styles/common.module.scss';

interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
}

export default function Home({ postsPagination }: HomeProps) {
  const { results, next_page } = postsPagination;
  const hasNextPage = !!next_page;

  return (
    <>
      <Head>
        <title>Space Travelling</title>
      </Head>

      <main className={commonStyles.contentContainer}>
        {results.map(post => (
          <div className={commonStyles.postContainer}>
            <p>{post.data.title}</p>
            <span>{post.data.subtitle}</span>
            <div className={commonStyles.postFooter}>
              <div>
                <FiCalendar />
                <span>
                  {format(new Date(post.first_publication_date), 'd MMM yyyy', {
                    locale: ptBR,
                  })}
                </span>
              </div>
              <div>
                <FiUser />
                <span>{post.data.author}</span>
              </div>
            </div>
          </div>
        ))}
        {hasNextPage && (
          <button type="button" className={commonStyles.loadMoreBtn}>
            Carregar mais posts
          </button>
        )}
      </main>
    </>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient();
  const postsResponse = await prismic.query(
    Prismic.Predicates.at('document.type', 'posts'),
    { pageSize: 10 }
  );

  const postsPagination = {
    next_page: postsResponse.next_page,
    results: postsResponse.results,
  };

  return {
    props: {
      postsPagination,
    },
  };
};
