import React from "react";
import useSWR from 'swr';
import fetch from 'unfetch';
const fetcher = (url: string) => fetch(url).then(r => r.json());

const Index = () => {
  const { data, error } = useSWR('/api/products', fetcher);

  if (error) { return <div>failed to load</div>; };
  if (!data) { return <div>loading...</div>; };
  return <div>data:{JSON.stringify(data)}!</div>;
};

export default Index;
