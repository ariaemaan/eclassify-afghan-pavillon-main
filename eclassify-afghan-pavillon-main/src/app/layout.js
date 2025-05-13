import { Providers } from "@/redux/store/providers";
import "../../public/css/style.css";
import "bootstrap/dist/css/bootstrap.css";
import Head from "next/head";
import { Toaster } from "react-hot-toast";
import 'react-loading-skeleton/dist/skeleton.css'
import axios from "axios";
import Script from "next/script";

export const revalidate = 3600;

export const generateMetadata = async () => {
  try {
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_API_URL}${process.env.NEXT_PUBLIC_END_POINT}get-system-settings`
    );
    const favicon = response?.data?.data?.favicon_icon;
    const placeApiKey = response?.data?.data?.place_api_key;
    const siteName = response?.data?.data?.site_name || "E-Classify";
    const description = response?.data?.data?.meta_description || "Your trusted marketplace for classified ads";
    
    return {
      title: {
        default: siteName,
        template: `%s | ${siteName}`
      },
      description,
      icons: [
        {
          url: favicon,
          type: 'image/x-icon'
        }
      ],
      placeApiKey,
      viewport: {
        width: 'device-width',
        initialScale: 1,
        maximumScale: 1
      },
      themeColor: '#ffffff',
      manifest: '/manifest.json',
      openGraph: {
        type: 'website',
        locale: 'en_US',
        url: process.env.NEXT_PUBLIC_SITE_URL,
        siteName,
        description,
        images: [
          {
            url: favicon,
            width: 800,
            height: 600,
            alt: siteName
          }
        ]
      }
    }
  } catch (error) {
    console.error("Error fetching MetaData:", error);
    return null;
  }
};

export default async function RootLayout({ children }) {
  const metadata = await generateMetadata();
  const placeApiKey = metadata?.placeApiKey;

  return (
    <html lang="en" web-version={process.env.NEXT_PUBLIC_WEB_VERSION}>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
        <meta name="theme-color" content="#ffffff" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
        <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet" />
        <link rel="stylesheet" href="https://unpkg.com/aos@next/dist/aos.css" />
        <meta name="stripe-public-key" content={process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY} />
        <meta name="paypal-client-id" content={process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID} />
      </head>
      <body>
        <Providers>
          <Toaster 
            position="top-center" 
            reverseOrder={false}
            toastOptions={{
              duration: 3000,
              style: {
                background: '#333',
                color: '#fff',
                borderRadius: '8px',
                padding: '16px',
              },
            }}
          />
          {children}
        </Providers>

        <Script 
          src="https://js.stripe.com/v3/"
          strategy="lazyOnload"
        />
        <Script 
          src={`https://www.paypal.com/sdk/js?client-id=${process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID}&currency=USD`}
          strategy="lazyOnload"
        />
        <Script 
          src="https://js.paystack.co/v1/inline.js"
          strategy="lazyOnload"
        />
        <Script 
          src={`https://maps.googleapis.com/maps/api/js?key=${placeApiKey}&libraries=places&loading=async`}
          strategy="lazyOnload"
        />
        <Script 
          src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"
          strategy="lazyOnload"
        />
        <Script 
          src="https://unpkg.com/aos@next/dist/aos.js"
          strategy="lazyOnload"
          onLoad={() => {
            if (typeof window !== 'undefined') {
              window.AOS.init({
                duration: 800,
                once: true,
                offset: 100,
              });
            }
          }}
        />
      </body>
    </html>
  );
}

