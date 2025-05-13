import HomePage from '@/components/Home';
import Layout from '@/components/Layout/Layout';
import axios from 'axios';
import { Suspense } from 'react';
import Loading from '@/components/Loader/Loading';

export const revalidate = 3600;

export const generateMetadata = async () => {
  try {
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_API_URL}${process.env.NEXT_PUBLIC_END_POINT}seo-settings?page=home`
    );
    const home = response?.data?.data[0];
    const title = home?.title || process.env.NEXT_PUBLIC_META_TITLE;
    const description = home?.description || process.env.NEXT_PUBLIC_META_DESCRIPTION;
    const keywords = home?.keywords || process.env.NEXT_PUBLIC_META_kEYWORDS;
    
    return {
      title,
      description,
      keywords,
      openGraph: {
        title,
        description,
        images: home?.image ? [home?.image] : [],
        type: 'website',
        locale: 'en_US',
        siteName: process.env.NEXT_PUBLIC_SITE_NAME,
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: home?.image ? [home?.image] : [],
      },
      alternates: {
        canonical: process.env.NEXT_PUBLIC_WEB_URL,
      },
    };
  } catch (error) {
    console.error("Error fetching MetaData:", error);
    return null;
  }
};

const fetchData = async () => {
  try {
    const [categoriesResponse, productsResponse, featuredResponse] = await Promise.all([
      axios.get(`${process.env.NEXT_PUBLIC_API_URL}${process.env.NEXT_PUBLIC_END_POINT}get-categories`, {
        params: { page: 1 }
      }),
      axios.get(`${process.env.NEXT_PUBLIC_API_URL}${process.env.NEXT_PUBLIC_END_POINT}get-item`, {
        params: { page: 1 }
      }),
      axios.get(`${process.env.NEXT_PUBLIC_API_URL}${process.env.NEXT_PUBLIC_END_POINT}get-featured-section`)
    ]);

    return {
      categories: categoriesResponse?.data?.data?.data || [],
      products: productsResponse?.data?.data?.data || [],
      featured: featuredResponse?.data?.data || []
    };
  } catch (error) {
    console.error('Error fetching data:', error);
    return {
      categories: [],
      products: [],
      featured: []
    };
  }
};

const generateJsonLd = (categories, products, featuredItems) => ({
  "@context": "https://schema.org",
  "@type": "ItemList",
  itemListElement: [
    ...categories.map((category, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: {
        "@type": "Thing",
        name: category?.name,
        url: `${process.env.NEXT_PUBLIC_WEB_URL}/category/${category?.slug}`
      }
    })),
    ...products.map((product, index) => ({
      "@type": "ListItem",
      position: categories?.length + index + 1,
      item: {
        "@type": "Product",
        name: product?.name,
        productID: product?.id,
        description: product?.description,
        image: product?.image,
        url: `${process.env.NEXT_PUBLIC_WEB_URL}/product-details/${product?.slug}`,
        category: product?.category?.name,
        "offers": {
          "@type": "Offer",
          price: product?.price,
          priceCurrency: "USD",
          availability: product?.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock"
        },
        countryOfOrigin: product?.country,
        brand: {
          "@type": "Brand",
          name: product?.brand || "Generic"
        }
      }
    })),
    ...featuredItems.map((item, index) => ({
      "@type": "ListItem",
      position: categories.length + products.length + index + 1,
      item: {
        "@type": "Product",
        name: item?.name,
        productID: item?.id,
        description: item?.description,
        image: item?.image,
        url: `${process.env.NEXT_PUBLIC_WEB_URL}/product-details/${item?.slug}`,
        category: item?.category?.name,
        "offers": {
          "@type": "Offer",
          price: item?.price,
          priceCurrency: "USD",
          availability: item?.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock"
        },
        countryOfOrigin: item?.country,
        brand: {
          "@type": "Brand",
          name: item?.brand || "Generic"
        }
      }
    }))
  ]
});

const Home = async () => {
  const { categories, products, featured } = await fetchData();
  
  const existingSlugs = new Set(products.map(product => product.slug));
  const featuredItems = featured.flatMap(section => 
    section.section_data
      .slice(0, 4)
      .filter(item => !existingSlugs.has(item.slug))
      .map(item => {
        existingSlugs.add(item.slug);
        return item;
      })
  );

  const jsonLd = generateJsonLd(categories, products, featuredItems);

  return (
    <>
      <script 
        type="application/ld+json" 
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} 
      />
      <Layout>
        <Suspense fallback={<Loading />}>
          <HomePage 
            categories={categories}
            products={products}
            featuredItems={featuredItems}
          />
        </Suspense>
      </Layout>
    </>
  );
};

export default Home;

