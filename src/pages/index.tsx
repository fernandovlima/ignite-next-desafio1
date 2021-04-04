import { useState } from 'react';
import { GetStaticProps } from 'next';
import Link from 'next/link';
import Head from 'next/head';
import { FiCalendar, FiUser } from 'react-icons/fi';
import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';

import Prismic from '@prismicio/client';
import { getPrismicClient } from '../services/prismic';

import Header from '../components/Header';

import styles from './home.module.scss';

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
  const [posts, setPosts] = useState<Post[]>(results);
  const [hasNextPage, setHasNextPage] = useState<boolean>(!!next_page);
  const [fetchMoreUrl, setFetchMoreUrl] = useState<string>(next_page);

  const fetchMorePosts = async () => {
    if (fetchMoreUrl) {
      const res = await fetch(fetchMoreUrl).then(result => result.json());

      const newPosts = [...posts, ...res.results];
      setPosts(newPosts);

      if (res.next_page) {
        setFetchMoreUrl(res.next_page);
      }

      if (!res.next_page) {
        setHasNextPage(false);
      }
    }
  };

  return (
    <>
      <Head>
        <title>Space Travelling</title>
      </Head>

      <Header />
      <main className={styles.contentContainer}>
        {posts.map(post => (
          <div className={styles.postContainer} key={post.uid}>
            <Link href={`/post/${post.uid}`}>
              <a>{post.data.title}</a>
            </Link>
            <span>{post.data.subtitle}</span>
            <div className={styles.postFooter}>
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
          <button
            type="button"
            className={styles.loadMoreBtn}
            onClick={fetchMorePosts}
          >
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
    { pageSize: 5 }
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
