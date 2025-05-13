"use client";
import { useRef, useCallback, memo } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/autoplay";
import Image from "next/image";
import { placeholderImage, useIsRtl } from "@/utils";
import { RiArrowLeftLine, RiArrowRightLine } from "react-icons/ri";
import Link from "next/link";
import { Autoplay, Navigation, EffectFade } from "swiper/modules";
import { userSignUpData } from "@/redux/reuducer/authSlice";
import { useSelector } from "react-redux";
import { motion } from "framer-motion";

const OfferSlider = memo(({ sliderData }) => {
  const swiperRef = useRef();
  const isRtl = useIsRtl();
  const userData = useSelector(userSignUpData);

  const swipePrev = useCallback(() => {
    if (swiperRef?.current) {
      swiperRef.current.slidePrev();
    }
  }, []);

  const swipeNext = useCallback(() => {
    if (swiperRef?.current) {
      swiperRef.current.slideNext();
    }
  }, []);

  const breakpoints = {
    0: {
      slidesPerView: 1,
      spaceBetween: 10,
    },
    768: {
      slidesPerView: 1.2,
      spaceBetween: 20,
    },
    1400: {
      slidesPerView: 1.5,
      spaceBetween: 30,
    },
  };

  const getHref = useCallback((ele) => {
    if (ele?.model_type === "App\\Models\\Item") {
      if (userData && userData?.id === ele?.model?.user_id) {
        return `/my-listing/${ele?.model?.slug}`;
      }
      return `/product-details/${ele?.model?.slug}`;
    }
    if (ele?.model_type === null) {
      return ele?.third_party_link;
    }
    if (ele?.model_type === "App\\Models\\Category") {
      return `/category/${ele.model.slug}`;
    }
    return "/";
  }, [userData]);

  if (!sliderData || sliderData.length === 0) {
    return null;
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="offer_slider pop_categ_mrg_btm my-0"
    >
      <div className="container">
        <div className="row">
          <div className="col-12">
            <div className="offer_slider_swiper">
              <Swiper
                onSwiper={(swiper) => {
                  swiperRef.current = swiper;
                }}
                dir={isRtl ? "rtl" : "ltr"}
                spaceBetween={20}
                slidesPerView={1}
                modules={[Navigation, Autoplay, EffectFade]}
                breakpoints={breakpoints}
                autoplay={{
                  delay: 5000,
                  disableOnInteraction: false,
                  stopOnLastSlide: false,
                }}
                effect="fade"
                fadeEffect={{
                  crossFade: true
                }}
                slideToClickedSlide={true}
                key={isRtl}
                className="offer-slider-swiper"
              >
                {sliderData.map((ele, index) => {
                  const href = getHref(ele);
                  const isExternal = ele?.model_type === null;
                  
                  return (
                    <SwiperSlide key={index}>
                      <Link
                        href={href}
                        target={isExternal ? "_blank" : ""}
                        rel={isExternal ? "noopener noreferrer" : ""}
                        className="offer-slider-link"
                      >
                        <div className="offer-slider-image-wrapper">
                          <Image
                            src={ele.image}
                            width={983}
                            height={493}
                            alt={ele.id}
                            className="offer_slider_img"
                            onError={placeholderImage}
                            priority={index === 0}
                            loading={index === 0 ? "eager" : "lazy"}
                            quality={90}
                          />
                          {ele.title && (
                            <div className="offer-slider-content">
                              <h2 className="offer-slider-title">{ele.title}</h2>
                              {ele.description && (
                                <p className="offer-slider-description">{ele.description}</p>
                              )}
                            </div>
                          )}
                        </div>
                      </Link>
                    </SwiperSlide>
                  );
                })}
              </Swiper>
              {sliderData.length > 1 && (
                <>
                  <button
                    className="pop_cat_btns pop_cat_left_btn"
                    onClick={swipePrev}
                    aria-label="Previous slide"
                  >
                    <RiArrowLeftLine size={24} color="white" />
                  </button>
                  <button
                    className="pop_cat_btns pop_cat_right_btn"
                    onClick={swipeNext}
                    aria-label="Next slide"
                  >
                    <RiArrowRightLine size={24} color="white" />
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
});

OfferSlider.displayName = 'OfferSlider';

export default OfferSlider;
