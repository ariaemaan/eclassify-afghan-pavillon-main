import React, { useEffect, useState, useCallback, useRef, memo } from "react";
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/navigation';
import { RiArrowLeftLine, RiArrowRightLine } from "react-icons/ri";
import { t, useIsRtl } from "@/utils";
import { categoryApi } from "@/utils/api";
import { useDispatch, useSelector } from "react-redux";
import { CurrentPage, setCatCurrentPage, setCatLastPage, setCateData } from "@/redux/reuducer/categorySlice";
import { CurrentLanguageData } from "@/redux/reuducer/languageSlice";
import PopularCategoriesSkeleton from "../Skeleton/PopularCategoriesSkeleton";
import PopularCategory from "./PopularCategory";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-hot-toast";

const PopularCategories = memo(({ categories }) => {
  const dispatch = useDispatch();
  const swiperRef = useRef();
  const isRtl = useIsRtl();
  const [isLoading, setIsLoading] = useState(true);
  const [cateData, setCatData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [cachedData, setCachedData] = useState({});
  const [isBeginning, setIsBeginning] = useState(true);
  const [isEnd, setIsEnd] = useState(false);
  const currentLanguage = useSelector(CurrentLanguageData);
  const catCurrentPage = useSelector(CurrentPage);
  const [prevLang, setPrevLang] = useState(currentLanguage);

  const getCategoriesData = useCallback(async (page) => {
    if (prevLang?.id !== currentLanguage?.id) {
      setIsLoadingMore(true);
      try {
        const response = await categoryApi.getCategory({ page: `${page}` });
        const { data } = response.data;
        if (data && Array.isArray(data.data)) {
          setCachedData(prev => ({
            ...prev,
            [page]: data.data
          }));
          setCatData(Object.values(data.data).flat());
          if (page > catCurrentPage) {
            dispatch(setCateData(data.data));
            dispatch(setCatCurrentPage(data?.current_page));
            dispatch(setCatLastPage(data?.last_page));
          }
          setLastPage(data.last_page);
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
        toast.error("Failed to load categories");
      } finally {
        setIsLoading(false);
        setIsLoadingMore(false);
      }
    } else {
      if (cachedData[page]) {
        setCatData(Object.values(cachedData).flat());
        return;
      }
      setIsLoadingMore(true);
      try {
        const response = await categoryApi.getCategory({ page: `${page}` });
        const { data } = response.data;
        if (data && Array.isArray(data.data)) {
          setCachedData(prev => ({
            ...prev,
            [page]: data.data
          }));
          setCatData(Object.values({ ...cachedData, [page]: data.data }).flat());
          if (page > catCurrentPage) {
            dispatch(setCateData([...cateData, ...data.data]));
            dispatch(setCatCurrentPage(data?.current_page));
            dispatch(setCatLastPage(data?.last_page));
          }
          setLastPage(data.last_page);
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
        toast.error("Failed to load categories");
      } finally {
        setIsLoading(false);
        setIsLoadingMore(false);
      }
    }
  }, [prevLang?.id, currentLanguage?.id, catCurrentPage, dispatch, cateData]);

  useEffect(() => {
    getCategoriesData(1);
  }, [currentLanguage, getCategoriesData]);

  useEffect(() => {
    if (prevLang?.id !== currentLanguage?.id) {
      setPrevLang(currentLanguage);
      setCachedData({});
      setCatData([]);
      setCurrentPage(1);
      setLastPage(1);
      setIsLoading(true);
    }
  }, [currentLanguage, prevLang?.id]);

  const handleNextPage = useCallback(() => {
    if (currentPage < lastPage) {
      const nextPage = currentPage + 1;
      setCurrentPage(nextPage);
      getCategoriesData(nextPage);
    }
    if (swiperRef?.current) swiperRef?.current?.slideNext();
  }, [currentPage, lastPage, getCategoriesData]);

  const handlePrevPage = useCallback(() => {
    if (currentPage > 1) {
      const prevPage = currentPage - 1;
      setCurrentPage(prevPage);
      getCategoriesData(prevPage);
    }
    if (swiperRef?.current) swiperRef?.current?.slidePrev();
  }, [currentPage, getCategoriesData]);

  const handleLoadMore = useCallback(() => {
    if (currentPage < lastPage && !isLoadingMore) {
      const nextPage = currentPage + 1;
      setCurrentPage(nextPage);
      getCategoriesData(nextPage);
    }
  }, [currentPage, lastPage, isLoadingMore, getCategoriesData]);

  const handleSlideChange = useCallback((swiper) => {
    setIsEnd(swiper.isEnd);
    setIsBeginning(swiper.isBeginning);
    if (swiper.isEnd) {
      handleLoadMore();
    }
  }, [handleLoadMore]);

  const breakpoints = {
    0: { slidesPerView: 1, spaceBetween: 10 },
    320: { slidesPerView: 3, spaceBetween: 15 },
    400: { slidesPerView: 3, spaceBetween: 15 },
    576: { slidesPerView: 4, spaceBetween: 20 },
    768: { slidesPerView: 5, spaceBetween: 20 },
    992: { slidesPerView: 7, spaceBetween: 25 },
    1200: { slidesPerView: 8, spaceBetween: 30 },
    1400: { slidesPerView: 9, spaceBetween: 30 }
  };

  if (isLoading) {
    return <PopularCategoriesSkeleton />;
  }

  if (!cateData?.length) {
    return null;
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="container main_padding"
    >
      <div className="row mrg_btm">
        <div className="col-12">
          <div className="pop_cat_header">
            <motion.h4 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="pop_cat_head"
            >
              {t("popularCategories")}
            </motion.h4>

            <div className="pop_cat_arrow">
              <button
                className={`pop_cat_btns ${isBeginning ? "PagArrowdisabled" : ""}`}
                onClick={handlePrevPage}
                disabled={isBeginning}
                aria-label="Previous categories"
              >
                <RiArrowLeftLine size={24} color="white" />
              </button>
              <button
                className={`pop_cat_btns ${isEnd ? "PagArrowdisabled" : ""}`}
                onClick={handleNextPage}
                disabled={isEnd}
                aria-label="Next categories"
              >
                <RiArrowRightLine size={24} color="white" />
              </button>
            </div>
          </div>
        </div>
      </div>
      <div className="row">
        <div className="col-12">
          <Swiper
            dir={isRtl ? "rtl" : "ltr"}
            spaceBetween={30}
            slidesPerView={9}
            onSlideChange={handleSlideChange}
            onSwiper={(swiper) => {
              swiperRef.current = swiper;
              setIsEnd(swiper?.isEnd);
              setIsBeginning(swiper?.isBeginning);
            }}
            breakpoints={breakpoints}
            className="popular_cat_slider"
            key={isRtl}
          >
            <AnimatePresence>
              {cateData?.map((ele, index) => (
                <SwiperSlide key={ele.id || index}>
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <PopularCategory data={ele} />
                  </motion.div>
                </SwiperSlide>
              ))}
            </AnimatePresence>
          </Swiper>
        </div>
      </div>
    </motion.div>
  );
});

PopularCategories.displayName = 'PopularCategories';

export default PopularCategories;