// src/app/blog/[slug]/page.tsx

type Post = {
  id: number;
  slug: string;
  title: { rendered: string };
  content: { rendered: string };
};

// 👇 Cambiamos el tipo para reflejar que params es una Promesa
export default async function PostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  // 👇 Esperamos la promesa de params antes de usarla
  const { slug } = await params;

  // Fetch del post desde WordPress usando el slug
  const res = await fetch(
    `https://tortascondiseno.infinityfreeapp.com/wp-json/wp/v2/pages?slug=${slug}`,
    { next: { revalidate: 60 } } // revalida cada 60s
  );

  const post: Post[] = await res.json();
  const data = post[0];

  if (!data) return <div>Post no encontrado</div>;

  return (
    <div style={{ padding: "2rem" }}>
      <h1 dangerouslySetInnerHTML={{ __html: data.title.rendered }} />
      <div dangerouslySetInnerHTML={{ __html: data.content.rendered }} />
    </div>
  );
}

// ⚙️ Esto genera las rutas estáticas a partir de los slugs de WordPress
export async function generateStaticParams() {
  const res = await fetch(
    "https://tortascondiseno.infinityfreeapp.com/wp-json/wp/v2/pages"
  );
  const posts: Post[] = await res.json();

  return posts.map((post) => ({
    slug: post.slug,
  }));
}
